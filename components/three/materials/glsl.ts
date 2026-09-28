export const noiseGLSL = /* glsl */ `
float xs_hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
vec3 xs_hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}
float xs_vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float n000 = xs_hash31(i);
  float n100 = xs_hash31(i + vec3(1, 0, 0));
  float n010 = xs_hash31(i + vec3(0, 1, 0));
  float n110 = xs_hash31(i + vec3(1, 1, 0));
  float n001 = xs_hash31(i + vec3(0, 0, 1));
  float n101 = xs_hash31(i + vec3(1, 0, 1));
  float n011 = xs_hash31(i + vec3(0, 1, 1));
  float n111 = xs_hash31(i + vec3(1, 1, 1));
  return mix(
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),
    u.z);
}
float xs_fbm(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * xs_vnoise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return s;
}
// Distance to nearest feature point (F1).
float xs_worley(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  float d = 8.0;
  for (int x = -1; x <= 1; x++)
  for (int y = -1; y <= 1; y++)
  for (int z = -1; z <= 1; z++) {
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 o = xs_hash33(i + g);
    vec3 r = g + o - f;
    d = min(d, dot(r, r));
  }
  return sqrt(d);
}
`;
