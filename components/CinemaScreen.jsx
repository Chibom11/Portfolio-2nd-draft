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
    occlude
    position={[192.62, 205.8, 282]}
    rotation={[0, -1.572, -0.001]}
    scale={6.2}
  >
    <div style={wrapperStyle}>
      <div style={scanlinesStyle} />
      <div style={edgeBleedStyle} />

      {/* dark cinematic background */}
      <div style={{
        width: '880px', height: '360px',
        background: 'radial-gradient(ellipse 160% 120% at 50% 50%, #1a1108 0%, #0d0a06 50%, #000 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', borderRadius: '4px',
        fontFamily: 'Georgia, serif',
      }}>

        {/* film edge burns */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background: 'linear-gradient(to right, rgba(255,130,10,0.09) 0%, transparent 5%, transparent 95%, rgba(255,130,10,0.07) 100%)'
        }} />

        {/* sprocket left */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'18px',
          background:'#080808', borderRight:'1px solid #161616',
          display:'flex', flexDirection:'column', justifyContent:'space-evenly', alignItems:'center'
        }}>
          {[...Array(8)].map((_,i) => (
            <div key={i} style={{ width:'7px', height:'10px', borderRadius:'2px', background:'#000', border:'0.5px solid #222' }} />
          ))}
        </div>

        {/* sprocket right */}
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'18px',
          background:'#080808', borderLeft:'1px solid #161616',
          display:'flex', flexDirection:'column', justifyContent:'space-evenly', alignItems:'center'
        }}>
          {[...Array(8)].map((_,i) => (
            <div key={i} style={{ width:'7px', height:'10px', borderRadius:'2px', background:'#000', border:'0.5px solid #222' }} />
          ))}
        </div>

        {/* vignette */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.97) 100%)'
        }} />

        {/* content */}
        <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column',
          alignItems:'center', textAlign:'center', padding:'0 80px'
        }}>
          <div style={{ fontFamily:'Courier New, monospace', fontSize:'9px', letterSpacing:'0.3em',
            textTransform:'uppercase', color:'rgba(255,210,100,0.28)', marginBottom:'22px',
            display:'flex', alignItems:'center', gap:'10px'
          }}>
            <span style={{ display:'block', height:'0.5px', width:'24px', background:'rgba(255,210,100,0.2)' }} />
            Frame 0001
            <span style={{ display:'block', height:'0.5px', width:'24px', background:'rgba(255,210,100,0.2)' }} />
          </div>

          <span style={{ fontFamily:'Georgia, serif', fontSize:'64px', lineHeight:'0.55',
            color:'rgba(255,210,100,0.14)', fontStyle:'italic', marginBottom:'6px', display:'block'
          }}>"</span>

          <p style={{ fontFamily:'Georgia, serif', fontSize:'24px', lineHeight:'1.75',
            fontWeight:300, fontStyle:'italic', color:'rgba(245,235,200,0.9)',
            letterSpacing:'0.03em', margin:0
          }}>
            Cinema is a matter of<br />
            <span style={{ fontStyle:'normal', fontWeight:600, color:'rgba(255,215,110,0.95)' }}>
              what's in the frame
            </span><br />
            and what's out.
          </p>

          <div style={{ height:'0.5px', width:'180px',
            background:'linear-gradient(to right, transparent, rgba(255,210,100,0.4), transparent)',
            margin:'18px auto'
          }} />

          <div style={{ fontFamily:'Courier New, monospace', fontSize:'13px',
            letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,210,100,0.85)',
            textShadow:'0 0 12px rgba(255,200,80,0.6)', marginBottom:'24px'
          }}>
            — Martin Scorsese
          </div>

          <div
            onClick={() => setTheatreView(true)}
            style={{
              cursor:'pointer', padding:'8px 24px',
              border:'1px solid rgba(255,210,100,0.4)', borderRadius:'2px',
              background:'rgba(255,200,80,0.06)', color:'rgba(255,210,100,0.8)',
              fontFamily:'Courier New, monospace', fontSize:'10px',
              letterSpacing:'0.3em', textTransform:'uppercase',
              display:'flex', alignItems:'center', gap:'8px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,200,80,0.15)'
              e.currentTarget.style.color = 'rgba(255,220,120,1)'
              e.currentTarget.style.borderColor = 'rgba(255,210,100,0.8)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,200,80,0.06)'
              e.currentTarget.style.color = 'rgba(255,210,100,0.8)'
              e.currentTarget.style.borderColor = 'rgba(255,210,100,0.4)'
            }}
          >
            <span style={{ fontSize:'12px' }}>▶</span>
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
    <div style={wrapperStyle}>
      <div style={scanlinesStyle} />
      <div style={edgeBleedStyle} />

      {/* close button */}
      <div
        onClick={() => setTheatreView(false)}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,200,80,0.18)'
          e.currentTarget.style.borderColor = 'rgba(255,210,100,0.9)'
          e.currentTarget.style.color = 'rgba(255,230,130,1)'
          e.currentTarget.style.letterSpacing = '0.35em'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.55)'
          e.currentTarget.style.borderColor = 'rgba(255,210,100,0.3)'
          e.currentTarget.style.color = 'rgba(255,210,100,0.6)'
          e.currentTarget.style.letterSpacing = '0.28em'
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '0px',
          zIndex: 20,
          cursor: 'pointer',
          padding: '4px 14px',
          border: '1px solid rgba(255,210,100,0.3)',
          borderRadius: '2px',
          background: 'rgba(0,0,0,0.55)',
          color: 'rgba(255,210,100,0.6)',
          fontFamily: 'Courier New, monospace',
          fontSize: '10px',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s',
          backdropFilter: 'blur(4px)',
        }}
      >
        <span style={{ fontSize: '8px', opacity: 0.7 }}>✕</span>
        Exit
      </div>

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