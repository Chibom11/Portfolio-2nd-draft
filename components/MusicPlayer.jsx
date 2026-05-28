import { Html } from '@react-three/drei'
import { useState } from 'react'

const tracks = [
  { title: "lambic 9 poetry",  artist: "Squarepusher", album: "Ultravisitor",               id: "r9nyEmHW0EA" },
  { title: "lambic 5 poetry",  artist: "Squarepusher", album: "Budakhan Mindphone",          id: "xihg0s9_1eo" },
  { title: "K2 Central",       artist: "Squarepusher", album: "Kammerkonzert",               id: "cAvdRtOdRcM" },
  { title: "Beep Street",      artist: "Squarepusher", album: "Hard Normal Daddy",           id: "LKJ-0ZO4pxo" },
  { title: "Flim",             artist: "Aphex Twin",   album: "Come to Daddy",               id: "-yNHlKAzyVA" },
  { title: "Xtal",             artist: "Aphex Twin",   album: "Selected Ambient Works 85-92",id: "2tOutF8B3f8"  },
  { title: "Avril 14th",       artist: "Aphex Twin",   album: "Drukqs",                      id: "uxTdTaNIUxo" },
]

const NEON  = '#00eeff'
const NEON2 = '#00cfff'
const GLOW  = '0 0 6px #00eeff, 0 0 14px #00cfff, 0 0 28px #0099ff'
const GLOW_DIM = '0 0 4px #00aacc88'

export function MusicPlayer() {
  const [active, setActive] = useState(null)

  return (
<Html
  position={[-21, 5, 143]}
  rotation={[1.2, 1.973, 0]}   // matches configurator003's rotation
  transform
  occlude
  scale={1}
  style={{ width: '280px', pointerEvents: 'auto' }}
>
      <div style={{
        background: 'rgba(0,5,20,0.95)',
        border: `0.5px solid ${NEON}55`,
        boxShadow: `0 0 12px #00eeff22, inset 0 0 18px #00eeff08`,
        borderRadius: 10,
        fontFamily: 'monospace',
        overflow: 'hidden',
      }}>

            {active !== null && (
            <iframe
                width="0" height="0"
                src={`https://www.youtube.com/embed/${tracks[active].id}?autoplay=1&loop=1&playlist=${tracks[active].id}`}
                allow="autoplay; encrypted-media"
                style={{ border: 'none', display: 'block' }}
            />
            )}

        {/* header */}
        <div style={{
          padding: '7px 12px 6px',
          fontSize: 10,
          letterSpacing: '0.15em',
          color: NEON,
          textShadow: GLOW,
          borderBottom: `0.5px solid ${NEON}33`,
          textTransform: 'uppercase',
        }}>
          ▶ now playing
        </div>

        {tracks.map((t, i) => {
          const isActive = active === i
          return (
            <div
              key={i}
              onClick={() => setActive(i)}
              style={{
                padding: '7px 12px',
                cursor: 'pointer',
                background: isActive ? `${NEON}10` : 'transparent',
                borderBottom: `0.5px solid ${NEON}11`,
                lineHeight: 1.5,
                transition: 'background 0.2s',
              }}
            >
              {/* title + artist */}
              <div style={{
                fontSize: 11,
                color: isActive ? NEON : NEON2,
                textShadow: isActive ? GLOW : GLOW_DIM,
                fontWeight: isActive ? 'bold' : 'normal',
              }}>
                {t.title}
                <span style={{ opacity: 0.5, fontWeight: 'normal' }}> · {t.artist}</span>
              </div>
              {/* album */}
              <div style={{
                fontSize: 10,
                marginTop: 1,
                color: `${NEON}88`,
                textShadow: `0 0 6px ${NEON}44`,
                letterSpacing: '0.05em',
              }}>
                {t.album}
              </div>
            </div>
          )
        })}

      </div>
    </Html>
  )
}