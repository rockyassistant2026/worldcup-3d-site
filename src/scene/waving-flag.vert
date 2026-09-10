precision highp float;

// Uniforms
uniform float uTime;
uniform float uWaveStrength;
uniform float uWaveFrequency;

// Varyings
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vUv = uv;
  
  // Copy original position
  vec3 pos = position;
  
  // Apply wave animation to X and Z (leaving Y static)
  // Creates a cloth-like wave from left to right across the flag
  float wave = sin(uv.x * uWaveFrequency + uTime) * uWaveStrength;
  
  // Add a secondary wave on the Y axis for a more organic motion
  float waveY = sin(uv.x * uWaveFrequency * 0.5 + uTime * 0.7) * (uWaveStrength * 0.3);
  
  // Apply displacements (X displacement based on UV position, subtle Y motion)
  pos.z += wave;
  pos.y += waveY;
  
  // Update normal for lighting (rough approximation for performance)
  vec3 normal = normalize(normalMatrix * normal);
  vNormal = normal;
  
  vPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
