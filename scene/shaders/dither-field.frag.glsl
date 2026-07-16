precision highp float;

// Dither field: a slow metaball/blob field rendered through an ordered
// pattern — halftone dots, Bayer cells, or scanline slats — in a single ink
// on a transparent canvas, so the page's paper shows through. The field is
// the light; the pattern carries all tone (see scene/INSPIRATION.md).

uniform vec2 uResolution;
uniform float uTime;
uniform float uPattern;   // 0 halftone, 1 bayer, 2 slats, 3 smooth (no pattern)
uniform float uSource;    // 0 internal blob field, 1 sampled from uBelow
uniform sampler2D uBelow; // composited canvases beneath this layer
uniform float uContrast;  // field contrast around 0.5
uniform float uCellPx;    // pattern pitch in physical pixels
uniform float uAngle;     // pattern rotation in radians
uniform float uBlobCount; // 1..6
uniform float uBlobScale; // blob radius as a fraction of the short side
uniform float uSpeed;
uniform float uBias;      // density bias, -0.5..0.5
uniform float uJitter;    // slats: interruption randomness 0..1
uniform float uSlatFill;  // slats: inked fraction of the row pitch
uniform vec3 uInk;
uniform float uOpacity;
uniform float uInvert;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Golfed ordered-dither ladder: Bayer2 -> Bayer8 by recursion.
float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
#define Bayer4(a) (Bayer2(0.5 * (a)) * 0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(0.5 * (a)) * 0.25 + Bayer2(a))

vec2 rotate(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// The field is what the pattern renders: either the internal blob field or
// the darkness of whatever is composited beneath this layer. Both run
// through the same bias/contrast/invert shaping so the knobs mean one thing.
float shapeField(float raw) {
  float field = clamp(0.5 + (raw + uBias - 0.5) * uContrast, 0.0, 1.0);
  return uInvert > 0.5 ? 1.0 - field : field;
}

// Sum of drifting gaussian blobs, sampled in aspect-corrected UV space.
// Each blob orbits its own slow lissajous path; seeds keep them apart.
float blobField(vec2 screenPx) {
  vec2 p = screenPx / uResolution;
  float aspect = uResolution.x / uResolution.y;
  p.x *= aspect;
  float t = uTime * uSpeed;

  float sum = 0.0;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= uBlobCount) break;
    float fi = float(i);
    vec2 seed = vec2(hash(vec2(fi, 1.7)), hash(vec2(3.1, fi)));
    vec2 center = vec2(0.5 * aspect, 0.5) +
      vec2(0.30 * aspect, 0.32) *
        vec2(
          sin(t * (0.31 + 0.23 * seed.x) + fi * 2.39),
          cos(t * (0.24 + 0.19 * seed.y) + fi * 1.17 + seed.x * 6.28)
        );
    float r = uBlobScale * (0.65 + 0.5 * seed.y);
    float d = length(p - center);
    sum += exp(-(d * d) / (2.0 * r * r));
  }
  // Shaped, not linear: everything below the floor is clean paper, blob
  // cores saturate to solid ink. Without the floor cut, gaussian tails put
  // faint dots across the whole canvas ("toner explosion").
  return shapeField(smoothstep(0.16, 0.85, sum * 0.7));
}

float fieldAt(vec2 screenPx) {
  if (uSource < 0.5) return blobField(screenPx);
  // Below-source: ink density is the darkness of the composited stack
  // beneath (uploaded pre-flipped, so plain gl_FragCoord UVs line up).
  vec3 below = texture2D(uBelow, screenPx / uResolution).rgb;
  float lum = dot(below, vec3(0.299, 0.587, 0.114));
  return shapeField(1.0 - lum);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 rp = rotate(frag, uAngle);
  float coverage = 0.0;

  if (uPattern > 2.5) {
    // Smooth: the bare field, for previewing/designing the underneath.
    coverage = fieldAt(frag);
  } else if (uPattern < 0.5) {
    // Halftone: one dot per rotated cell, radius from the field sampled at
    // the cell center (sqrt for perceptually-even tone), hard-ish edge.
    vec2 cell = floor(rp / uCellPx);
    vec2 local = fract(rp / uCellPx) - 0.5;
    vec2 cellCenter = rotate((cell + 0.5) * uCellPx, -uAngle);
    float f = fieldAt(cellCenter);
    float radius = 0.56 * sqrt(f);
    float aa = 1.2 / uCellPx;
    coverage = 1.0 - smoothstep(radius - aa, radius, length(local));
  } else if (uPattern < 1.5) {
    // Bayer: whole cells switch on against the ordered threshold matrix.
    vec2 cell = floor(rp / uCellPx);
    vec2 cellCenter = rotate((cell + 0.5) * uCellPx, -uAngle);
    float f = fieldAt(cellCenter);
    coverage = step(Bayer8(cell), f * 0.995);
  } else {
    // Slats: horizontal rows; each row breaks into segments with hashed
    // thresholds, so the field's silhouette gets the interrupted-run look.
    float row = floor(rp.y / uCellPx);
    float inSlat = step(fract(rp.y / uCellPx), uSlatFill);
    float segLen = uCellPx * 5.0;
    float segX = floor((rp.x + hash(vec2(row, 7.3)) * 917.0) / segLen);
    vec2 segCenter = rotate(
      vec2((segX + 0.5) * segLen - hash(vec2(row, 7.3)) * 917.0, (row + 0.5) * uCellPx),
      -uAngle
    );
    float f = fieldAt(segCenter);
    float threshold = mix(0.5, hash(vec2(row, segX)), uJitter);
    coverage = inSlat * step(threshold, f);
  }

  float a = coverage * uOpacity;
  // Premultiplied alpha: transparent where there is no ink.
  gl_FragColor = vec4(uInk * a, a);
}
