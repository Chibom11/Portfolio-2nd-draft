import { Canvas } from '@react-three/fiber'
import React, { Suspense } from 'react'
import Experience from './Experience.jsx'
import { Loader } from '@react-three/drei'
import { KeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

// Generate random star positions once
const STARS = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 2 + 1,
  delay: `${Math.random() * 4}s`,
  duration: `${2 + Math.random() * 3}s`,
}))

export default function StarBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0"
      style={{ background: 'radial-gradient(ellipse at 50% 100%, #1a0a2e 0%, #05010f 70%)' }}
    >
      {STARS.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: 0.7,
            animation: `twinkle ${star.duration} ${star.delay} infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          from { opacity: 0.2; transform: scale(0.8); }
          to   { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}