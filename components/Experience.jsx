import { OrbitControls, Environment, useGLTF, CameraControls } from '@react-three/drei'
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import  Model  from './RoomTwo.jsx'
import {
  Bloom,
  EffectComposer,
  Outline,
  Selection,
  Vignette,
  ChromaticAberration,
  Noise,
  DepthOfField,
  ToneMapping,
  BrightnessContrast,
} from '@react-three/postprocessing'
import { KernelSize, BlendFunction, ToneMappingMode } from 'postprocessing'
import { Vector2 } from 'three'
import { Perf } from 'r3f-perf'
import { Physics } from '@react-three/rapier'
import Character from './Character.jsx'
import Grass from './Grass.jsx'
import Leaves from './Leaves.jsx'
import { degToRad } from 'three/src/math/MathUtils.js'
import { Html } from '@react-three/drei'  
import {Spiderman} from './Spiderman.jsx'

function CameraHUD({ controlsRef }) {
  const [info, setInfo] = useState({ x: 0, y: 0, z: 0, az: 0, po: 0 })

  useEffect(() => {
    const id = setInterval(() => {
      if (!controlsRef.current) return
      const pos = new THREE.Vector3()
      controlsRef.current.getPosition(pos)
      setInfo({
        x:  pos.x.toFixed(2),
        y:  pos.y.toFixed(2),
        z:  pos.z.toFixed(2),
        az: THREE.MathUtils.radToDeg(controlsRef.current.azimuthAngle).toFixed(1),
        po: THREE.MathUtils.radToDeg(controlsRef.current.polarAngle).toFixed(1),
      })
    }, 200)
    return () => clearInterval(id)
  }, [controlsRef])

  return (
    <Html
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 12,
        fontFamily: 'monospace',
        lineHeight: 1.8,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
      fullscreen
    >
      <div>pos  x:{info.x}  y:{info.y}  z:{info.z}</div>
      <div>azimuth: {info.az}°  |  polar: {info.po}°</div>
      <div style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>
        drag to explore — copy values to setLookAt()
      </div>
    </Html>
  )
}

import { useFrame } from '@react-three/fiber'


function Experience() {
  const controls = useRef()
  const characterRb = useRef()        // ← this will hold the RigidBody
  const [isNight, setIsNight] = useState(false)

 

  // // Follow character every frame
  useFrame(() => {
    if (!controls.current || !characterRb.current) return

    // Get world position from the RigidBody
    const pos = characterRb.current.translation()  // rapier gives {x,y,z}

    // Offset the camera behind/above the character
    // target = character position (+ slight height offset)
    controls.current.setLookAt(
      pos.x+20,        pos.y + 90,  pos.z + 160,   // camera position
      pos.x,        pos.y + 5,  pos.z,          // look-at target (character)
      true                                          // smooth
    )
  })




  return (
    <>
      <Perf />
      <OrbitControls/>
      <color attach="background" args={['#1a0a2e']} />
      {/* <fogExp2 attach="fog" color="#7b4f8a" density={0.04} /> */}
      <ambientLight color="#ff88cc" intensity={1.5} />
      <directionalLight
        castShadow
        color='purple'
        intensity={14}
        position={[1.3, 2, 1]}
      />

      {/* <CameraHUD controlsRef={controls} /> */}

      <CameraControls
        ref={controls}
        minPolarAngle={degToRad(10)}
        maxPolarAngle={degToRad(80)}
        minDistance={0.5}
        maxDistance={20}
        smoothTime={0.25}           // ← keep this low for tight follow
        draggingSmoothTime={0.1}
   
      />

      <Physics  gravity={[0,-50,0]}>
        <Selection>
    

          <Model
            scale={0.8}
            position={[0, -124.5, -16]}
            rotation={[0, Math.PI / 3, 0]}
            isNight={isNight}
            setIsNight={setIsNight}
          />

          {/* Pass the ref down */}
          <Character ref={characterRb} />
          <Spiderman scale={10}/>

          {/* <Grass position={[-0.2, -0.1567, 0.3]} radius={0.07} count={120} isNight={isNight} />
          <Grass position={[0.10, -0.17, -0.08]} radius={0.04} count={100} isNight={isNight} />
          <Leaves position={[0.10,  0.3, -0.08]} scale={6} />
          <Leaves position={[-0.05, 0.3, -0.08]} scale={6} />
          <Leaves position={[0.15,  0.3, -0.08]} scale={6} />
          <Leaves position={[0.12,  0.4, -0.08]} scale={6} /> */}
        </Selection>
      </Physics>
      <EffectComposer>

  {/* 🌸 Bloom — glowing lights/emissives */}
  <Bloom
    intensity={0.4}
    luminanceThreshold={0.2}
    luminanceSmoothing={0.9}
    kernelSize={KernelSize.LARGE}
  />

  {/* 🔭 Depth of Field — blurs far/near objects */}
  {/* <DepthOfField
    focusDistance={200}       // where focus is sharpest (0–1, normalized)
    focalLength={300

    }         // depth of the sharp zone
    bokehScale={3}             // size of bokeh blur circles
  /> */}

  {/* 🎨 Chromatic Aberration — RGB color split on edges */}
  {/* <ChromaticAberration
    offset={new Vector2(0.0015, 0.0015)}
    blendFunction={BlendFunction.NORMAL}
  /> */}

  {/* 📺 Noise — subtle film grain */}
  {/* <Noise
    opacity={0.08}
    blendFunction={BlendFunction.OVERLAY}
  /> */}

  {/* 🌗 Brightness & Contrast — punch up the image */}
  {/* <BrightnessContrast
    // brightness={0.1}   // slightly darker
    contrast={0.15}      // more contrast
  /> */}

  {/* 🎬 Tone Mapping — cinematic color grading */}
  <ToneMapping
    mode={ToneMappingMode.ACES_FILMIC}
  />

  {/* 🕶️ Vignette — dark edges, always last */}
  {/* <Vignette
    offset={0.3}        // how far in the vignette starts
    darkness={0.8}      // how dark the edges get
    eskil={false}       // false = smooth, true = sharp
    blendFunction={BlendFunction.NORMAL}
  /> */}

</EffectComposer>
    </>
  )
}

export default Experience