import * as THREE from 'three'
import {
  getWindowRects,
  makeBroadLeafGeometryVariants,
  makeLeafGeometryVariants,
  makeWillowLeafGeometryVariants,
} from './shadowFoliage'
import { addCanopy, addRect, addSprig, makeCasterMaterial } from './shadowCanopy'
import type { ShadowMapMode } from './shadowMapModes'
import type { ShadowSettings } from './shadowSettings'

function addWindow(scene: THREE.Scene, settings: ShadowSettings, strength = 1) {
  for (const rect of getWindowRects(settings.density, settings.scale)) {
    addRect(scene, rect.x, rect.y, rect.width, rect.height, rect.depth, rect.rotation, strength)
  }
}

// An inverse caster: a translucent wall covers the page while a skewed window
// aperture stays open, so the hole reads as a warm patch of floor light.
function addLightPool(scene: THREE.Scene, leafGeometries: THREE.BufferGeometry[], settings: ShadowSettings) {
  const pool = new THREE.Group()
  pool.name = 'lightpool'
  const scale = settings.scale / 1.4
  const wallStrength = 0.34
  const wallDepth = 0.22

  const wall = new THREE.Shape()
  wall.moveTo(-4, -4)
  wall.lineTo(4, -4)
  wall.lineTo(4, 4)
  wall.lineTo(-4, 4)
  wall.closePath()

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

  pool.add(new THREE.Mesh(new THREE.ShapeGeometry(wall), makeCasterMaterial(wallDepth, wallStrength)))

  const midpoint = (a: [number, number], b: [number, number]): [number, number] => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ]
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

// A segmented gnomon shadow whose pivot and length are animated by the live
// sun angle in V2ShadowLayer's render frame.
function addSundial(scene: THREE.Scene, settings: ShadowSettings) {
  const sundial = new THREE.Group()
  sundial.name = 'sundial'
  const shaftSegments = [
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

  const finial = new THREE.Mesh(new THREE.CircleGeometry(1, 32), makeCasterMaterial(0.28))
  finial.position.set(0, -1.06, 0)
  finial.scale.set(0.034, 0.034, 1)
  sundial.add(finial)
  sundial.position.set(-0.05, 1.0, 0)
  sundial.scale.setScalar(1.15 * settings.scale)
  sundial.userData = { baseScale: 1.15 * settings.scale }
  scene.add(sundial)

  const plate = new THREE.Mesh(new THREE.CircleGeometry(1, 48), makeCasterMaterial(0.06, 0.8))
  plate.position.set(-0.05, 1.0, 0)
  plate.scale.set(0.34 * settings.scale, 0.05 * settings.scale, 1)
  scene.add(plate)
}

export function buildSourceScene(mode: ShadowMapMode, settings: ShadowSettings) {
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

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) object.renderOrder = 1
  })
  return scene
}
