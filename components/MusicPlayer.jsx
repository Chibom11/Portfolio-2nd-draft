import { Html } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'

const tracks = [
  { title: "lambic 9 poetry",  artist: "Squarepusher", album: "Ultravisitor",               id: "r9nyEmHW0EA" },
  { title: "lambic 5 poetry",  artist: "Squarepusher", album: "Budakhan Mindphone",          id: "xihg0s9_1eo" },
  { title: "K2 Central",       artist: "Squarepusher", album: "Kammerkonzert",               id: "cAvdRtOdRcM" },
  { title: "Beep Street",      artist: "Squarepusher", album: "Hard Normal Daddy",           id: "LKJ-0ZO4pxo" },
  { title: "Flim",             artist: "Aphex Twin",   album: "Come to Daddy",               id: "-yNHlKAzyVA" },
  { title: "Xtal",             artist: "Aphex Twin",   album: "Selected Ambient Works 85-92",id: "2tOutF8B3f8"  },
  { title: "Avril 14th",       artist: "Aphex Twin",   album: "Drukqs",                      id: "uxTdTaNIUxo" },
]

const NEON  = '#ff4d94'
const NEON2 = '#ffaacc'
const GLOW  =  '0 0 4px #fff, 0 0 10px #ff4d94, 0 0 25px #ff2d78, 0 0 50px #ff006a, 0 0 90px #ff006a'
const GLOW_DIM = '0 0 3px #ffaacc, 0 0 8px #ff6eb0aa, 0 0 18px #ff2d7866'

function SynthwaveCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let frame = 0
    let raf

    const W = canvas.width  = 370
    const H = canvas.height = 380

    const HORIZON = H * 0.45
    const GRID_COLOR = '#ff2d78'
    const SUN_Y = HORIZON - 10

    function drawSun(t) {
      // sun body
      const grad = ctx.createRadialGradient(W/2, SUN_Y, 2, W/2, SUN_Y, 55)
      grad.addColorStop(0,   '#fff0f8')
      grad.addColorStop(0.3, '#ff6eb0')
      grad.addColorStop(0.7, '#ff2d78')
      grad.addColorStop(1,   'transparent')
      ctx.beginPath()
      ctx.arc(W/2, SUN_Y, 55, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // scanlines across sun
      ctx.save()
      ctx.beginPath()
      ctx.arc(W/2, SUN_Y, 55, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = 'rgba(20,0,15,0.55)'
      for (let s = SUN_Y - 55; s < SUN_Y + 55; s += 7) {
        ctx.fillRect(W/2 - 55, s + 3, 110, 3)
      }
      ctx.restore()

      // outer glow ring
      const glow = ctx.createRadialGradient(W/2, SUN_Y, 40, W/2, SUN_Y, 90)
      glow.addColorStop(0,   '#ff2d7844')
      glow.addColorStop(1,   'transparent')
      ctx.beginPath()
      ctx.arc(W/2, SUN_Y, 90, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()
    }

    function drawGrid(t) {
      const speed  = (t * 0.008) % 1
      const vLines = 12
      const hLines = 10

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, HORIZON, W, H - HORIZON)
      ctx.clip()

      // vertical lines — converge to vanishing point
      for (let i = 0; i <= vLines; i++) {
        const xFrac = i / vLines
        const xTop  = W * xFrac
        const xBot  = W * xFrac          // same x at bottom edge
        const vx    = W / 2 + (xFrac - 0.5) * W * 3.5

        ctx.beginPath()
        ctx.moveTo(W/2, HORIZON)
        ctx.lineTo(vx, H + 10)
        const alpha = 0.15 + 0.45 * (1 - Math.abs(xFrac - 0.5) * 1.8)
        ctx.strokeStyle = `rgba(255,45,120,${Math.max(0, alpha)})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      // horizontal lines — scroll toward viewer
      for (let j = 0; j < hLines; j++) {
        const frac  = ((j / hLines) + speed) % 1
        // perspective: lines bunch near horizon, spread near bottom
        const persp = Math.pow(frac, 2.2)
        const y     = HORIZON + persp * (H - HORIZON + 20)
        const alpha = 0.1 + 0.6 * persp

        // x spread widens toward bottom
        const spread = persp * W * 1.8
        const x0 = W/2 - spread/2
        const x1 = W/2 + spread/2

        ctx.beginPath()
        ctx.moveTo(x0, y)
        ctx.lineTo(x1, y)
        ctx.strokeStyle = `rgba(255,45,120,${alpha})`
        ctx.lineWidth = 0.7 + persp * 1.2
        ctx.stroke()
      }

      ctx.restore()
    }

    function drawStars(t) {
      const stars = [
        [40,  20, 0.6], [90,  60, 0.4], [150, 15, 0.8], [200, 40, 0.3],
        [260, 10, 0.7], [310, 55, 0.5], [350, 25, 0.6], [20,  80, 0.4],
        [330, 80, 0.3], [180, 70, 0.5], [70,  45, 0.3], [280, 30, 0.6],
      ]
      stars.forEach(([x, y, base]) => {
        const twinkle = base * (0.5 + 0.5 * Math.sin(t * 0.03 + x))
        ctx.beginPath()
        ctx.arc(x, y, 1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,180,220,${twinkle})`
        ctx.fill()
      })
    }

    function drawSkyGrad() {
      const grad = ctx.createLinearGradient(0, 0, 0, HORIZON)
      grad.addColorStop(0,   'rgba(10,0,20,1)')
      grad.addColorStop(0.6, 'rgba(40,0,40,1)')
      grad.addColorStop(1,   'rgba(80,0,60,1)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, HORIZON)
    }

    function drawGroundGrad() {
      const grad = ctx.createLinearGradient(0, HORIZON, 0, H)
      grad.addColorStop(0, 'rgba(60,0,40,1)')
      grad.addColorStop(1, 'rgba(10,0,20,1)')
      ctx.fillStyle = grad
      ctx.fillRect(0, HORIZON, W, H - HORIZON)
    }

    function tick() {
      ctx.clearRect(0, 0, W, H)
      drawSkyGrad()
      drawGroundGrad()
      drawStars(frame)
      drawSun(frame)
      drawGrid(frame)
      frame++
      raf = requestAnimationFrame(tick)
    }

    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '370px', height: '380px',
        opacity: 0.55,
      }}
    />
  )
}

// MusicPlayer.jsx

export function MusicPlayerContent() {
  const [active, setActive] = useState(null)

  return (
    <div style={{
      position: 'relative',
      height: '380px',
      width: '375px',
      background: 'rgba(20,0,15,0.97)',
      border: `1px solid ${NEON}99`,
      boxShadow: `
        0 0 10px #ff2d7855,
        0 0 30px #ff2d7844,
        0 0 60px #ff006a33,
        inset 0 0 20px #ff2d7815,
        inset 0 0 60px #ff006a08
      `,
      fontFamily: 'monospace',
      overflow: 'hidden',
    }}>
      <SynthwaveCanvas />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {active !== null && (
          <iframe
            width="0" height="0"
            src={`https://www.youtube.com/embed/${tracks[active].id}?autoplay=1&loop=1&playlist=${tracks[active].id}`}
            allow="autoplay; encrypted-media"
            style={{ border: 'none', display: 'block' }}
          />
        )}
        <div style={{
          padding: '7px 12px 6px',
          fontSize: 10,
          letterSpacing: '0.15em',
          color: NEON,
          textShadow: GLOW,
          borderBottom: `1px solid ${NEON}44`,
          textTransform: 'uppercase',
          background: `linear-gradient(90deg, #ff2d7818, transparent)`,
        }}>
          ▶ now playing
        </div>
        {tracks.map((t, i) => {
          const isActive = active === i
          return (
            <div key={i} onClick={() => setActive(i)} style={{
              padding: '7px 12px',
              cursor: 'pointer',
              background: isActive ? `linear-gradient(90deg, #ff2d7828, #ff006a14)` : 'transparent',
              borderBottom: `0.5px solid ${NEON}22`,
              lineHeight: 1.5,
              transition: 'background 0.2s',
              boxShadow: isActive ? `inset 0 0 20px #ff2d7818` : 'none',
            }}>
              <div style={{
                fontSize: 11,
                color: isActive ? NEON : NEON2,
                textShadow: isActive ? GLOW : GLOW_DIM,
                fontWeight: isActive ? 'bold' : 'normal',
              }}>
                {t.title}
                <span style={{ opacity: 0.5, fontWeight: 'normal' }}> · {t.artist}</span>
              </div>
              <div style={{
                fontSize: 10,
                marginTop: 1,
                color: '#ffaacc',
                textShadow: `0 0 8px ${NEON}66, 0 0 20px #ff006a44`,
                letterSpacing: '0.05em',
              }}>
                {t.album}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}