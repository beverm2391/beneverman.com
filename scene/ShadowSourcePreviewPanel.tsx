import type { ShadowSourcePreview } from './shadowSourcePreview'

export function ShadowSourcePreviewPanel({
  onPick,
  preview,
}: {
  onPick: (x: number, y: number) => void
  preview: ShadowSourcePreview | null
}) {
  return (
    <div className="shadow-source-preview" aria-label="Shadow source preview">
      <div>
        <span>source</span>
        <span>{preview ? `${preview.mode} ${preview.width}x${preview.height}` : 'waiting'}</span>
      </div>
      {preview?.dataUrl ? (
        <button
          aria-label="Move shadow sampler"
          className="shadow-source-frame"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            onPick(
              ((event.clientX - rect.left) / rect.width) * preview.width,
              ((event.clientY - rect.top) / rect.height) * preview.height,
            )
          }}
          style={{ aspectRatio: `${preview.width} / ${preview.height}` }}
          type="button"
        >
          {/* A transient canvas snapshot is already a data URL; image optimization cannot help it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={preview.dataUrl} />
          {preview.sampler ? (
            <>
              <span
                className="shadow-sampler-probe"
                style={{
                  left: `${(preview.sampler.sampleX / preview.width) * 100}%`,
                  top: `${(preview.sampler.sampleY / preview.height) * 100}%`,
                }}
              />
              {preview.sampler.points.map((point, index) => {
                const sampleSize = point.hitCaster
                  ? `${Math.max(0.55, (point.casterSize / preview.width) * 100)}%`
                  : '0.35rem'
                return (
                  <span
                    className={[
                      'shadow-sampler-point',
                      point.hitCaster ? 'is-hit' : '',
                      point.contributes ? 'is-contributing' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    key={`${point.x}-${point.y}-${index}`}
                    style={{
                      height: sampleSize,
                      left: `${(point.x / preview.width) * 100}%`,
                      top: `${(point.y / preview.height) * 100}%`,
                      width: sampleSize,
                    }}
                  />
                )
              })}
            </>
          ) : null}
        </button>
      ) : (
        <div className="shadow-source-empty" />
      )}
      {preview?.sampler ? (
        <div className="shadow-sampler-readout">
          <span>probe</span>
          <span>
            {preview.sampler.contributingSamples}/{preview.sampler.points.length} samples ·{' '}
            {preview.sampler.shadowFactor.toFixed(2)}
          </span>
        </div>
      ) : null}
    </div>
  )
}
