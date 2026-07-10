import { useEffect, useRef } from 'react'
import { HomeBackgroundFallback } from './HomeBackgroundFallback'
import type { BackgroundModeConfig } from './HomeSunGradientConfig'
import { useFirstFrameReveal } from './primitives/firstFrameReveal'
import backgroundFragmentShader from './shaders/home-background.frag.glsl'
import backgroundVertexShader from './shaders/home-background.vert.glsl'

// How long the sun takes to bloom into the scene after the first presented
// frame. The bloom is the entire entrance: the CSS cross-fade underneath is a
// fast mechanical seam between the fallback and the shader's entrance=0 frame,
// which are tuned to look alike.
const ENTRANCE_MS = 450

// Cap how much a single frame can advance the entrance. Page load is the
// jankiest window (hydration, chunk parsing, shader compiles); with a wall
// clock a dropped frame would skip the bloom forward, which reads as stutter.
// Clamped accumulation pauses it instead.
const MAX_ENTRANCE_FRAME_MS = 34

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
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
  mode,
  sunAngle,
}: {
  mode: BackgroundModeConfig
  sunAngle: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sunAngleRef = useRef(sunAngle)
  const { isRevealed, reveal } = useFirstFrameReveal()

  useEffect(() => {
    sunAngleRef.current = sunAngle
  }, [sunAngle])

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'low-power',
      stencil: false,
    })

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
    const entranceLocation = gl.getUniformLocation(program, 'uEntrance')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    let startTime = performance.now()
    let hasPresentedFrame = false
    let entranceTime = 0
    let lastFrameAt = 0

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
      // The bloom ramps from the first presented frame; reduced motion gets
      // the finished scene immediately (this render is its only frame).
      if (lastFrameAt !== 0) entranceTime += Math.min(now - lastFrameAt, MAX_ENTRANCE_FRAME_MS)
      lastFrameAt = now
      const entrance = motionQuery.matches
        ? 1
        : easeOutCubic(Math.min(1, entranceTime / ENTRANCE_MS))
      gl.uniform1f(entranceLocation, entrance)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      // Reveal only after WebGL has actually produced a frame; failed or
      // unavailable contexts continue to show the complete static scene
      // (see useFirstFrameReveal).
      if (!hasPresentedFrame) {
        hasPresentedFrame = true
        reveal()
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
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionQuery.removeEventListener('change', handleMotionChange)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [mode, reveal])

  return (
    <>
      <HomeBackgroundFallback hidden={isRevealed} mode={mode} sunAngle={sunAngle} />
      <canvas
        aria-hidden="true"
        className={`scene-live-layer${isRevealed ? ' is-revealed' : ''}`}
        ref={canvasRef}
      />
    </>
  )
}
