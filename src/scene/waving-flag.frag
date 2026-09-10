precision highp float;

// Uniforms
uniform sampler2D uTexture;

// Varyings
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Sample the badge texture
  vec4 texColor = texture2D(uTexture, vUv);
  
  // Basic lighting: simple directional light approximation
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
  float diffuse = max(dot(vNormal, lightDir), 0.3);
  
  // Apply basic shading
  vec3 finalColor = texColor.rgb * diffuse;
  
  gl_FragColor = vec4(finalColor, texColor.a);
}
