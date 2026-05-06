import { Canvas } from '@react-three/fiber'
import React, { Suspense, useRef } from 'react'
import Experience from '../components/Experience.jsx'
import { Loader, SoftShadows, Stars } from '@react-three/drei'
import { KeyboardControls } from '@react-three/drei'
import StarBackground from './StarBackground.jsx'
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
         <StarBackground />
      <div className='absolute w-[100%] h-[100%]'>
        <KeyboardControls map={keyBoardControlMap}>
                   <Canvas
            shadows
            className="pl-[100px] w-full h-full"
            camera={{ fov: 45, near: 0.1, far: 10000 }}
            gl={{
              alpha: true,                          // 👈 transparent canvas bg
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.8,
            }}
            style={{ background: 'transparent' }}  // 👈 let CSS stars show through
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