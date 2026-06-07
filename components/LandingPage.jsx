import { Canvas } from '@react-three/fiber'
import React, { Suspense, useRef, useState } from 'react'
import Experience from '../components/Experience.jsx'
import { Loader } from '@react-three/drei'
import { KeyboardControls } from '@react-three/drei'
import StarBackground from './StarBackground.jsx'
import * as THREE from 'three'
import { tracks } from '../components/MusicPlayer.jsx'
import NowPlayingToast from './NowPlaying.jsx'

function LandingPage() {
  const keyBoardControlMap = [
    { name: "forward",  keys: ["KeyW"] },
    { name: "backward", keys: ["KeyS"] },
    { name: "left",     keys: ["KeyD"] },
    { name: "right",    keys: ["KeyA"] },
    { name: "flip",     keys: ["Space"] },
    { name: "jog",      keys: ["Shift"] },
    { name: "dance",    keys: ["KeyQ"] },
  ]

  const [activeTrack, setActiveTrack] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  function handleTrackSelect(i) {
    setActiveTrack(i)
    setIsPaused(false)
  }

  function handlePause() {
    setIsPaused(p => !p)
  }

  function handleStop() {
    setActiveTrack(null)
    setIsPaused(false)
  }

  return (
    <div className='w-full h-screen flex items-center justify-center bg-black'>
      <StarBackground />
      <div className='absolute w-[100%] h-[100%]'>
        <KeyboardControls map={keyBoardControlMap}>

          {activeTrack !== null && !isPaused && (
            <iframe
              key={activeTrack}
              width="0" height="0"
              src={`https://www.youtube.com/embed/${tracks[activeTrack].id}?autoplay=1&loop=1&playlist=${tracks[activeTrack].id}`}
              allow="autoplay; encrypted-media"
              style={{ position: 'fixed', opacity: 0, pointerEvents: 'none' }}
            />
          )}

          <NowPlayingToast
            activeTrack={activeTrack}
            isPaused={isPaused}
            onPause={handlePause}
            onStop={handleStop}
          />

          <Canvas
            shadows
            className="w-full h-full"
            camera={{ fov: 45, near: 0.1, far: 10000 }}
            gl={{
              alpha: false,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.8,
            }}
            style={{ background: '#000' }}
          >
            <Suspense fallback={null}>
            
              <Experience onTrackSelect={handleTrackSelect} />
            </Suspense>
          </Canvas>

        </KeyboardControls>
        <Loader dataInterpolation={(p) => `Loading ${p.toFixed(1)}%`} />
      </div>
    </div>
  )
}

export default LandingPage