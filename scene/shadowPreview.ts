import type { ShadowSourceSamplerPoint } from './shadowSourcePreview'
import type { ShadowSettings } from './shadowSettings'

const diskSize = 80
const diskSamples = 100
const minShadowCasterSize = 20
const maxShadowCasterSize = 300

export function sampleShadowSource(imageData: ImageData, settings: ShadowSettings, kernelScale = 1) {
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

    points.push({ casterSize: crispCasterSize, contributes, hitCaster, x, y })
  }

  return {
    contributingSamples,
    points,
    sampleX,
    sampleY,
    shadowFactor: Math.min(0.96, Math.max(0, (shadowInfluence / activeSamples) * settings.contrast)),
  }
}

export function createPreviewDataUrl(pixels: Uint8Array, width: number, height: number) {
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
