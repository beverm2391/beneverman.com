import { useEffect, useRef, useState } from 'react'
import type { BackgroundModeConfig } from './HomeSunGradientConfig'
import backgroundFragmentShader from './shaders/home-background.frag.glsl'
import backgroundVertexShader from './shaders/home-background.vert.glsl'

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
  const [isVisible, setIsVisible] = useState(false)

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
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    let startTime = performance.now()

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
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
  }, [mode])

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <canvas
      aria-hidden="true"
      className="background-shader-layer"
      ref={canvasRef}
      style={{ opacity: isVisible ? 1 : 0 }}
    />
  )
}
