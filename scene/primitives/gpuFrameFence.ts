// Truthful GPU readiness for scene arrival: submitting draw calls only queues
// commands — the driver may still be compiling shaders when drawArrays
// returns. A WebGL2 fence inserted after a frame's commands signals only once
// the GPU has actually executed them, so gating markLive on it means "pixels
// really rendered", not "we asked nicely". Polling clientWaitSync with
// timeout 0 never blocks the main thread.
//
// WebGL1 has no fences; the fallback signals after one further poll tick,
// i.e. roughly a frame after submission, which is the strongest guarantee
// that context can offer.
export type GpuFrameFence = {
  /** True once the GPU has executed everything submitted before creation. */
  poll: () => boolean
  dispose: () => void
}

export function createGpuFrameFence(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): GpuFrameFence {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
    gl.flush()
    if (sync) {
      return {
        poll: () => {
          const status = gl.clientWaitSync(sync, 0, 0)
          return status === gl.ALREADY_SIGNALED || status === gl.CONDITION_SATISFIED
        },
        dispose: () => gl.deleteSync(sync),
      }
    }
  }
  let remainingTicks = 1
  return {
    poll: () => remainingTicks-- <= 0,
    dispose: () => {},
  }
}
