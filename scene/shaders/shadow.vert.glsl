varying vec2 vTexCoord;

void main() {
  vTexCoord = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
