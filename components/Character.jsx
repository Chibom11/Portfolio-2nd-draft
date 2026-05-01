import React, { useRef, useEffect, useCallback } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useGraph } from '@react-three/fiber'
import * as THREE from 'three'
import { forwardRef } from 'react'

const Character = forwardRef((props, rbRef) => {
  const characterRef = useRef()
  const rb = rbRef
  const [, get] = useKeyboardControls()

  const { scene, animations } = useGLTF('/model/untitled.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, characterRef)

  const currentAnim = useRef('stand idle')
  const isFlipping = useRef(false)

  const playAnimRef = useRef(null)
  
  const playAnim = useCallback((name) => {
    if (currentAnim.current === name) return
    actions[currentAnim.current]?.fadeOut(0.2)
    actions[name]?.reset().fadeIn(0.2).play()
    currentAnim.current = name
  }, [actions])

  // ✅ Keep the ref in sync with latest playAnim every render
  useEffect(() => {
    playAnimRef.current = playAnim
  })

  useEffect(() => {
    actions['stand idle']?.reset().fadeIn(0.2).play()
  }, [actions])

  const currentAngle = useRef(0)

  useFrame(() => {
    if (!rb.current) return

    const vel = rb.current.linvel()
    const speed = 20
    const { forward, backward, left, right, jog,flip } = get()
  if (isFlipping.current) return
  
    let x = 0, z = 0
    let targetAngle = currentAngle.current

    if (forward)  { z = speed;      targetAngle = 0 }
    if (backward) { z = -speed;     targetAngle = Math.PI }
    if (left)     { x = speed;      targetAngle = Math.PI / 2 }
    if (right)    { x = -speed;     targetAngle = -Math.PI / 2 }
   

    if (forward  && jog) { z =  speed + 8; targetAngle = 0 }
    if (backward && jog) { z = -speed - 8; targetAngle = Math.PI }
    if (left     && jog) { x =  speed + 8; targetAngle = Math.PI / 2 }
    if (right    && jog) { x = -speed - 8; targetAngle = -Math.PI / 2 }

    if (forward  && left)  targetAngle = Math.PI / 4
    if (forward  && right) targetAngle = -Math.PI / 4
    if (backward && left)  targetAngle = Math.PI * 0.75
    if (backward && right) targetAngle = -Math.PI * 0.75

    rb.current.setLinvel({ x, y: vel.y, z }, true)

    const quaternion = new THREE.Quaternion()
    quaternion.setFromEuler(new THREE.Euler(0, currentAngle.current, 0))
    rb.current.setRotation(
      { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
      true
    )

    currentAngle.current = THREE.MathUtils.lerp(currentAngle.current, targetAngle, 0.15)

    if (!isFlipping.current) {
      if ((forward || backward || left || right) && jog) playAnimRef.current('jog')
      else if (forward || backward || left || right)     playAnimRef.current('walk')
      else                                               playAnimRef.current('stand idle')
    }
  })

  useEffect(() => {
    const handleKeyDown = (event) => {
  
      if (event.key === ' ' && !isFlipping.current) {
        isFlipping.current = true
        
        playAnimRef.current('jump')
         setTimeout(() => {
        rbRef.current?.applyImpulse({ x: 0, y: 14000, z: 0 }, true)
      }, 250)

        const duration = (actions['jump']?._clip.duration ?? 1) * 1000
        console.log("Duration",duration)
        setTimeout(() => {
          isFlipping.current = false
        }, duration)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [actions])

  return (
    <RigidBody ref={rb} colliders="hull" scale={10}
      position={[0, 0, 0]} enabledRotations={[false, false, false]}
    >
      <group ref={characterRef}>
        <group name="Scene">
          <group name="Armature">
            <primitive object={nodes.Hips} />
            <skinnedMesh name="Streamoji_Body" geometry={nodes.Streamoji_Body.geometry} material={materials.Streamoji_Body} skeleton={nodes.Streamoji_Body.skeleton} />
            <skinnedMesh name="Streamoji_Outfit_Bottom" geometry={nodes.Streamoji_Outfit_Bottom.geometry} material={materials.Streamoji_Outfit_Bottom} skeleton={nodes.Streamoji_Outfit_Bottom.skeleton} />
            <skinnedMesh name="Streamoji_Outfit_Footwear" geometry={nodes.Streamoji_Outfit_Footwear.geometry} material={materials.Streamoji_Outfit_Footwear} skeleton={nodes.Streamoji_Outfit_Footwear.skeleton} />
            <skinnedMesh name="Streamoji_Outfit_Top" geometry={nodes.Streamoji_Outfit_Top.geometry} material={materials.Streamoji_Outfit_Top} skeleton={nodes.Streamoji_Outfit_Top.skeleton} />
            <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Streamoji_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
            <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Streamoji_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
            <skinnedMesh name="Streamoji_Head" geometry={nodes.Streamoji_Head.geometry} material={materials.Streamoji_Skin} skeleton={nodes.Streamoji_Head.skeleton} morphTargetDictionary={nodes.Streamoji_Head.morphTargetDictionary} morphTargetInfluences={nodes.Streamoji_Head.morphTargetInfluences} />
            <skinnedMesh name="Streamoji_Teeth" geometry={nodes.Streamoji_Teeth.geometry} material={materials.Streamoji_Teeth} skeleton={nodes.Streamoji_Teeth.skeleton} morphTargetDictionary={nodes.Streamoji_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Streamoji_Teeth.morphTargetInfluences} />
          </group>
        </group>
      </group>
    </RigidBody>
  )
})

export default Character