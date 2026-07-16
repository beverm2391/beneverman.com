import { useEffect, useRef } from 'react'
import ditherFragmentShader from './shaders/dither-field.frag.glsl'
import backgroundVertexShader from './shaders/home-background.vert.glsl'
import './primitives/sceneArrival.css'

// Lab-first dither/halftone/slat layer (see scene/INSPIRATION.md). Raw WebGL
// like HomeSunGradientLayer — no three.js — but on a TRANSPARENT canvas: the
// shader emits premultiplied ink, so whatever sits behind (lab canvas, the
// page paper) is the other "color" of the two-ink system.
//
// Two roles, one layer: with `source: 'blobs'` it renders its own animated
// field (use pattern 'smooth' to see the field bare); with `source: 'below'`
// it is a TREATMENT that re-renders whatever canvases sit beneath it in the
// lab stack through the pattern. Sampled layers must keep their drawing
// buffer (preserveDrawingBuffer) or they read back blank.

export type DitherFieldSettings = {
  pattern: 'halftone' | 'bayer' | 'slats' | 'smooth'
  source: 'blobs' | 'below'
  contrast: number
  cell: number // CSS px pattern pitch
  angleDeg: number
  blobs: number
  blobScale: number
  speed: number
  bias: number
  jitter: number
  slatFill: number
  ink: [number, number, number]
  opacity: number
  invert: boolean
  // Paint for samplers only: CSS-invisible (opacity 0), but the drawing
  // buffer keeps rendering so a treatment layer above can read it. Hiding
  // the layer instead would unmount the canvas and starve the sampler.
  sourceOnly: boolean
}

const PATTERN_INDEX = { halftone: 0, bayer: 1, slats: 2, smooth: 3 } as const
// The below-stack is sampled for its low-frequency darkness, not detail.
const SAMPLE_WIDTH = 512

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

export function DitherFieldLayer({ className, settings }: { className?: string; settings: DitherFieldSettings }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // Settings ride a ref so slider drags update uniforms per frame without
  // tearing down the GL program (the effect below deliberately has no deps).
  const settingsRef = useRef(settings)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    const canvas = canvasRef.current
    const contextOptions: WebGLContextAttributes = {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: 'low-power',
      premultipliedAlpha: true,
      // Readable after the frame, so a stacked treatment layer can sample it.
      preserveDrawingBuffer: true,
      stencil: false,
    }
    const gl: WebGL2RenderingContext | WebGLRenderingContext | null | undefined =
      (canvas?.getContext('webgl2', contextOptions) as WebGL2RenderingContext | null) ??
      (canvas?.getContext('webgl', contextOptions) as WebGLRenderingContext | null)
    if (!canvas || !gl) return

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, backgroundVertexShader)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, ditherFragmentShader)
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
    const uniforms = Object.fromEntries(
      [
        'uResolution', 'uTime', 'uPattern', 'uSource', 'uBelow', 'uContrast', 'uCellPx',
        'uAngle', 'uBlobCount', 'uBlobScale', 'uSpeed', 'uBias', 'uJitter', 'uSlatFill',
        'uInk', 'uOpacity', 'uInvert',
      ].map((name) => [name, gl.getUniformLocation(program, name)]),
    )
    const belowTexture = gl.createTexture()
    const sampleCanvas = document.createElement('canvas')
    const sampleCtx = sampleCanvas.getContext('2d')

    // Composite every canvas that paints BELOW this layer (later
    // .lab-render-layer siblings, back-to-front) onto a small offscreen 2D
    // canvas over white "paper", and upload it as the field texture.
    const uploadBelow = () => {
      const wrapper = canvas.closest('.lab-render-layer')
      if (!wrapper || !sampleCtx) return
      const sources: HTMLCanvasElement[] = []
      let sibling = wrapper.nextElementSibling
      while (sibling) {
        sources.push(...Array.from(sibling.querySelectorAll('canvas')))
        sibling = sibling.nextElementSibling
      }
      const width = SAMPLE_WIDTH
      const height = Math.max(
        1,
        Math.round((canvas.clientHeight / Math.max(1, canvas.clientWidth)) * width),
      )
      if (sampleCanvas.width !== width || sampleCanvas.height !== height) {
        sampleCanvas.width = width
        sampleCanvas.height = height
      }
      sampleCtx.fillStyle = '#ffffff'
      sampleCtx.fillRect(0, 0, width, height)
      for (let i = sources.length - 1; i >= 0; i--) {
        try {
          sampleCtx.drawImage(sources[i], 0, 0, width, height)
        } catch {
          // A tainted/lost source contributes paper instead of crashing.
        }
      }
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, belowTexture)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sampleCanvas)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    const startTime = performance.now()
    // The pattern is pixel-exact art: render at integer device pixels (capped
    // like the gradient layer) so cells stay crisp.
    const pixelRatio = Math.min(Math.round(window.devicePixelRatio || 1), 2)

    const resize = () => {
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
      const s = settingsRef.current
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      const usingBelow = s.source === 'below'
      if (usingBelow) uploadBelow()
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height)
      gl.uniform1f(uniforms.uTime, motionQuery.matches ? 0 : (now - startTime) / 1000)
      gl.uniform1f(uniforms.uPattern, PATTERN_INDEX[s.pattern] ?? 0)
      gl.uniform1f(uniforms.uSource, usingBelow ? 1 : 0)
      gl.uniform1i(uniforms.uBelow, 0)
      gl.uniform1f(uniforms.uContrast, s.contrast)
      gl.uniform1f(uniforms.uCellPx, Math.max(2, s.cell) * pixelRatio)
      gl.uniform1f(uniforms.uAngle, (s.angleDeg * Math.PI) / 180)
      gl.uniform1f(uniforms.uBlobCount, s.blobs)
      gl.uniform1f(uniforms.uBlobScale, s.blobScale)
      gl.uniform1f(uniforms.uSpeed, s.speed)
      gl.uniform1f(uniforms.uBias, s.bias)
      gl.uniform1f(uniforms.uJitter, s.jitter)
      gl.uniform1f(uniforms.uSlatFill, s.slatFill)
      gl.uniform3fv(uniforms.uInk, s.ink)
      gl.uniform1f(uniforms.uOpacity, s.opacity)
      gl.uniform1f(uniforms.uInvert, s.invert ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      if (!motionQuery.matches) frameId = requestAnimationFrame(render)
    }

    const scheduleRender = () => {
      if (frameId === 0) frameId = requestAnimationFrame(render)
    }
    const handleMotionChange = () => {
      cancelAnimationFrame(frameId)
      frameId = 0
      scheduleRender()
    }
    motionQuery.addEventListener('change', handleMotionChange)
    scheduleRender()

    return () => {
      cancelAnimationFrame(frameId)
      motionQuery.removeEventListener('change', handleMotionChange)
      gl.deleteTexture(belowTexture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [])

  return (
    <canvas
      aria-hidden="true"
      className={`scene-live-layer${className ? ` ${className}` : ''}`}
      ref={canvasRef}
      style={settings.sourceOnly ? { opacity: 0 } : undefined}
    />
  )
}
