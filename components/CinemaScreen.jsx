/**
 * CinemaScreen.jsx
 * 
 * Drop-in postprocessing + projector screen setup for your R3F scene.
 * 
 * Install deps if not already present:
 *   npm install @react-three/postprocessing postprocessing
 * 
 * Usage: replace your existing RigidBody + Html block with <CinemaScreen />
 * and add <CinemaPostProcessing /> anywhere inside your <Canvas>.
 */

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'

// ─────────────────────────────────────────────
// 1.  POSTPROCESSING STACK
//     Place <CinemaPostProcessing /> anywhere
//     inside your <Canvas> (not inside a mesh).
// ─────────────────────────────────────────────
export function CinemaPostProcessing() {
  return (
    <EffectComposer multisampling={4}>

      {/* Bloom — makes the bright screen glow into the room */}
      <Bloom
        intensity={0.2}          // overall glow strength
        luminanceThreshold={0.55} // only pixels brighter than this bloom
        luminanceSmoothing={0.4}
        mipmapBlur              // smoother, more cinematic spread
        radius={0.85}
      />

      {/* Chromatic Aberration — lens fringe on screen edges */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0014, 0.0008]}   // subtle RGB split; bump up for more drama
        radialModulation            // strongest at edges, clean in center
        modulationOffset={0.18}
      />

      {/* Film Noise — organic grain over the whole frame */}
      <Noise
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.28}
      />

      {/* Vignette — darkens corners, pushes eye toward screen */}
     

      {/* Tone mapping — cinematic filmic curve */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

    </EffectComposer>
  )
}

// ─────────────────────────────────────────────
// 2.  SCREEN MESH + PROJECTOR LIGHT
//     Replaces your existing RigidBody block.
//     Pass `proj` texture and `theatreView` flag
//     as props just like before.
// ─────────────────────────────────────────────
export function CinemaScreen({ proj, theatreView, nodes }) {
  const theatreRef = useRef()
  const screenLightRef = useRef()

  // Subtle flicker — real projectors aren't perfectly steady
  useFrame(({ clock }) => {
    if (!screenLightRef.current) return
    const t = clock.getElapsedTime()
    // Very gentle noise on intensity so it doesn't look like a bug
    screenLightRef.current.intensity =
      1.8 + Math.sin(t * 47.3) * 0.04 + Math.sin(t * 19.7) * 0.025
  })

  return (
    <>
      {/* ── Projector screen ── */}
      <RigidBody
        type="fixed"
        colliders={false}
        position={[194.315, 163.656, 281.801]}
        rotation={[0, 1.562, 1.571]}
      >
        <mesh
          ref={theatreRef}
          geometry={nodes.projector_screen.geometry}
          scale={[-27.516, -65.159, -26.516]}
        >
          <meshBasicMaterial map={proj} />
        </mesh>
        <CuboidCollider args={[20, 20, 3]} position={[10, 1, 0]} />
      </RigidBody>

      {/* ── Screen glow light cast onto nearby geometry ── */}
      {/*   RectAreaLight mimics the real rectangular light a screen emits  */}
      <rectAreaLight
        ref={screenLightRef}
        position={[191, 205, 283]}
        rotation={[0, -1.582, 0]}
        width={55}
        height={35}
        intensity={1.8}
        color="#fff8f0"   // slightly warm — projector bulb colour
      />

      {/* ── Iframe overlay ── */}
      {theatreView && (
        <Html
          transform
          occlude
          position={[192.62, 205.8, 282]}
          rotation={[0, -1.572, -0.001]}
          scale={5.9}
        >
          {/*
            Wrapper adds:
              • scanlines overlay (CSS repeating-linear-gradient)
              • very slight perspect‑warp at edges (CSS perspective)
              • a soft screen-edge glow bleeding outside the iframe frame
          */}
          <div style={wrapperStyle}>
            {/* Scanlines */}
            <div style={scanlinesStyle} />

            {/* Screen edge bleed — simulates light spilling off screen */}
            <div style={edgeBleedStyle} />

            <iframe
              src="/projector_movie_carousel.html"
              style={iframeStyle}
              title="theatre"
            />
          </div>
        </Html>
      )}
    </>
  )
}

// ─────────────────────────────────────────────
// 3.  INLINE STYLES  (keeps component portable)
// ─────────────────────────────────────────────

const wrapperStyle = {
  position: 'relative',
  width: '880px',
  height: '360px',
  // Slight perspective warp — like a real curved screen
  perspective: '1800px',
  perspectiveOrigin: '50% 50%',
  // Outer glow bleeding past the iframe boundary
  filter: 'drop-shadow(0 0 28px rgba(255,200,120,0.35)) drop-shadow(0 0 60px rgba(255,160,60,0.18))',
  borderRadius: '4px',
  overflow: 'hidden',
}

const iframeStyle = {
  width: '880px',
  height: '360px',
  border: 'none',
  display: 'block',
  // CSS chromatic aberration backup (works even without postprocessing)
  // Remove if postprocessing CA is enough
  filter: 'contrast(1.04) saturate(1.08)',
  borderRadius: '4px',
  // Very subtle inner warp on the iframe itself
  transform: 'rotateY(0.3deg) rotateX(-0.2deg)',
}

// Scanlines — classic CRT / old projector texture
const scanlinesStyle = {
  position: 'absolute',
  inset: 0,
  zIndex: 10,
  pointerEvents: 'none',
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 3px)',
  borderRadius: '4px',
}

// Soft light bleed around screen edge
const edgeBleedStyle = {
  position: 'absolute',
  inset: '-6px',
  zIndex: -1,
  pointerEvents: 'none',
  borderRadius: '10px',
  background:
    'radial-gradient(ellipse at center, rgba(255,180,80,0.0) 60%, rgba(255,150,50,0.22) 100%)',
  filter: 'blur(12px)',
}