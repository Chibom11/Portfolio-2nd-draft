import { Canvas } from '@react-three/fiber'
import React, { Suspense, useRef } from 'react'
import Experience from '../components/Experience.jsx'
import { Loader, SoftShadows } from '@react-three/drei'
import { KeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
function LandingPage() {
  const keyBoardControlMap = [
    { name: "forward",  keys: ["KeyW"] },
    { name: "backward", keys: ["KeyS"] },
    { name: "left",     keys: ["KeyD"] },
    { name: "right",    keys: ["KeyA"] },
    { name: "flip",     keys: ["Space"] },
    { name: "jog",      keys: ["Shift"] },
  ]

  return (
    <div className='w-full h-screen flex items-center justify-center bg-black/90'>
      <div className='absolute w-[98%] h-[95%]'>
        <KeyboardControls map={keyBoardControlMap}>
          <Canvas
            shadows
            className="pl-[100px] w-full h-full rounded-4xl"
            camera={{
              fov: 45,
              near: 0.1,
              far: 10000,
              // position:[2,15,-80],
            }}
            gl={{
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.8,
            }}
          >
            <Suspense fallback={null}>
              <Experience />
            </Suspense>
          </Canvas>
        </KeyboardControls>
        <Loader dataInterpolation={(p) => `Loading ${p.toFixed(1)}%`} />
      </div>
    </div>
  )
}

export default LandingPage