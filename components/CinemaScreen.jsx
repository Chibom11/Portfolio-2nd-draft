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


export function CinemaScreen({ proj, theatreView, setTheatreView, nodes, theatreRef }) {

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
{!theatreView && (
<Html
  transform
  occlude={[theatreRef]}       // ← was just `occlude` (boolean)
  position={[192.62, 205.8, 282]}
  rotation={[0, -1.572, -0.001]}
  scale={6.2}
  zIndexRange={[0, 0]}  
      
>
    {/* ── Root ── */}
    <div style={{
      width: '880px',
      height: '360px',
      position: 'relative',
      overflow: 'hidden',
      background: '#07050f',
      fontFamily: "'Space Mono', 'Courier New', monospace",
    }}>

      {/* ── Ambient BG — purple/teal split matching room lighting ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 70% 90% at 20% 60%, rgba(120,40,200,0.18) 0%, transparent 65%),
          radial-gradient(ellipse 60% 70% at 80% 40%, rgba(30,180,160,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 100% 100% at 50% 50%, #0e0a1a 0%, #07050f 100%)
        `,
      }} />

      {/* ── Scanlines ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.09) 0px, rgba(0,0,0,0.09) 1px, transparent 1px, transparent 3px)',
      }} />

      {/* ── Left sprocket ── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '20px',
        background: '#050410', zIndex: 5,
        borderRight: '0.5px solid rgba(120,40,220,0.2)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-evenly', alignItems: 'center',
      }}>
        {[...Array(9)].map((_, i) => (
          <div key={i} style={{
            width: '7px', height: '11px', borderRadius: '2px',
            background: '#020108', border: '0.5px solid rgba(140,60,255,0.15)',
          }} />
        ))}
      </div>

      {/* ── Right sprocket ── */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '20px',
        background: '#050410', zIndex: 5,
        borderLeft: '0.5px solid rgba(120,40,220,0.2)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-evenly', alignItems: 'center',
      }}>
        {[...Array(9)].map((_, i) => (
          <div key={i} style={{
            width: '7px', height: '11px', borderRadius: '2px',
            background: '#020108', border: '0.5px solid rgba(140,60,255,0.15)',
          }} />
        ))}
      </div>

      {/* ── Top data strip ── */}
      <div style={{
        position: 'absolute', top: 0, left: '20px', right: '20px',
        height: '18px', background: 'rgba(8,4,20,0.9)', zIndex: 4,
        borderBottom: '0.5px solid rgba(120,40,220,0.25)',
        display: 'flex', alignItems: 'center', padding: '0 20px', overflow: 'hidden',
      }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: '7px', color: 'rgba(160,100,255,0.22)', letterSpacing: '0.14em', whiteSpace: 'nowrap' }}>
          0001 ▪ 0002 ▪ 0003 ▪ 0004 ▪ 0005 ▪ 0006 ▪ 0007 ▪ 0008 ▪ 0009 ▪ 0010 ▪ 0011 ▪ 0012 ▪ 0013 ▪ 0014 ▪ 0015 ▪ 0016 ▪ 0017 ▪ 0018 ▪ 0019 ▪ 0020
        </span>
      </div>

      {/* ── Bottom data strip ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: '20px', right: '20px',
        height: '18px', background: 'rgba(8,4,20,0.9)', zIndex: 4,
        borderTop: '0.5px solid rgba(30,180,160,0.2)',
        display: 'flex', alignItems: 'center', padding: '0 20px', overflow: 'hidden',
      }}>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: '7px', color: 'rgba(30,200,180,0.2)', letterSpacing: '0.14em', whiteSpace: 'nowrap' }}>
          35mm ▪ KODAK VISION3 ▪ EI 500T ▪ SCENE 47A ▪ TAKE 3 ▪ TC 01:02:34:18 ▪ TUNGSTEN ▪ DEVELOP BEFORE 2025.12 ▪ EXPOSED
        </span>
      </div>

      {/* ── Stage (main content area) ── */}
      <div style={{
        position: 'absolute', top: '18px', bottom: '18px', left: '20px', right: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
          background: 'radial-gradient(ellipse 78% 82% at 50% 50%, transparent 18%, rgba(4,2,14,0.6) 72%, rgba(4,2,14,0.96) 100%)',
        }} />

        {/* Neon horizontal accent — purple */}
        <div style={{
          position: 'absolute', top: '28%', left: 0, right: 0, height: '0.5px',
          pointerEvents: 'none', zIndex: 3,
          background: 'linear-gradient(to right, transparent 5%, rgba(140,60,255,0.12) 30%, rgba(160,80,255,0.22) 50%, rgba(140,60,255,0.12) 70%, transparent 95%)',
        }} />

        {/* Neon horizontal accent — teal */}
        <div style={{
          position: 'absolute', bottom: '28%', left: 0, right: 0, height: '0.5px',
          pointerEvents: 'none', zIndex: 3,
          background: 'linear-gradient(to right, transparent 5%, rgba(30,180,160,0.10) 30%, rgba(40,210,190,0.18) 50%, rgba(30,180,160,0.10) 70%, transparent 95%)',
        }} />

        {/* Vertical scratch left */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '37%', width: '0.5px',
          pointerEvents: 'none', zIndex: 3,
          background: 'linear-gradient(to bottom, transparent, rgba(160,100,255,0.05) 30%, rgba(160,100,255,0.09) 50%, rgba(160,100,255,0.04) 75%, transparent)',
        }} />

        {/* Vertical scratch right */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '63%', width: '0.5px',
          pointerEvents: 'none', zIndex: 3, opacity: 0.5,
          background: 'linear-gradient(to bottom, transparent, rgba(160,100,255,0.05) 30%, rgba(160,100,255,0.09) 50%, rgba(160,100,255,0.04) 75%, transparent)',
        }} />

        {/* ── Gate corner marks — purple top, teal bottom ── */}
        {/* TL */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', width: '14px', height: '14px', borderTop: '0.5px solid rgba(140,60,255,0.45)', borderLeft: '0.5px solid rgba(140,60,255,0.45)', zIndex: 4, pointerEvents: 'none' }} />
        {/* TR */}
        <div style={{ position: 'absolute', top: '14px', right: '14px', width: '14px', height: '14px', borderTop: '0.5px solid rgba(140,60,255,0.45)', borderRight: '0.5px solid rgba(140,60,255,0.45)', zIndex: 4, pointerEvents: 'none' }} />
        {/* BL */}
        <div style={{ position: 'absolute', bottom: '14px', left: '14px', width: '14px', height: '14px', borderBottom: '0.5px solid rgba(30,180,160,0.4)', borderLeft: '0.5px solid rgba(30,180,160,0.4)', zIndex: 4, pointerEvents: 'none' }} />
        {/* BR */}
        <div style={{ position: 'absolute', bottom: '14px', right: '14px', width: '14px', height: '14px', borderBottom: '0.5px solid rgba(30,180,160,0.4)', borderRight: '0.5px solid rgba(30,180,160,0.4)', zIndex: 4, pointerEvents: 'none' }} />

        {/* ── Content ── */}
        <div style={{
          position: 'relative', zIndex: 5,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          padding: '0 90px',
          width: '100%',
        }}>

          {/* Reel label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ height: '0.5px', width: '28px', background: 'rgba(140,60,255,0.4)' }} />
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: '7.5px', letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(160,110,255,0.55)' }}>
              Reel I — Frame 0001
            </span>
            <div style={{ height: '0.5px', width: '28px', background: 'rgba(30,180,160,0.4)' }} />
          </div>

          {/* Decorative quote mark */}
          <span style={{
            fontFamily: 'Georgia, serif', fontSize: '96px', lineHeight: '0.28',
            color: 'rgba(140,60,255,0.08)', fontStyle: 'italic',
            alignSelf: 'flex-start', marginLeft: '-4px',
            marginBottom: '8px', userSelect: 'none', display: 'block',
          }}>"</span>

          {/* Quote text */}
          <p style={{
            fontFamily: 'Georgia, serif', fontSize: '22px', lineHeight: '1.82',
            fontWeight: 400, fontStyle: 'italic',
            color: 'rgba(220,210,240,0.82)',
            letterSpacing: '0.025em', margin: 0,
          }}>
            Cinema is a matter of<br />
            <span style={{
              fontStyle: 'normal', fontWeight: 600,
              color: 'rgba(255,255,255,0.97)',
              textShadow: '0 0 22px rgba(160,90,255,0.55), 0 0 6px rgba(160,90,255,0.25)',
            }}>
              what's in the frame
            </span><br />
            and what's out.
          </p>

          {/* Ornament divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '18px 0 14px' }}>
            <div style={{ height: '0.5px', width: '50px', background: 'linear-gradient(to right, transparent, rgba(140,60,255,0.45))' }} />
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(160,110,255,0.6)', boxShadow: '0 0 6px rgba(140,60,255,0.5)' }} />
            <div style={{ height: '0.5px', width: '50px', background: 'linear-gradient(to left, transparent, rgba(30,180,160,0.4))' }} />
          </div>

          {/* Attribution */}
          <div style={{
            fontFamily: "'Courier New', monospace", fontSize: '9px',
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'rgba(160,110,255,0.7)',
            textShadow: '0 0 16px rgba(140,60,255,0.4)',
            marginBottom: '22px',
          }}>
            — Martin Scorsese
          </div>

          {/* CTA button */}
          <div
            onClick={() => setTheatreView(true)}
            style={{
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 28px',
              background: 'rgba(120,40,200,0.08)',
              border: '0.5px solid rgba(140,60,255,0.38)',
              color: 'rgba(180,130,255,0.85)',
              fontFamily: "'Courier New', monospace",
              fontSize: '8.5px', letterSpacing: '0.38em',
              textTransform: 'uppercase',
              position: 'relative',
              transition: 'all 0.22s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(120,40,200,0.20)'
              el.style.borderColor = 'rgba(160,90,255,0.75)'
              el.style.color = 'rgba(210,170,255,1)'
              el.style.boxShadow = '0 0 18px rgba(120,40,200,0.25), inset 0 0 12px rgba(120,40,200,0.08)'
              el.style.letterSpacing = '0.44em'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(120,40,200,0.08)'
              el.style.borderColor = 'rgba(140,60,255,0.38)'
              el.style.color = 'rgba(180,130,255,0.85)'
              el.style.boxShadow = 'none'
              el.style.letterSpacing = '0.38em'
            }}
          >
            {/* play triangle */}
            <div style={{
              width: 0, height: 0,
              borderStyle: 'solid',
              borderWidth: '4.5px 0 4.5px 8px',
              borderColor: 'transparent transparent transparent rgba(180,130,255,0.85)',
              flexShrink: 0,
            }} />
            Enter Theatre
          </div>

        </div>
      </div>
    </div>
  </Html>
)}
      {theatreView && (
  <Html
    transform
    occlude
    position={[192.62, 205.8, 282]}
    rotation={[0, -1.572, -0.001]}
    scale={6.2}
  >
    <div style={{
      width: '880px',
      height: '360px',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '2px',
    }}>

      {/* ── Scanlines over iframe ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 3px)',
      }} />

      {/* ── Purple/teal edge bleed matching room lighting ── */}
      <div style={{
        position: 'absolute', inset: '-8px', zIndex: -1, pointerEvents: 'none',
        borderRadius: '8px',
        background: 'radial-gradient(ellipse at center, rgba(120,40,200,0) 55%, rgba(120,40,200,0.18) 100%)',
        filter: 'blur(14px)',
      }} />

      {/* ── Gate corner marks — purple top, teal bottom ── */}
      {/* TL */}
      <div style={{ position:'absolute', top:'8px', left:'8px', width:'14px', height:'14px', borderTop:'1px solid rgba(140,60,255,0.6)', borderLeft:'1px solid rgba(140,60,255,0.6)', zIndex:11, pointerEvents:'none' }} />
      {/* TR */}
      <div style={{ position:'absolute', top:'8px', right:'8px', width:'14px', height:'14px', borderTop:'1px solid rgba(140,60,255,0.6)', borderRight:'1px solid rgba(140,60,255,0.6)', zIndex:11, pointerEvents:'none' }} />
      {/* BL */}
      <div style={{ position:'absolute', bottom:'8px', left:'8px', width:'14px', height:'14px', borderBottom:'1px solid rgba(30,180,160,0.55)', borderLeft:'1px solid rgba(30,180,160,0.55)', zIndex:11, pointerEvents:'none' }} />
      {/* BR */}
      <div style={{ position:'absolute', bottom:'8px', right:'8px', width:'14px', height:'14px', borderBottom:'1px solid rgba(30,180,160,0.55)', borderRight:'1px solid rgba(30,180,160,0.55)', zIndex:11, pointerEvents:'none' }} />

      {/* ── Exit button ── */}
      <div
        onClick={() => setTheatreView(false)}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.background = 'rgba(120,40,200,0.28)'
          el.style.borderColor = 'rgba(160,90,255,0.85)'
          el.style.color = 'rgba(210,170,255,1)'
          el.style.boxShadow = '0 0 14px rgba(120,40,200,0.35), inset 0 0 8px rgba(120,40,200,0.12)'
          el.style.letterSpacing = '0.42em'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.background = 'rgba(8,4,20,0.75)'
          el.style.borderColor = 'rgba(140,60,255,0.32)'
          el.style.color = 'rgba(160,110,255,0.65)'
          el.style.boxShadow = 'none'
          el.style.letterSpacing = '0.35em'
        }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 20,
          cursor: 'pointer',
          padding: '5px 14px',
          border: '0.5px solid rgba(140,60,255,0.32)',
          background: 'rgba(8,4,20,0.75)',
          color: 'rgba(160,110,255,0.65)',
          fontFamily: "'Courier New', monospace",
          fontSize: '8px',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          transition: 'all 0.2s',
          backdropFilter: 'blur(6px)',
          // corner ticks via outline trick — not possible inline, handled by gate divs above
        }}
      >
        {/* ✕ as a CSS border triangle-free approach */}
        <span style={{
          fontSize: '7px',
          opacity: 0.75,
          color: 'rgba(30,200,180,0.8)',
          fontWeight: 700,
          lineHeight: 1,
        }}>✕</span>
        Exit
      </div>

      {/* ── Iframe ── */}
      <iframe
        src="/projector_movie_carousel.html"
        style={{
          width: '880px',
          height: '360px',
          border: 'none',
          display: 'block',
          filter: 'contrast(1.04) saturate(1.08)',
          borderRadius: '2px',
          transform: 'rotateY(0.3deg) rotateX(-0.2deg)',
        }}
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