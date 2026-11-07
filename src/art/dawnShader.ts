// SkSL runtime shader: a slow sunrise with drifting clouds and fading stars.
// Uniforms: res (pixels), t (seconds), rise (0 = before dawn, 1 = full sunrise).
export const DAWN_SKSL = `
uniform float2 res;
uniform float t;
uniform float rise;

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + float2(1.0, 0.0));
  float c = hash(i + float2(0.0, 1.0));
  float d = hash(i + float2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(float2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + float2(7.0, 3.0);
    a *= 0.5;
  }
  return v;
}

half4 main(float2 fc) {
  float2 uv = fc / res;
  float aspect = res.x / res.y;
  float h = 1.0 - uv.y;

  float3 night = float3(0.04, 0.13, 0.12);
  float3 teal = float3(0.10, 0.30, 0.27);
  float3 rose = float3(0.86, 0.50, 0.44);
  float3 peach = float3(1.00, 0.74, 0.50);
  float3 gold = float3(1.00, 0.88, 0.62);

  float horizon = 0.30;
  float k = clamp(rise, 0.0, 1.0);
  float warm = smoothstep(0.0, 1.0, k);

  float3 col = mix(night, teal, smoothstep(0.0, 0.9, h));
  float band = smoothstep(0.75, 0.0, abs(h - horizon) * 2.2);
  col = mix(col, mix(rose, peach, smoothstep(0.1, 0.5, 1.0 - abs(h - horizon))), band * warm * 0.7);

  float2 sunPos = float2(0.5 * aspect, 1.0 - (horizon - 0.1 + k * 0.28));
  float2 p = float2(uv.x * aspect, uv.y);
  float d = distance(p, sunPos);
  float glow = exp(-d * 6.0) * (0.2 + 0.8 * warm);
  float disc = smoothstep(0.07, 0.064, d) * warm;
  col += gold * glow * 0.5;
  col = mix(col, gold, disc);

  float2 cp = float2(uv.x * aspect * 2.2 + t * 0.03, uv.y * 5.0 - t * 0.006);
  float cl = fbm(cp);
  float cloudMask = smoothstep(0.50, 0.78, cl) * smoothstep(0.05, 0.5, h) * smoothstep(0.95, 0.55, h);
  float3 cloudCol = mix(float3(0.20, 0.34, 0.33), mix(rose, gold, 0.5), warm * (0.35 + 0.65 * smoothstep(0.35, 0.0, d)));
  col = mix(col, cloudCol, cloudMask * 0.55);

  float2 sp = floor(fc / 3.0);
  float star = step(0.9965, hash(sp)) * smoothstep(0.35, 0.9, h) * (1.0 - warm) * (0.6 + 0.4 * sin(t * 2.0 + hash(sp) * 20.0));
  col += float3(star);

  col = min(col, float3(1.0));
  float vig = smoothstep(1.25, 0.35, distance(uv, float2(0.5, 0.55)));
  col *= mix(0.78, 1.0, vig);

  return half4(half3(col), 1.0);
}
`;
