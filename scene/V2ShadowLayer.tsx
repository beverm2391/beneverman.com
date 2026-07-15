import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { emitDebugTimelineEvent } from './debugTimeline'
import { createGpuFrameFence, type GpuFrameFence } from './primitives/gpuFrameFence'
import { createPreviewDataUrl, sampleShadowSource } from './shadowPreview'
import type { ShadowMapMode } from './shadowMapModes'
import type { ShadowSettings } from './shadowSettings'
import { hasShadowSourcePreviewListeners, publishShadowSourcePreview } from './shadowSourcePreview'
import { buildSourceScene } from './shadowSourceScene'
import shadowFragmentShader from './shaders/shadow.frag.glsl'
import shadowVertexShader from './shaders/shadow.vert.glsl'

export type { ShadowSettings } from './shadowSettings'

const maxShadowTextureDpr = 1.5
const maxShadowTextureSize = 1920
const kernelBaselineDpr = 1
const kernelBaselineSize = 960
const desktopShadowAspect = 16 / 9
const rigidWarpModes = new Set<ShadowMapMode>(['window', 'mixed', 'pool', 'sundial', 'sun'])

function getShadowTextureSize(width: number, height: number, resolution: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, maxShadowTextureDpr)
  const maxTextureSize = maxShadowTextureSize * Math.max(0.25, resolution)
  const scale = Math.min(1, maxTextureSize / Math.max(width * dpr, height * dpr))
  const textureWidth = Math.max(1, Math.round(width * dpr * scale))

  // Rescale the legacy kernel's texel sizes so extra texture resolution buys
  // edge detail without changing the penumbra's on-screen proportions.
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

type ShadowPlaneProps = {
  crispnessScale: number
  mode: ShadowMapMode
  onFirstFrame?: () => void
  opacityScale: number
  settings: ShadowSettings
  shadowTint: readonly [number, number, number]
  showSource: boolean
  sunAngle: number
}

function SourceSceneShadowPlane({
  crispnessScale,
  mode,
  onFirstFrame,
  opacityScale,
  settings,
  shadowTint,
  showSource,
  sunAngle,
}: ShadowPlaneProps) {
  const { gl, size } = useThree()
  const elapsedTimeRef = useRef(0)
  const frameCountRef = useRef(0)
  const firstFrameFenceRef = useRef<GpuFrameFence | null>(null)
  const hasSignaledLiveRef = useRef(false)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const previewKeyRef = useRef('')
  const { height: textureHeight, kernelScale, width: textureWidth } = getShadowTextureSize(
    size.width,
    size.height,
    settings.resolution,
  )
  const sourceCameraVerticalSpan = getSourceCameraVerticalSpan(size.width, size.height)
  const sourceCamera = useMemo(() => {
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10)
    camera.top = sourceCameraVerticalSpan
    camera.bottom = -sourceCameraVerticalSpan
    camera.position.set(0, 0, 2)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    return camera
  }, [sourceCameraVerticalSpan])
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
      uShadowTint: { value: [0, 0, 0] },
      uShowSource: { value: 0 },
      uSunAngle: { value: settings.sunAngle },
      uTexture: { value: renderTarget.texture },
      uTime: { value: 0 },
      uWarpStrength: { value: rigidWarpModes.has(mode) ? 0 : 1 },
      wSize: { value: textureWidth },
    }),
    [
      kernelScale,
      mode,
      renderTarget.texture,
      settings.contrast,
      settings.crispness,
      settings.depthMix,
      settings.layerSpread,
      settings.lightGlow,
      settings.lightRays,
      settings.opacity,
      settings.rayDiffusion,
      settings.sampleCount,
      settings.speed,
      settings.sunAngle,
      settings.wind,
      textureHeight,
      textureWidth,
    ],
  )

  useEffect(() => () => renderTarget.dispose(), [renderTarget])

  // These objects are private to this R3F scene. The frame callback is their
  // animation owner and mutates them immediately before Three renders them.
  useFrame((_, delta) => {
    elapsedTimeRef.current += delta
    const animatedTime = elapsedTimeRef.current * settings.speed
    const canopyGroup = sourceScene.getObjectByName('canopy')
    const sundialGroup = sourceScene.getObjectByName('sundial')
    const poolGroup = sourceScene.getObjectByName('lightpool')

    if (canopyGroup) {
      for (const clump of canopyGroup.children) {
        const { baseX, baseY, phase } = clump.userData
        clump.rotation.z =
          Math.sin(animatedTime * 0.32 + phase) * 0.024 * settings.wind +
          Math.sin(animatedTime * 0.86 + phase * 2.3) * 0.009 * settings.wind
        clump.position.x = baseX + Math.sin(animatedTime * 0.21 + phase) * 0.016 * settings.wind
        clump.position.y = baseY + Math.cos(animatedTime * 0.27 + phase * 1.4) * 0.009 * settings.wind
      }
    } else if (sundialGroup) {
      const elevation = Math.max(0, Math.sin(sunAngle))
      sundialGroup.rotation.z = (sunAngle - Math.PI / 2) * 0.72
      sundialGroup.scale.y = sundialGroup.userData.baseScale * (1.55 - 0.75 * elevation)
    } else if (poolGroup) {
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
    gl.setClearColor(0xf2f0ee, 0)

    if (materialRef.current) {
      const values = materialRef.current.uniforms
      // Shadow strength collapses into the one uniform: the tuned base
      // opacity times the sun-elevation factor from App. The source preview
      // bypasses uOpacity in the shader; the scene-wide arrival fade owns the
      // entrance (see useSceneArrival).
      values.uTime.value = elapsedTimeRef.current
      values.uAnimationSpeed.value = settings.speed
      values.uAnimationStrength.value = settings.wind
      values.uDepthMix.value = settings.depthMix
      values.uEdgeCrispness.value = settings.crispness * crispnessScale
      values.uKernelScale.value = kernelScale
      values.uLayerSpread.value = settings.layerSpread
      values.uLightGlow.value = settings.lightGlow
      values.uLightRays.value = settings.lightRays
      values.uOpacity.value = settings.opacity * (showSource ? 1 : opacityScale)
      values.uRayDiffusion.value = settings.rayDiffusion
      values.uSampleCount.value = settings.sampleCount
      values.uShadowContrast.value = settings.contrast
      values.uShadowTint.value = shadowTint
      values.uShowSource.value = showSource ? 1 : 0
      values.uSunAngle.value = sunAngle
      values.uWarpStrength.value = rigidWarpModes.has(mode) ? 0 : 1
    }

    // useFrame runs BEFORE R3F renders, so the first invocation predates any
    // rendered frame. On the second invocation frame 1's commands have been
    // submitted; a fence after them signals only once the GPU has actually
    // executed the frame (including its shader compile), and only then is
    // this layer safe to include in the scene arrival fade.
    frameCountRef.current += 1
    if (!hasSignaledLiveRef.current) {
      if (frameCountRef.current === 2) {
        firstFrameFenceRef.current = createGpuFrameFence(gl.getContext())
      } else if (firstFrameFenceRef.current?.poll()) {
        firstFrameFenceRef.current.dispose()
        firstFrameFenceRef.current = null
        hasSignaledLiveRef.current = true
        onFirstFrame?.()
      }
    }

    // The preview readback is a synchronous GPU stall; only pay it when a
    // preview panel is actually subscribed (homepage ?debug). In the lab,
    // settings change on every slider tick and nothing subscribes.
    if (!hasShadowSourcePreviewListeners()) return

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

type V2ShadowLayerProps = Omit<ShadowPlaneProps, 'showSource'> & {
  className?: string
  showSource?: boolean
}

export default function V2ShadowLayer({
  className,
  crispnessScale,
  mode,
  onFirstFrame,
  opacityScale,
  settings,
  shadowTint,
  showSource = false,
  sunAngle,
}: V2ShadowLayerProps) {
  useEffect(() => {
    emitDebugTimelineEvent('v2 source scene mounted')
  }, [])

  return (
    <div
      className={`daylight-shadow-layer${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        // The display pass runs uSampleCount blur taps per fragment, so its
        // pixel count is the page's dominant GPU cost (measured: 12fps at
        // dpr 1.5 / 100 taps on an M-series laptop). The output is soft blur,
        // so rendering at dpr 1 and letting the compositor upscale is
        // invisible — and ~2x cheaper on retina displays.
        dpr={1}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(0xf2f0ee, 0)}
      >
        <SourceSceneShadowPlane
          crispnessScale={crispnessScale}
          mode={mode}
          onFirstFrame={onFirstFrame}
          opacityScale={opacityScale}
          settings={settings}
          shadowTint={shadowTint}
          showSource={showSource}
          sunAngle={sunAngle}
        />
      </Canvas>
    </div>
  )
}
