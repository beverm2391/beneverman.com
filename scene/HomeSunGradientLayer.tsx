import { useEffect, useRef } from 'react'
import type { BackgroundModeConfig } from './HomeSunGradientConfig'
import { createGpuFrameFence } from './primitives/gpuFrameFence'
import backgroundFragmentShader from './shaders/home-background.frag.glsl'
import backgroundVertexShader from './shaders/home-background.vert.glsl'
import './primitives/sceneArrival.css'

function createShader(gl: WebGLRenderingContext | WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

export function HomeSunGradientLayer({
  className,
  mode,
  onFirstFrame,
  sunAngle,
}: {
  className?: string
  mode: BackgroundModeConfig
  onFirstFrame?: () => void
  sunAngle: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sunAngleRef = useRef(sunAngle)
  const onFirstFrameRef = useRef(onFirstFrame)

  useEffect(() => {
    sunAngleRef.current = sunAngle
  }, [sunAngle])

  useEffect(() => {
    onFirstFrameRef.current = onFirstFrame
  }, [onFirstFrame])

  useEffect(() => {
    const canvas = canvasRef.current
    const contextOptions: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'low-power',
      stencil: false,
    }
    // WebGL2 first: it provides fence syncs, which make the arrival signal
    // truthful (GPU actually executed the frame). The shader is GLSL ES 1.0,
    // valid in both contexts.
    const gl: WebGL2RenderingContext | WebGLRenderingContext | null | undefined =
      (canvas?.getContext('webgl2', contextOptions) as WebGL2RenderingContext | null) ??
      (canvas?.getContext('webgl', contextOptions) as WebGLRenderingContext | null)

    if (!canvas || !gl) return

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, backgroundVertexShader)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, backgroundFragmentShader)
    const program = gl.createProgram()

    if (!vertexShader || !fragmentShader || !program) return

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return
    }

    const buffer = gl.createBuffer()
    const positionLocation = gl.getAttribLocation(program, 'aPosition')
    const resolutionLocation = gl.getUniformLocation(program, 'uResolution')
    const timeLocation = gl.getUniformLocation(program, 'uTime')
    const baseLocation = gl.getUniformLocation(program, 'uBase')
    const midLocation = gl.getUniformLocation(program, 'uMid')
    const glowLocation = gl.getUniformLocation(program, 'uGlow')
    const coolLocation = gl.getUniformLocation(program, 'uCool')
    const glowStrengthLocation = gl.getUniformLocation(program, 'uGlowStrength')
    const sunAngleLocation = gl.getUniformLocation(program, 'uSunAngle')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    let fencePollId = 0
    let startTime = performance.now()
    let hasSubmittedFrame = false

    const resize = () => {
      // Cap below full retina: the output is a soft gradient, and the fbm
      // noise runs per fragment every frame — 1.5x cuts ~44% of that cost
      // vs 2x with no visible difference.
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio))
      const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      gl.viewport(0, 0, width, height)
    }

    const render = (now: number) => {
      frameId = 0
      resize()
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      )
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(timeLocation, motionQuery.matches ? 0 : (now - startTime) / 1000)
      gl.uniform3fv(baseLocation, mode.shader.base)
      gl.uniform3fv(midLocation, mode.shader.mid)
      gl.uniform3fv(glowLocation, mode.shader.glow)
      gl.uniform3fv(coolLocation, mode.shader.cool)
      gl.uniform1f(glowStrengthLocation, mode.shader.glowStrength)
      gl.uniform1f(sunAngleLocation, sunAngleRef.current)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      // Signal readiness only once the GPU has actually executed the first
      // frame (fence sync), not merely when the draw call was queued — the
      // driver may still be compiling the shader at that point. The dedicated
      // poll loop keeps working under prefers-reduced-motion, where the
      // render loop stops after this single frame.
      if (!hasSubmittedFrame) {
        hasSubmittedFrame = true
        const fence = createGpuFrameFence(gl)
        const pollFence = () => {
          if (fence.poll()) {
            fence.dispose()
            fencePollId = 0
            onFirstFrameRef.current?.()
            return
          }
          fencePollId = requestAnimationFrame(pollFence)
        }
        fencePollId = requestAnimationFrame(pollFence)
      }

      if (!motionQuery.matches) frameId = requestAnimationFrame(render)
    }

    const scheduleRender = () => {
      if (frameId === 0) frameId = requestAnimationFrame(render)
    }

    const handleVisibilityChange = () => {
      startTime = performance.now()
      scheduleRender()
    }

    const handleMotionChange = () => {
      cancelAnimationFrame(frameId)
      frameId = 0
      startTime = performance.now()
      scheduleRender()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    motionQuery.addEventListener('change', handleMotionChange)
    scheduleRender()

    return () => {
      cancelAnimationFrame(frameId)
      cancelAnimationFrame(fencePollId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionQuery.removeEventListener('change', handleMotionChange)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [mode])

  return (
    <canvas
      aria-hidden="true"
      className={`scene-live-layer${className ? ` ${className}` : ''}`}
      ref={canvasRef}
    />
  )
}
