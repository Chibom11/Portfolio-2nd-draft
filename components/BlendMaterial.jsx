import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

const BlendMaterial = shaderMaterial(
  { map: null, map2: null, mixRatio: 0.0 },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform sampler2D map;
    uniform sampler2D map2;
    uniform float mixRatio;
    varying vec2 vUv;
    void main() {
      vec4 dayColor   = texture2D(map,  vUv);
      vec4 nightColor = texture2D(map2, vUv);
      gl_FragColor    = mix(dayColor, nightColor, mixRatio);
    }
  `,
  // onInit callback — runs when material instance is created
  (mat) => { mat.isBlendMaterial = true }
)

extend({ BlendMaterial })
export { BlendMaterial }