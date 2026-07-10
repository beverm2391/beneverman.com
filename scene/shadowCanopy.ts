import * as THREE from 'three'
import { canopyClumps, getDensityCount, stableNoise } from './shadowFoliage'
import type { CanopyStyle } from './shadowMapModes'
import type { ShadowSettings } from './shadowSettings'

export function makeCasterMaterial(depth: number, strength = 1) {
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

function addLeaf(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  x: number,
  y: number,
  length: number,
  width: number,
  depth: number,
  rotation: number,
  strength = 1,
) {
  const leaf = new THREE.Mesh(geometry, makeCasterMaterial(depth, strength))
  leaf.position.set(x, y, 0)
  leaf.rotation.z = rotation
  leaf.scale.set(length, width, 1)
  parent.add(leaf)
}

export function addRect(
  parent: THREE.Object3D,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  rotation = 0,
  strength = 1,
) {
  const rect = new THREE.Mesh(new THREE.PlaneGeometry(width, height), makeCasterMaterial(depth, strength))
  rect.position.set(x, y, 0)
  rect.rotation.z = rotation
  parent.add(rect)
}

// A short twig with alternating leaflets shrinking toward its terminal leaf.
export function addSprig(
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

    // Offset the leaf center so its base overlaps the supporting twig.
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

type CanopyStyleParams = {
  boughsPerClump: number
  childThree: number
  droop: number
  forkSpray: number
  leafletSize: [number, number]
  lengthKeep: [number, number]
  maxLevel: number
  rootLength: [number, number]
  rootThickness: number
  tipSkip: number
}

const canopyStyleParams: Record<CanopyStyle, CanopyStyleParams> = {
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
  const hangDown = -Math.PI / 2
  const droopedAngle = angle + (hangDown - angle) * params.droop * Math.min(1, level * 0.5)
  const endX = x + Math.cos(droopedAngle) * length
  const endY = y + Math.sin(droopedAngle) * length
  const depth = Math.min(0.9, Math.max(0.04, 0.11 - level * 0.02) + depthBias)
  addRect(parent, (x + endX) / 2, (y + endY) / 2, length, thickness, depth, droopedAngle, strength)

  if (level >= params.maxLevel || thickness < 0.006) {
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

// Each clump is independently animated, while recursive boughs keep every
// twig connected to a limb and preserve dappled gaps between foliage.
export function addCanopy(
  scene: THREE.Scene,
  leafGeometries: THREE.BufferGeometry[],
  settings: ShadowSettings,
  strength = 1,
) {
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
      const entryAngle = clump.tilt + bough * (0.9 + (stableNoise(boughSeed) - 0.5) * 0.5)
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
