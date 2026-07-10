precision highp float;
uniform sampler2D uTexture;
uniform highp float wSize;
uniform highp float hSize;
uniform highp float uTime;
uniform highp float uAnimationSpeed;
uniform highp float uAnimationStrength;
uniform highp float uEdgeCrispness;
uniform highp vec3 uShadowTint;
uniform highp float uSampleCount;
uniform highp float uShadowContrast;
uniform highp float uSunAngle;
uniform highp float uWarpStrength;
uniform highp float uDepthMix;
uniform highp float uKernelScale;
uniform highp float uLayerSpread;
uniform highp float uLightGlow;
uniform highp float uLightRays;
uniform highp float uOpacity;
uniform highp float uRayDiffusion;
uniform highp float uShowSource;

varying vec2 vTexCoord;

const float pi = 3.1415926535897932384626433832795;
const float goldenAngle = pi * (3.0 - sqrt(5.0));
const float diskSize = 80.0;
const int diskSamples = 100;
const float minSize = 20.;
const float maxSize = 300.;

vec3 rand(vec2 uv) {
  return vec3(
    fract(sin(dot(uv, vec2(12.75613, 38.12123))) * 13234.76575),
    fract(sin(dot(uv, vec2(19.45531, 58.46547))) * 43678.23431),
    fract(sin(dot(uv, vec2(23.67817, 78.23121))) * 93567.23423)
  );
}

float sampleShadowLayer(vec2 animatedUv, float activeSamples, float edgeCrispness, vec2 lightDirection, vec2 lightPerpendicular, float radiusScale, float projectionScale) {
  float shadowInfluence = 0.0;
  float sampleDiskSize = diskSize * uKernelScale * radiusScale / edgeCrispness;

  for (int i = 1; i <= diskSamples; i++) {
    if (float(i) > activeSamples) {
      continue;
    }

    vec3 jitter = rand(animatedUv * vec2(wSize, hSize) + vec2(float(i) * 0.37, radiusScale * 91.0));
    float r = sampleDiskSize * sqrt((float(i) + jitter.x * 0.7) / activeSamples);
    float theta = float(i) * goldenAngle + (jitter.y - 0.5) * 1.15;

    vec2 offset;
    offset.x = r * cos(theta);
    offset.y = r * sin(theta);
    float projectedAlong = (abs(offset.y) * (1.16 + jitter.z * 0.42) + r * 0.18) * projectionScale;
    float projectedAcross = offset.x * (0.32 + jitter.x * 0.24);
    vec2 rotatedOffset = lightDirection * projectedAlong + lightPerpendicular * projectedAcross;

    vec4 color = texture2D(uTexture, animatedUv + rotatedOffset / vec2(wSize, hSize));
    if (color.r > 0.0 && color.g == 1.0) {
      float dist = length(offset);
      float size = color.r;
      size = (size * (maxSize - minSize)) + minSize;
      size = size * uKernelScale / edgeCrispness;
      if (size / 2.0 >= dist) {
        shadowInfluence += mix(8.0, 0.5, size / (maxSize * uKernelScale)) * color.b;
      }
    }
  }

  float shadowFactor = shadowInfluence / activeSamples;
  return clamp(shadowFactor * uShadowContrast, 0.0, 0.96);
}

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;

  // Debug source view: show the raw caster map instead of its shadow.
  if (uShowSource > 0.5) {
    gl_FragColor = vec4(texture2D(uTexture, uv).rgb, 1.0);
    return;
  }

  vec2 animatedUv = uv;
  float animatedTime = uTime * uAnimationSpeed;
  animatedUv.x += sin(animatedTime * 0.24) * 0.028 * uAnimationStrength * uWarpStrength;
  animatedUv.y += cos(animatedTime * 0.18) * 0.018 * uAnimationStrength * uWarpStrength;
  animatedUv.x += sin((uv.y * 5.5) + (animatedTime * 0.32)) * 0.008 * uAnimationStrength * uWarpStrength;
  animatedUv.y += cos((uv.x * 4.0) - (animatedTime * 0.26)) * 0.006 * uAnimationStrength * uWarpStrength;
  animatedUv.x += sin((uv.y * 12.0) - (animatedTime * 0.72)) * 0.0035 * uAnimationStrength * uWarpStrength;
  animatedUv.y += cos((uv.x * 9.0) + (animatedTime * 0.58)) * 0.0025 * uAnimationStrength * uWarpStrength;

  float edgeCrispness = max(0.25, uEdgeCrispness);
  float activeSamples = clamp(uSampleCount, 1.0, float(diskSamples));
  vec2 lightDirection = normalize(vec2(cos(uSunAngle), -sin(uSunAngle)));
  vec2 lightPerpendicular = vec2(-lightDirection.y, lightDirection.x);
  float spread = max(0.05, uLayerSpread);
  float depthMix = clamp(uDepthMix, 0.0, 1.0);
  float nearLayer = sampleShadowLayer(animatedUv + lightDirection * 0.004 * spread, activeSamples, edgeCrispness * 1.35, lightDirection, lightPerpendicular, 0.58, 0.55 * spread);
  float midLayer = sampleShadowLayer(animatedUv, activeSamples, edgeCrispness, lightDirection, lightPerpendicular, 1.0, spread);
  float farLayer = sampleShadowLayer(animatedUv - lightDirection * 0.006 * spread, activeSamples, edgeCrispness * 0.72, lightDirection, lightPerpendicular, 1.62, 1.75 * spread);
  float nearWeight = mix(0.52, 0.22, depthMix);
  float midWeight = 0.42;
  float farWeight = mix(0.16, 0.48, depthMix);
  float combinedShadow = 1.0 - ((1.0 - nearLayer * nearWeight) * (1.0 - midLayer * midWeight) * (1.0 - farLayer * farWeight));
  combinedShadow = clamp(combinedShadow, 0.0, 0.96);

  // Unoccluded areas contribute warm light while casters contribute shadow.
  float sunElevation = clamp(sin(uSunAngle), 0.0, 1.0);
  vec3 lightTint = mix(vec3(1.0, 0.87, 0.72), vec3(1.0, 0.96, 0.89), sunElevation);
  float shadowAlpha = clamp(uOpacity * combinedShadow, 0.0, 1.0);

  // March toward the sun through the caster map to form visible light shafts.
  float rays = 0.0;
  if (uLightRays > 0.001) {
    vec2 rayStep = lightDirection * 0.014;
    vec2 rayUv = animatedUv + rayStep * rand(animatedUv * vec2(wSize, hSize)).x;
    float weight = 1.0;
    float accumulated = 0.0;
    float weightTotal = 0.0;
    for (int i = 0; i < 28; i++) {
      rayUv += rayStep;
      vec3 scatter = rand(rayUv * vec2(wSize, hSize) + vec2(float(i) * 1.93, 7.31));
      vec2 sampleUv = rayUv
        + lightPerpendicular * (scatter.y - 0.5) * 0.09 * uRayDiffusion
        + lightDirection * (scatter.z - 0.5) * 0.03 * uRayDiffusion;
      vec4 raySample = texture2D(uTexture, sampleUv);
      accumulated += (1.0 - raySample.g * raySample.b) * weight;
      weightTotal += weight;
      weight *= 0.92;
    }
    rays = pow(clamp(accumulated / weightTotal, 0.0, 1.0), 1.7) * (1.0 - combinedShadow * 0.55);
  }

  float lightAmount = uLightGlow * (1.0 - combinedShadow) + uLightRays * rays;
  float lightAlpha = clamp(uOpacity * lightAmount, 0.0, 1.0) * (1.0 - shadowAlpha);
  float alpha = shadowAlpha + lightAlpha;
  vec3 color = (uShadowTint * shadowAlpha + lightTint * lightAlpha) / max(alpha, 0.0001);

  gl_FragColor = vec4(color, alpha);
}
