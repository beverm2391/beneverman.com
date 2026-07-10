// loc-check: limit 848 | warn: 400 | reason: Temporary ceiling for the ported Three.js caster renderer; split source-scene construction without changing visuals
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { emitDebugTimelineEvent } from './debugTimeline'
import {
  canopyClumps,
  getDensityCount,
  getWindowRects,
  makeBroadLeafGeometryVariants,
  makeLeafGeometryVariants,
  makeWillowLeafGeometryVariants,
  stableNoise,
} from './shadowFoliage'
import type { CanopyStyle, ShadowMapMode } from './shadowMapModes'
import { publishShadowSourcePreview, type ShadowSourceSamplerPoint } from './shadowSourcePreview'
import shadowFragmentShader from './shaders/shadow.frag.glsl'
import shadowVertexShader from './shaders/shadow.vert.glsl'

export type ShadowSettings = {
  blindStrength: number
  canopyStrength: number
  canopyStyle: CanopyStyle
  contrast: number
  crispness: number
  density: number
  depthMix: number
  layerSpread: number
  // warm light projected where casters don't block the sun (0 = shadows only)
  lightGlow: number
  // visible shafts of light raymarched through the caster map toward the sun
  lightRays: number
  opacity: number
  // lateral scatter of the ray march: 0 = crisp beams, 1 = wide soft bloom
  rayDiffusion: number
  resolution: number
  sampleCount: number
  samplerX: number
  samplerY: number
  scale: number
  speed: number
  sunAngle: number
  // wind sway amplitude (mesh animation + UV warp); not a shadow weight --
  // per-layer darkness lives in blindStrength/canopyStrength
  wind: number
}

const maxShadowTextureDpr = 1.5
const maxShadowTextureSize = 1920
// The kernel constants below (diskSize, min/max caster size) are tuned in
// texels of the legacy caster map (dpr capped at 1, 960px cap). Higher-res
// maps convert them through kernelScale so added resolution buys edge
// granularity without changing the blur's on-screen size.
const kernelBaselineDpr = 1
const kernelBaselineSize = 960
const diskSize = 80
const diskSamples = 100
const minShadowCasterSize = 20
const maxShadowCasterSize = 300
const desktopShadowAspect = 16 / 9
const rigidWarpModes = new Set<ShadowMapMode>(['window', 'mixed', 'pool', 'sundial', 'sun'])

function getShadowTextureSize(width: number, height: number, resolution: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxShadowTextureDpr)
  const maxTextureSize = maxShadowTextureSize * Math.max(0.25, resolution)
  const scale = Math.min(1, maxTextureSize / Math.max(width * dpr, height * dpr))
  const textureWidth = Math.max(1, Math.round(width * dpr * scale))

  // What the map width would have been under the legacy sizing the kernel
  // constants were tuned against; the ratio rescales kernel texel sizes so
  // the penumbra keeps its on-screen proportions on every device.
  const legacyDpr = Math.min(window.devicePixelRatio || 1, kernelBaselineDpr)
  const legacyScale = Math.min(
    1,
    (kernelBaselineSize * Math.max(0.25, resolution)) / Math.max(width * legacyDpr, height * legacyDpr),
  )
  const legacyWidth = Math.max(1, Math.round(width * legacyDpr * legacyScale))

  return {
    height: Math.max(1, Math.round(height * dpr * scale)),
    kernelScale: textureWidth / legacyWidth,
    width: textureWidth,
  }
}

function getSourceCameraVerticalSpan(width: number, height: number) {
  const aspect = width / Math.max(1, height)
  if (aspect >= desktopShadowAspect) return 1

  return Math.min(1.55, 1 + (desktopShadowAspect / Math.max(0.1, aspect) - 1) * 0.18)
}

function makeCasterMaterial(depth: number, strength = 1) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(
      Math.max(0, Math.min(1, depth)),
      1,
      Math.max(0, Math.min(1, strength)),
    ),
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
}

function addLeaf(parent: THREE.Object3D, geometry: THREE.BufferGeometry, x: number, y: number, length: number, width: number, depth: number, rotation: number, strength = 1) {
  const leaf = new THREE.Mesh(geometry, makeCasterMaterial(depth, strength))
  leaf.position.set(x, y, 0)
  leaf.rotation.z = rotation
  leaf.scale.set(length, width, 1)
  parent.add(leaf)
}

function addRect(parent: THREE.Object3D, x: number, y: number, width: number, height: number, depth: number, rotation = 0, strength = 1) {
  const rect = new THREE.Mesh(new THREE.PlaneGeometry(width, height), makeCasterMaterial(depth, strength))
  rect.position.set(x, y, 0)
  rect.rotation.z = rotation
  parent.add(rect)
}

// A leaf spray: a short twig with alternating leaflets shrinking toward the
// terminal leaf at the tip. Foliage shadows read as sprays attached to
// structure, not as isolated leaves floating in space.
function addSprig(
  parent: THREE.Object3D,
  leafGeometries: THREE.BufferGeometry[],
  x: number,
  y: number,
  angle: number,
  leafletSize: number,
  depth: number,
  strength: number,
  seed: number,
) {
  const sprig = new THREE.Group()
  sprig.position.set(x, y, 0)
  sprig.rotation.z = angle

  const leafletCount = 4 + Math.round(stableNoise(seed + 21) * 2)
  const twigLength = leafletSize * leafletCount * 0.62

  addRect(sprig, twigLength * 0.5, 0, twigLength, leafletSize * 0.09, Math.min(0.9, depth + 0.04), 0, strength)

  for (let index = 0; index <= leafletCount; index += 1) {
    // oak habit: leaves cluster toward the twig tip and fan outward, rather
    // than alternating evenly like a fern frond
    const fan = leafletCount === 0 ? 0.5 : index / leafletCount
    const spreadAngle =
      (fan - 0.5) * (1.25 + stableNoise(seed + index * 5) * 0.45) +
      (stableNoise(seed + index * 11) - 0.5) * 0.4
    const attachT = 0.5 + fan * 0.5
    const baseX = twigLength * attachT
    const leafletLength = leafletSize * (0.85 + stableNoise(seed + index * 7) * 0.45)
    const rotation = spreadAngle + (stableNoise(seed + index * 19) - 0.5) * 0.5
    const geometry =
      leafGeometries[Math.floor(stableNoise(seed + index * 13) * leafGeometries.length) % leafGeometries.length]

    // the leaf base (geometry x = -1) must land on the twig: offset the mesh
    // center along its own rotation, slightly under one leaf-length, so the
    // base overlaps the twig instead of floating beside it
    addLeaf(
      sprig,
      geometry,
      baseX + Math.cos(rotation) * leafletLength * 0.92,
      Math.sin(rotation) * leafletLength * 0.92,
      leafletLength,
      leafletLength * (0.4 + stableNoise(seed + index * 17) * 0.14),
      depth,
      rotation,
      strength,
    )
  }

  parent.add(sprig)
}

// Aesthetic parameterizations for the bough generator. All three aim for a
// calm, real-life read: airier than a full canopy, with light moving through
// gaps. Chosen from the debug panel via settings.canopyStyle.
type CanopyStyleParams = {
  boughsPerClump: number
  // probability a fork spawns a third child
  childThree: number
  // per-level pull of branch angles toward hanging down (0 = none)
  droop: number
  // chance of a small leaf spray at interior forks
  forkSpray: number
  leafletSize: [number, number]
  lengthKeep: [number, number]
  maxLevel: number
  rootLength: [number, number]
  rootThickness: number
  // chance a terminal tip stays bare (dappled light gaps)
  tipSkip: number
}

const canopyStyleParams: Record<CanopyStyle, CanopyStyleParams> = {
  // recognizable oak: forking limbs, notched leaves, moderate coverage
  oak: {
    boughsPerClump: 2,
    childThree: 0.3,
    droop: 0,
    forkSpray: 0.28,
    leafletSize: [0.03, 0.02],
    lengthKeep: [0.56, 0.18],
    maxLevel: 3,
    rootLength: [0.45, 0.18],
    rootThickness: 0.018,
    tipSkip: 0.3,
  },
  // one long limb per clump sagging under gravity, slender leaves -- the
  // classic calm branch-in-the-breeze silhouette
  willow: {
    boughsPerClump: 1,
    childThree: 0.15,
    droop: 0.3,
    forkSpray: 0.15,
    leafletSize: [0.042, 0.02],
    lengthKeep: [0.66, 0.16],
    maxLevel: 4,
    rootLength: [0.55, 0.2],
    rootThickness: 0.014,
    tipSkip: 0.12,
  },
  // a few broad-leafed twigs and lots of air
  sparse: {
    boughsPerClump: 1,
    childThree: 0,
    droop: 0.1,
    forkSpray: 0.1,
    leafletSize: [0.05, 0.025],
    lengthKeep: [0.6, 0.15],
    maxLevel: 2,
    rootLength: [0.4, 0.15],
    rootThickness: 0.013,
    tipSkip: 0.15,
  },
}

// A connected bough, grown recursively: each segment starts exactly at its
// parent's endpoint and either forks into thinner children or terminates in
// a leaf spray. Connectivity is by construction -- the previous scattered
// sprigs used half-length stems aimed at the clump core, which left visibly
// floating branches once the caster map got sharp enough to show it.
function addBough(
  parent: THREE.Object3D,
  leafGeometries: THREE.BufferGeometry[],
  settings: ShadowSettings,
  params: CanopyStyleParams,
  strength: number,
  seed: number,
  x: number,
  y: number,
  angle: number,
  length: number,
  thickness: number,
  depthBias: number,
  level: number,
) {
  // droop pulls each generation toward hanging straight down, like a limb
  // sagging under its own weight
  const hangDown = -Math.PI / 2
  const droopedAngle = angle + (hangDown - angle) * params.droop * Math.min(1, level * 0.5)
  const endX = x + Math.cos(droopedAngle) * length
  const endY = y + Math.sin(droopedAngle) * length
  // the red "depth" channel is a caster-size: every caster pixel renders as
  // a disk of that radius, so foliage must stay near-plane (~0.1) or the
  // blur dilates away silhouette detail. Thick parents sit slightly deeper.
  const depth = Math.min(0.9, Math.max(0.04, 0.11 - level * 0.02) + depthBias)
  addRect(parent, (x + endX) / 2, (y + endY) / 2, length, thickness, depth, droopedAngle, strength)

  if (level >= params.maxLevel || thickness < 0.006) {
    // terminal leaf spray continuing the branch line; skipping a fraction of
    // tips keeps dappled light gaps in the mass
    if (stableNoise(seed + 2) < params.tipSkip) return
    addSprig(
      parent,
      leafGeometries,
      endX,
      endY,
      droopedAngle + (stableNoise(seed + 3) - 0.5) * 0.9,
      (params.leafletSize[0] + stableNoise(seed + 5) * params.leafletSize[1]) * settings.scale,
      0.05 + stableNoise(seed + 7) * 0.06 + depthBias,
      strength,
      seed,
    )
    return
  }

  const childCount = stableNoise(seed + 11) < params.childThree ? 3 : 2
  for (let child = 0; child < childCount; child += 1) {
    const childSeed = seed + 131 + child * 379
    const fan = child / (childCount - 1) - 0.5
    addBough(
      parent,
      leafGeometries,
      settings,
      params,
      strength,
      childSeed,
      endX,
      endY,
      droopedAngle + fan * (0.85 + stableNoise(childSeed) * 0.5) + (stableNoise(childSeed + 1) - 0.5) * 0.3,
      length * (params.lengthKeep[0] + stableNoise(childSeed + 2) * params.lengthKeep[1]),
      Math.max(0.006, thickness * 0.62),
      depthBias,
      level + 1,
    )
  }

  // occasional leaf spray at the fork so foliage isn't only at the rim
  if (stableNoise(seed + 13) < params.forkSpray) {
    addSprig(
      parent,
      leafGeometries,
      endX,
      endY,
      droopedAngle + (stableNoise(seed + 17) - 0.5) * 2.4,
      (params.leafletSize[0] * 0.85 + stableNoise(seed + 19) * params.leafletSize[1]) * settings.scale,
      0.06 + stableNoise(seed + 23) * 0.05 + depthBias,
      strength,
      seed + 29,
    )
  }
}

// Real canopy shadows read as connected foliage masses with light dappled
// through gaps, not scattered individual leaves. Each clump is its own group
// (anchored mostly along the top edge, hanging into view) so the wind can
// sway them independently while the window blinds stay rigid. Inside a clump,
// boughs enter from the clump rim and branch recursively toward/through the
// center, so every twig traces back to a limb.
function addCanopy(scene: THREE.Scene, leafGeometries: THREE.BufferGeometry[], settings: ShadowSettings, strength = 1) {
  const canopy = new THREE.Group()
  canopy.name = 'canopy'
  const params = canopyStyleParams[settings.canopyStyle] ?? canopyStyleParams.oak

  canopyClumps.forEach((clump, clumpIndex) => {
    const group = new THREE.Group()
    group.position.set(clump.x, clump.y, 0)
    group.userData = { baseX: clump.x, baseY: clump.y, phase: clumpIndex * 1.7 }

    const baseSeed = 4200 + clumpIndex * 733
    const boughCount = getDensityCount(params.boughsPerClump, settings.density)

    for (let bough = 0; bough < boughCount; bough += 1) {
      const boughSeed = baseSeed + bough * 389
      // enter from the clump rim aimed through the center, fanning subsequent
      // boughs off the clump's tilt so limbs cross the mass at varied angles
      const entryAngle =
        clump.tilt + bough * (0.9 + (stableNoise(boughSeed) - 0.5) * 0.5)
      addBough(
        group,
        leafGeometries,
        settings,
        params,
        strength,
        boughSeed,
        -Math.cos(entryAngle) * clump.radius * 0.95,
        -Math.sin(entryAngle) * clump.radius * 0.95,
        entryAngle + (stableNoise(boughSeed + 7) - 0.5) * 0.35,
        clump.radius * (params.rootLength[0] + stableNoise(boughSeed + 3) * params.rootLength[1]) * settings.scale,
        params.rootThickness * settings.scale,
        clump.depthBias,
        0,
      )
    }

    canopy.add(group)
  })

  scene.add(canopy)
}

function addWindow(scene: THREE.Scene, settings: ShadowSettings, strength = 1) {
  for (const rect of getWindowRects(settings.density, settings.scale)) {
    addRect(scene, rect.x, rect.y, rect.width, rect.height, rect.depth, rect.rotation, strength)
  }
}

// Light pool: the inverse of every other scene. Instead of casters scattered
// on clean paper, a translucent "wall" covers the whole page with one
// window-shaped aperture cut out, so the unshadowed hole reads as a warm
// patch of sunlight lying on the floor -- how a real room actually looks.
// Muntin bars cross the aperture so the pool reads as a window, and a single
// sprig intrudes on one corner for life. useFrame slides the whole group
// horizontally with the animated sun.
function addLightPool(scene: THREE.Scene, leafGeometries: THREE.BufferGeometry[], settings: ShadowSettings) {
  const pool = new THREE.Group()
  pool.name = 'lightpool'

  // authored against the default preset scale (1.4); normalize so the scale
  // slider grows/shrinks the aperture around the same composition
  const scale = settings.scale / 1.4
  // wall strength stays low: the entire text ground sits under this wash, so
  // it must darken gently -- the pool's brightness is contrast, not glare
  const wallStrength = 0.34
  const wallDepth = 0.22

  const wall = new THREE.Shape()
  wall.moveTo(-4, -4)
  wall.lineTo(4, -4)
  wall.lineTo(4, 4)
  wall.lineTo(-4, 4)
  wall.closePath()

  // perspective-skewed window projection on the left -- nudged right just
  // enough that the whole aperture stays inside the frame -- so the text
  // column sits on the calm wash while the pool anchors the open side
  const corners: [number, number][] = [
    [0.02 * scale + 0.1, -0.86 * scale - 0.04],
    [-0.84 * scale + 0.1, -0.68 * scale - 0.04],
    [-1.0 * scale + 0.1, 0.5 * scale - 0.04],
    [-0.16 * scale + 0.1, 0.32 * scale - 0.04],
  ]
  const hole = new THREE.Path()
  hole.moveTo(corners[0][0], corners[0][1])
  for (const [x, y] of corners.slice(1)) hole.lineTo(x, y)
  hole.closePath()
  wall.holes.push(hole)

  const wallMesh = new THREE.Mesh(new THREE.ShapeGeometry(wall), makeCasterMaterial(wallDepth, wallStrength))
  pool.add(wallMesh)

  // muntin bars connect opposite edge midpoints so the four panes track the
  // aperture's skew instead of sitting axis-aligned inside it
  const midpoint = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const addBar = (from: [number, number], to: [number, number]) => {
    const length = Math.hypot(to[0] - from[0], to[1] - from[1])
    addRect(
      pool,
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2,
      length,
      0.045 * scale,
      wallDepth - 0.06,
      Math.atan2(to[1] - from[1], to[0] - from[0]),
      wallStrength + 0.2,
    )
  }
  addBar(midpoint(corners[0], corners[1]), midpoint(corners[2], corners[3]))
  addBar(midpoint(corners[1], corners[2]), midpoint(corners[3], corners[0]))

  // one leaf spray hanging into the pool's top corner: the small proof that
  // there is a world outside the window
  addSprig(
    pool,
    leafGeometries,
    corners[3][0] - 0.04,
    corners[3][1] + 0.05,
    -2.3,
    0.05 * settings.scale,
    0.1,
    wallStrength + 0.28,
    9001,
  )

  scene.add(pool)
}

// Sheer curtain: one solid translucent sheet pinned to the left screen edge,
// its free edge billowing like the end of a flag. The panel is a single
// caster with uniform strength (the page reads through it), so all the life
// is in the silhouette: useFrame displaces the plane's vertices with a wave
// that ramps from zero at the pinned edge to full at the free end.
// Sundial: a slender gnomon spike whose shadow pivots around its base as the
// animated sun sweeps the day -- the one scene where the sun's movement over
// time is unmistakable. The silhouette is the gnomon's cast shadow: a long
// tapering wedge, crisp at the ground and blurring toward the tip (r-channel
// height climbs with distance from the base), with a small finial ball. A
// fixed dial-plate sliver at the base stays put while the shadow rotates.
//
// The display path mirrors scene y (the caster map is sampled with a flipped
// v), so the spike is authored extending local -y from the group origin and
// anchored at scene y=+1 to sit on the screen's bottom edge. Rotations negate
// under the same mirror.
function addSundial(scene: THREE.Scene, settings: ShadowSettings) {
  const sundial = new THREE.Group()
  sundial.name = 'sundial'

  // tapering shaft in three segments so the depth (blur) can ramp with
  // height; a single shape would blur uniformly
  const shaftSegments: { depth: number; fromWidth: number; fromY: number; toWidth: number; toY: number }[] = [
    { depth: 0.05, fromWidth: 0.085, fromY: 0, toWidth: 0.055, toY: -0.42 },
    { depth: 0.13, fromWidth: 0.055, fromY: -0.42, toWidth: 0.032, toY: -0.76 },
    { depth: 0.22, fromWidth: 0.032, fromY: -0.76, toWidth: 0.009, toY: -1.0 },
  ]
  for (const segment of shaftSegments) {
    const shape = new THREE.Shape()
    shape.moveTo(-segment.fromWidth / 2, segment.fromY)
    shape.lineTo(segment.fromWidth / 2, segment.fromY)
    shape.lineTo(segment.toWidth / 2, segment.toY)
    shape.lineTo(-segment.toWidth / 2, segment.toY)
    shape.closePath()
    sundial.add(new THREE.Mesh(new THREE.ShapeGeometry(shape), makeCasterMaterial(segment.depth)))
  }

  // finial ball floating just past the tip
  const finial = new THREE.Mesh(new THREE.CircleGeometry(1, 32), makeCasterMaterial(0.28))
  finial.position.set(0, -1.06, 0)
  finial.scale.set(0.034, 0.034, 1)
  sundial.add(finial)

  // rotation in useFrame pivots about the group origin, i.e. where the
  // gnomon meets the dial at the bottom of the frame
  sundial.position.set(-0.05, 1.0, 0)
  sundial.scale.setScalar(1.15 * settings.scale)
  sundial.userData = { baseScale: 1.15 * settings.scale }

  scene.add(sundial)

  // the dial plate's own shadow does not rotate with the gnomon's: a flat
  // ellipse sliver fixed to the scene grounds the pivot at the frame edge
  const plate = new THREE.Mesh(new THREE.CircleGeometry(1, 48), makeCasterMaterial(0.06, 0.8))
  plate.position.set(-0.05, 1.0, 0)
  plate.scale.set(0.34 * settings.scale, 0.05 * settings.scale, 1)
  scene.add(plate)
}

function buildSourceScene(mode: ShadowMapMode, settings: ShadowSettings) {
  const scene = new THREE.Scene()
  const leafGeometries =
    settings.canopyStyle === 'willow'
      ? makeWillowLeafGeometryVariants()
      : settings.canopyStyle === 'sparse'
        ? makeBroadLeafGeometryVariants()
        : makeLeafGeometryVariants()
  if (mode === 'canopy') addCanopy(scene, leafGeometries, settings)
  if (mode === 'window') addWindow(scene, settings)
  if (mode === 'mixed') {
    addWindow(scene, settings, settings.blindStrength)
    addCanopy(scene, leafGeometries, settings, settings.canopyStrength)
  }
  if (mode === 'pool') addLightPool(scene, leafGeometries, settings)
  if (mode === 'sundial') addSundial(scene, settings)
  // 'sun' builds nothing: clean paper, background glow only -- the floor of
  // minimal, kept as a selectable reference point

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) object.renderOrder = 1
  })

  return scene
}

function sampleShadowSource(imageData: ImageData, settings: ShadowSettings, kernelScale = 1) {
  const { data, height, width } = imageData
  const sampleX = width * settings.samplerX
  const sampleY = height * settings.samplerY
  const lightDirectionX = Math.cos(settings.sunAngle)
  const lightDirectionY = -Math.sin(settings.sunAngle)
  const lightPerpendicularX = -lightDirectionY
  const lightPerpendicularY = lightDirectionX
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const points: ShadowSourceSamplerPoint[] = []
  let shadowInfluence = 0
  let contributingSamples = 0
  const activeSamples = Math.max(1, Math.min(diskSamples, Math.round(settings.sampleCount)))
  const sampleDiskSize = (diskSize * kernelScale) / Math.max(0.25, settings.crispness)

  for (let index = 1; index <= activeSamples; index += 1) {
    const radius = sampleDiskSize * Math.sqrt(index / activeSamples)
    const theta = index * goldenAngle
    const offsetX = radius * Math.cos(theta)
    const offsetY = radius * Math.sin(theta)
    const projectedAlong = Math.abs(offsetY) * 1.35 + radius * 0.18
    const projectedAcross = offsetX * 0.42
    const rotatedOffsetX = lightDirectionX * projectedAlong + lightPerpendicularX * projectedAcross
    const rotatedOffsetY = lightDirectionY * projectedAlong + lightPerpendicularY * projectedAcross
    const x = Math.min(width - 1, Math.max(0, Math.round(sampleX + rotatedOffsetX)))
    const y = Math.min(height - 1, Math.max(0, Math.round(sampleY + rotatedOffsetY)))
    const pixelIndex = (y * width + x) * 4
    const red = data[pixelIndex]
    const green = data[pixelIndex + 1]
    const hitCaster = red > 0 && green === 255
    const casterSize = hitCaster
      ? (red / 255) * (maxShadowCasterSize - minShadowCasterSize) + minShadowCasterSize
      : 0
    const crispCasterSize = (casterSize * kernelScale) / Math.max(0.25, settings.crispness)
    const contributes = hitCaster && crispCasterSize / 2 >= radius

    if (contributes) {
      const sourceStrength = data[pixelIndex + 2] / 255
      shadowInfluence += (8 + (0.5 - 8) * (crispCasterSize / (maxShadowCasterSize * kernelScale))) * sourceStrength
      contributingSamples += 1
    }

    points.push({
      casterSize: crispCasterSize,
      contributes,
      hitCaster,
      x,
      y,
    })
  }

  return {
    contributingSamples,
    points,
    sampleX,
    sampleY,
    shadowFactor: Math.min(0.96, Math.max(0, (shadowInfluence / activeSamples) * settings.contrast)),
  }
}

function createPreviewDataUrl(pixels: Uint8Array, width: number, height: number) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return undefined

  canvas.width = width
  canvas.height = height

  const flipped = new Uint8ClampedArray(pixels.length)
  const rowSize = width * 4
  for (let row = 0; row < height; row += 1) {
    const sourceStart = (height - row - 1) * rowSize
    const targetStart = row * rowSize
    flipped.set(pixels.slice(sourceStart, sourceStart + rowSize), targetStart)
  }

  context.putImageData(new ImageData(flipped, width, height), 0, 0)
  return {
    dataUrl: canvas.toDataURL('image/png'),
    imageData: context.getImageData(0, 0, width, height),
  }
}

function SourceSceneShadowPlane({ crispnessScale, mode, settings, shadowTint, showSource, sunAngle }: { crispnessScale: number; mode: ShadowMapMode; settings: ShadowSettings; shadowTint: readonly [number, number, number]; showSource: boolean; sunAngle: number }) {
  const { gl, size } = useThree()
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const previewKeyRef = useRef('')
  const { height: textureHeight, kernelScale, width: textureWidth } = getShadowTextureSize(size.width, size.height, settings.resolution)
  const sourceCameraVerticalSpan = getSourceCameraVerticalSpan(size.width, size.height)
  const sourceCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10), [])
  const sourceScene = useMemo(() => buildSourceScene(mode, settings), [mode, settings])
  const renderTarget = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(textureWidth, textureHeight, {
      depthBuffer: false,
      format: THREE.RGBAFormat,
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
      stencilBuffer: false,
      type: THREE.UnsignedByteType,
    })
    target.texture.colorSpace = THREE.NoColorSpace
    target.texture.generateMipmaps = false

    return target
  }, [textureHeight, textureWidth])
  const uniforms = useMemo(
    () => ({
      hSize: { value: textureHeight },
      uAnimationSpeed: { value: settings.speed },
      uAnimationStrength: { value: settings.wind },
      uDepthMix: { value: settings.depthMix },
      uEdgeCrispness: { value: settings.crispness },
      uKernelScale: { value: kernelScale },
      uLayerSpread: { value: settings.layerSpread },
      uLightGlow: { value: settings.lightGlow },
      uLightRays: { value: settings.lightRays },
      uOpacity: { value: settings.opacity },
      uRayDiffusion: { value: settings.rayDiffusion },
      uSampleCount: { value: settings.sampleCount },
      uShadowContrast: { value: settings.contrast },
      uShadowTint: { value: [...shadowTint] },
      uShowSource: { value: 0 },
      uSunAngle: { value: settings.sunAngle },
      uTexture: { value: renderTarget.texture },
      uTime: { value: 0 },
      // rigid modes get zero texture warp: blinds must stay straight, and the
      // pool/tower scenes move via authored useFrame animation instead --
      // a UV-warped sundial or light patch reads as jelly, not sunlight
      uWarpStrength: { value: rigidWarpModes.has(mode) ? 0 : 1 },
      wSize: { value: textureWidth },
    }),
    [kernelScale, mode, renderTarget.texture, settings.contrast, settings.crispness, settings.depthMix, settings.layerSpread, settings.lightGlow, settings.lightRays, settings.opacity, settings.rayDiffusion, settings.sampleCount, settings.speed, settings.wind, settings.sunAngle, textureHeight, textureWidth],
  )

  useEffect(() => {
    sourceCamera.top = sourceCameraVerticalSpan
    sourceCamera.bottom = -sourceCameraVerticalSpan
    sourceCamera.left = -1
    sourceCamera.right = 1
    sourceCamera.position.set(0, 0, 2)
    sourceCamera.lookAt(0, 0, 0)
    sourceCamera.updateProjectionMatrix()
  }, [sourceCamera, sourceCameraVerticalSpan])

  useEffect(() => () => renderTarget.dispose(), [renderTarget])

  useFrame(({ clock }) => {
    const animatedTime = clock.elapsedTime * settings.speed
    const canopyGroup = sourceScene.getObjectByName('canopy')
    const sundialGroup = sourceScene.getObjectByName('sundial')
    const poolGroup = sourceScene.getObjectByName('lightpool')

    if (canopyGroup) {
      // Hierarchical wind: each foliage clump sways with its own phase --
      // slow large motion plus a faster small flutter -- while everything
      // else in the scene (window blinds, frame) stays rigid.
      for (const clump of canopyGroup.children) {
        const { baseX, baseY, phase } = clump.userData
        clump.rotation.z =
          Math.sin(animatedTime * 0.32 + phase) * 0.024 * settings.wind +
          Math.sin(animatedTime * 0.86 + phase * 2.3) * 0.009 * settings.wind
        clump.position.x = baseX + Math.sin(animatedTime * 0.21 + phase) * 0.016 * settings.wind
        clump.position.y = baseY + Math.cos(animatedTime * 0.27 + phase * 1.4) * 0.009 * settings.wind
      }
    } else if (sundialGroup) {
      // sundial: pivot the gnomon's shadow about its base opposite the sun's
      // travel, long at sunrise/sunset and short at noon. sunAngle is the
      // live animated angle, so the shadow visibly sweeps over the day.
      // Scene rotation is the negative of the on-screen rotation because of
      // the display mirror described in addSundial. 0.72 keeps the sweep
      // inside the frame: a physically flat sunrise shadow would lie along
      // the bottom edge where nothing can see it.
      const elevation = Math.max(0, Math.sin(sunAngle))
      sundialGroup.rotation.z = (sunAngle - Math.PI / 2) * 0.72
      sundialGroup.scale.y = sundialGroup.userData.baseScale * (1.55 - 0.75 * elevation)
    } else if (poolGroup) {
      // the light patch creeps across the floor opposite the sun's travel,
      // slow enough that it stays essentially inside the frame all day
      poolGroup.position.x = (sunAngle - settings.sunAngle) * 0.1
    } else {
      sourceScene.position.x = Math.sin(animatedTime * 0.16) * 0.035 * settings.wind
      sourceScene.position.y = Math.cos(animatedTime * 0.12) * 0.025 * settings.wind
      sourceScene.rotation.z = Math.sin(animatedTime * 0.08) * 0.018 * settings.wind
    }

    gl.setRenderTarget(renderTarget)
    gl.setClearColor(0x000000, 1)
    gl.clear()
    gl.render(sourceScene, sourceCamera)
    gl.setRenderTarget(null)
    // restore the transparent clear for the visible pass: the fullscreen
    // quad now carries per-pixel alpha, so an opaque black clear would show
    // through everywhere the page should be bare paper
    gl.setClearColor(0xf2f0ee, 0)

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime
      materialRef.current.uniforms.uAnimationSpeed.value = settings.speed
      materialRef.current.uniforms.uAnimationStrength.value = settings.wind
      materialRef.current.uniforms.uDepthMix.value = settings.depthMix
      materialRef.current.uniforms.uEdgeCrispness.value = settings.crispness * crispnessScale
      materialRef.current.uniforms.uKernelScale.value = kernelScale
      materialRef.current.uniforms.uLayerSpread.value = settings.layerSpread
      materialRef.current.uniforms.uLightGlow.value = settings.lightGlow
      materialRef.current.uniforms.uLightRays.value = settings.lightRays
      materialRef.current.uniforms.uOpacity.value = settings.opacity
      materialRef.current.uniforms.uRayDiffusion.value = settings.rayDiffusion
      materialRef.current.uniforms.uSampleCount.value = settings.sampleCount
      materialRef.current.uniforms.uShadowContrast.value = settings.contrast
      materialRef.current.uniforms.uShadowTint.value = shadowTint
      materialRef.current.uniforms.uShowSource.value = showSource ? 1 : 0
      materialRef.current.uniforms.uSunAngle.value = sunAngle
      materialRef.current.uniforms.uWarpStrength.value = rigidWarpModes.has(mode) ? 0 : 1
    }

    const previewKey = [
      mode,
      textureWidth,
      textureHeight,
      settings.blindStrength,
      settings.canopyStrength,
      settings.contrast,
      settings.crispness,
      settings.density,
      settings.sampleCount,
      settings.samplerX,
      settings.samplerY,
      settings.scale,
    ].join(':')

    if (previewKeyRef.current !== previewKey) {
      const pixels = new Uint8Array(textureWidth * textureHeight * 4)
      gl.readRenderTargetPixels(renderTarget, 0, 0, textureWidth, textureHeight, pixels)
      const preview = createPreviewDataUrl(pixels, textureWidth, textureHeight)

      if (preview) {
        publishShadowSourcePreview({
          dataUrl: preview.dataUrl,
          height: textureHeight,
          mode,
          sampler: sampleShadowSource(preview.imageData, settings, kernelScale),
          width: textureWidth,
        })
      }

      previewKeyRef.current = previewKey
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        depthTest={false}
        depthWrite={false}
        fragmentShader={shadowFragmentShader}
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={shadowVertexShader}
      />
    </mesh>
  )
}

// opacityScale is a separate prop (not folded into settings.opacity) so the
// per-frame day-cycle fade cannot change the settings object's identity --
// buildSourceScene memoizes on it and would rebuild the THREE scene every
// frame otherwise.
export default function V2ShadowLayer({ crispnessScale, mode, opacityScale, settings, shadowTint, showSource = false, sunAngle }: { crispnessScale: number; mode: ShadowMapMode; opacityScale: number; settings: ShadowSettings; shadowTint: readonly [number, number, number]; showSource?: boolean; sunAngle: number }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    emitDebugTimelineEvent('v2 source scene mounted')
  }, [])

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <div
      className={`daylight-shadow-layer ${isVisible ? 'is-visible' : ''}`}
      aria-hidden="true"
      // settings.opacity now lives inside the shader (uOpacity) so light and
      // shadow can carry per-pixel alpha; CSS only applies the day-cycle fade
      style={{ ['--shadow-opacity' as string]: showSource ? 1 : opacityScale }}
    >
      <Canvas
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0xf2f0ee, 0)
        }}
      >
        <SourceSceneShadowPlane crispnessScale={crispnessScale} mode={mode} settings={settings} shadowTint={shadowTint} showSource={showSource} sunAngle={sunAngle} />
      </Canvas>
    </div>
  )
}
