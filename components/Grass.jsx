/**
 * Grass.jsx — Billboard alpha-map grass patch
 * Fitted to your scene: model scale=0.009, position=[0,-0.17,0]
 *
 * Drop-in: already imported as <Grass /> in Experience.jsx
 * Sits around the base of the room model as a small decorative patch.
 */

import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── How many texture variants to bake (more = less repetition) ────────────
const TEX_VARIANTS = 5

// ─── Procedural spike-clump alpha texture ──────────────────────────────────
function createGrassTexture() {
  const W = 128, H = 256
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const ctx = cv.getContext('2d')
  ctx.clearRect(0, 0, W, H)

  const spikes = 3 + Math.floor(Math.random() * 3)
  for (let s = 0; s < spikes; s++) {
    const cx  = (s + 0.5) / spikes * W
    const tip = H * (0.04 + Math.random() * 0.22)
    const hw  = (W / spikes) * (0.22 + Math.random() * 0.18)
    const lean = (Math.random() - 0.5) * hw * 0.9

    const grad = ctx.createLinearGradient(cx, H, cx, tip)
    grad.addColorStop(0,   'rgba(255,255,255,1)')
    grad.addColorStop(0.6, 'rgba(255,255,255,0.85)')
    grad.addColorStop(1,   'rgba(255,255,255,0)')

    ctx.beginPath()
    ctx.moveTo(cx - hw, H)
    ctx.quadraticCurveTo(cx - hw * 0.3 + lean, (H + tip) * 0.5, cx + lean, tip)
    ctx.quadraticCurveTo(cx + hw * 0.3 + lean, (H + tip) * 0.5, cx + hw, H)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(cv)
  return tex
}

// ─── Blade geometry (plane pivoted at base, tapered) ───────────────────────
function createBladeGeo() {
  const geo = new THREE.PlaneGeometry(1, 1, 1, 4)
  geo.translate(0, 0.5, 0)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    pos.setX(i, pos.getX(i) * (1.0 - y * 0.7))
  }
  pos.needsUpdate = true
  return geo
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function Grass({
  // ── Placement — tweak these to fit your scene ──
  position   = [0, -0.17, 0],   // match your model's Y base
  radius     = 0.18,             // world-unit patch radius (model is ~0.009 scale → room ~0.2 units wide)
  yOffset    = 0.0,              // fine-tune vertical position
  // ── Visuals ──
  count      = 260,
  color      = '#2d1a3e',        // dark purple to match your night palette; swap to '#1e3a10' for green
  windSpeed  = 0.5,
  windStrength = 0.10,
  isNight    = false,            // passed from Experience if you want colour to shift
}) {
  const meshRefs = useRef([])
  const dummy    = useMemo(() => new THREE.Object3D(), [])

  const textures = useMemo(
    () => Array.from({ length: TEX_VARIANTS }, createGrassTexture),
    []
  )

  // Derive day/night tint
  const dayColor   = '#2a4a18'
  const nightColor = '#2d1a3e'

  const variants = useMemo(() => {
    return textures.map((tex) => {
      const geo = createBladeGeo()
      const mat = new THREE.MeshBasicMaterial({
        map:       tex,
        alphaMap:  tex,
        alphaTest: 0.18,
        transparent: true,
        side:      THREE.DoubleSide,
        depthWrite: false,
        color:     new THREE.Color(color),
      })

      const perV = Math.ceil(count / TEX_VARIANTS)
      const placements = Array.from({ length: perV }, () => {
        const r     = Math.pow(Math.random(), 0.55) * radius
        const theta = Math.random() * Math.PI * 2
        return {
          x:      Math.cos(theta) * r,
          z:      Math.sin(theta) * r,
          ry:     Math.random() * Math.PI * 2,
          height: 0.03 + Math.random() * 0.05,   // tiny — suits your scene scale
          width:  0.015 + Math.random() * 0.02,
          phase:  Math.random() * Math.PI * 2,
          lean:   (Math.random() - 0.5) * 0.12,
        }
      })

      return { geo, mat, count: perV, placements }
    })
  }, [textures, count, radius, color])

  // Update colour when day/night flips
  useEffect(() => {
    const c = new THREE.Color(isNight ? nightColor : dayColor)
    variants.forEach(v => v.mat.color.copy(c))
  }, [isNight, variants])

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime()

    variants.forEach((v, vi) => {
      const mesh = meshRefs.current[vi]
      if (!mesh) return

      v.placements.forEach((p, i) => {
        const sway  = Math.sin(t * windSpeed + p.phase) * windStrength
        const swayZ = Math.sin(t * windSpeed * 0.7 + p.phase + 1.1) * windStrength * 0.35

        // Billboard: face camera on Y axis
        const wx  = position[0] + p.x
        const wz  = position[2] + p.z
        const ang = Math.atan2(camera.position.x - wx, camera.position.z - wz)

        dummy.position.set(p.x, yOffset, p.z)
        dummy.rotation.set(sway + p.lean, ang, swayZ)
        dummy.scale.set(p.width, p.height, 1)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })

      mesh.instanceMatrix.needsUpdate = true
    })
  })

  return (
    <group position={position}>
      {/* Thin dark ground disc so grass has a base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, yOffset - 0.001, 0]}>
        <circleGeometry args={[radius + 0.03, 40]} />
        <meshBasicMaterial color={isNight ? '#150d1e' : '#111a09'} />
      </mesh>

      {variants.map((v, vi) => (
        <instancedMesh
          key={vi}
          ref={el => (meshRefs.current[vi] = el)}
          args={[v.geo, v.mat, v.count]}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}

/**
 * ─── Quick positioning guide for YOUR scene ──────────────────────────────
 *
 * Your room: scale=0.009, position=[0,-0.17,0], rotation=[0,PI/3,0]
 * The model's internal units are ~20 units wide, × 0.009 = ~0.18 world units.
 *
 * So radius=0.18 covers the whole room footprint.
 * For a tighter clump at one corner, try radius=0.08 and shift position.
 *
 * EXAMPLES:
 *
 * Front-left corner clump:
 *   <Grass position={[-0.12, -0.17, 0.05]} radius={0.07} count={120} />
 *
 * Ring around the whole base:
 *   <Grass position={[0, -0.17, 0]} radius={0.20} count={350} />
 *
 * Two separate patches:
 *   <Grass position={[-0.15, -0.17, 0.1]} radius={0.06} count={100} color="#1e3a10" />
 *   <Grass position={[0.1,  -0.17, -0.1]} radius={0.05} count={80}  color="#2d1a3e" />
 *
 * Pass isNight to shift colour automatically:
 *   <Grass isNight={isNight} position={[0,-0.17,0]} radius={0.18} />
 *
 * ─── Colour presets ───────────────────────────────────────────────────────
 *   Purple night (matches your room):  color="#2d1a3e"
 *   Forest green:                      color="#1e3a10"
 *   Dry autumn:                        color="#3d2a10"
 *   Deep teal:                         color="#0e2d3a"
 */