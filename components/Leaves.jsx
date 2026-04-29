// Leaves.jsx
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function LeafCloud({ center = [0, 0, 0], count = 600, scale=1,colors = ['#E8830A', '#C85A00', '#F2A800', '#A84400'] }) {
  const meshRefs = useRef([])

  const layers = useMemo(() => {
    return colors.map((color) => {
      const matrices = []
      const dummy = new THREE.Object3D()

      for (let i = 0; i < count / colors.length; i++) {
       const r = Math.cbrt(Math.random()) * 0.038 * scale 
        
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        dummy.position.set(
          center[0] + r * Math.sin(phi) * Math.cos(theta),
          center[1] + r * Math.cos(phi) * 0.65,
          center[2] + r * Math.sin(phi) * Math.sin(theta)
        )

          const s = (0.0012 + Math.random() * 0.0018) * scale 
        dummy.scale.set(s, s, s)
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
        dummy.updateMatrix()
        matrices.push(dummy.matrix.clone())
      }

      return { color, matrices }
    })
  }, [center[0], center[1], center[2], count,scale])

  useEffect(() => {
    layers.forEach(({ matrices }, li) => {
      const mesh = meshRefs.current[li]
      if (!mesh) return
      matrices.forEach((mat, i) => mesh.setMatrixAt(i, mat))
      mesh.instanceMatrix.needsUpdate = true
    })
  }, [layers])

  const swayOffset = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const dummy = new THREE.Object3D()

    layers.forEach(({ matrices }, li) => {
      const mesh = meshRefs.current[li]
      if (!mesh) return

      matrices.forEach((baseMat, i) => {
        dummy.matrix.copy(baseMat)
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)

        const dx = dummy.position.x - center[0]
        const dz = dummy.position.z - center[2]
        const dist = Math.sqrt(dx * dx + dz * dz)

        dummy.position.x += Math.sin(t * 1.4 + swayOffset + i * 0.05) * dist * 0.4 * 0.015
        dummy.position.y += Math.sin(t * 2.1 + swayOffset + i * 0.03) * 0.0008

        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })

      mesh.instanceMatrix.needsUpdate = true
    })
  })

  return (
    <>
      {layers.map(({ color, matrices }, li) => (
        <instancedMesh key={li} ref={el => (meshRefs.current[li] = el)} args={[null, null, matrices.length]} castShadow>
          <boxGeometry args={[1, 0.02, 1]} />
          <meshStandardMaterial color={color} roughness={1} metalness={0} />
        </instancedMesh>
      ))}
    </>
  )
}

// ✅ Accept position prop and offset all cluster centers by it
export default function Leaves({ position = [0, 0, 0],scale=1 }) {
  const [px, py, pz] = position

  return (
    <>
      <LeafCloud
        center={[px + 0.01,  py + 0.26, pz - 0.02]}
        count={800}
        colors={['#E8830A', '#C85A00', '#F2A800', '#9C3D00']}
         scale={scale}
      />
      <LeafCloud
        center={[px - 0.015, py + 0.24, pz + 0.01]}
        count={400}
        colors={['#D06800', '#F09000', '#A84400']}
        scale={scale}
      />
      <LeafCloud
        center={[px + 0.005, py + 0.285, pz - 0.01]}
        count={300}
        colors={['#F2A800', '#E8830A', '#FFB830']}
         scale={scale}
      />
    </>
  )
}