import React, { forwardRef, useCallback, useEffect, useRef } from 'react'
import { useFrame, useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

export const Miles = forwardRef((props, rbRef) => {
  const group = React.useRef()
  const { scene, animations } = useGLTF('/model/mup.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)
console.log(actions)
  const currentAnim = useRef('happyidle')
  useEffect(() => {
    actions['happyidle'].reset().play()
  }, [])

  const playAnim = useCallback((name) => {
    if (currentAnim.current === name) return
    actions[currentAnim.current]?.fadeOut(0.2)
    actions[name].reset().fadeIn(0.2).play()
    currentAnim.current = name
  })

  const currentAngle = useRef(0)
  const isFlipping = useRef(false)
  const [, get] = useKeyboardControls()

  useFrame(() => {
    if (!rbRef.current) return

    const vel = rbRef.current.linvel()
    const speed = 20
    const { forward, backward, left, right, jog, flip,dance } = get()
    if (isFlipping.current) return

    let x = 0, z = 0
    let targetAngle = currentAngle.current

    if (forward)  { z =  speed;     targetAngle = 0 }
    if (backward) { z = -speed;     targetAngle = Math.PI }
    if (left)     { x =  speed;     targetAngle = Math.PI / 2 }
    if (right)    { x = -speed;     targetAngle = -Math.PI / 2 }

    if (forward  && jog) { z =  speed + 8; targetAngle = 0 }
    if (backward && jog) { z = -speed - 8; targetAngle = Math.PI }
    if (left     && jog) { x =  speed + 8; targetAngle = Math.PI / 2 }
    if (right    && jog) { x = -speed - 8; targetAngle = -Math.PI / 2 }

    if (forward  && left)  targetAngle = Math.PI / 4
    if (forward  && right) targetAngle = -Math.PI / 4
    if (backward && left)  targetAngle = Math.PI * 0.75
    if (backward && right) targetAngle = -Math.PI * 0.75

    rbRef.current.setLinvel({ x, y: vel.y, z }, true)

    const quaternion = new THREE.Quaternion()
    quaternion.setFromEuler(new THREE.Euler(0, currentAngle.current, 0))
    rbRef.current.setRotation(
      { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
      true
    )

    currentAngle.current = THREE.MathUtils.lerp(currentAngle.current, targetAngle, 0.15)

    if (!isFlipping.current) {
      if ((forward || backward || left || right) && jog) playAnim('walk')
      else if (forward || backward || left || right)     playAnim('walk')
      else                                               playAnim('happyidle')
    }
  })

  useEffect(() => {
    const handleKeySpaceDown = (event) => {
      if (event.key === ' ' && !isFlipping.current) {
        isFlipping.current = true
        playAnim('jump')
        setTimeout(() => {
          rbRef.current?.applyImpulse({ x: 0, y: 63000, z: 0 }, true)
        }, 250)
        const duration = (actions['jump']?._clip.duration ?? 1) * 1000
        setTimeout(() => {
          isFlipping.current = false
        }, duration)
      }
    }
    document.addEventListener('keydown', handleKeySpaceDown)
    return () => document.removeEventListener('keydown', handleKeySpaceDown)
  }, [actions])

  useEffect(()=>{
    const handleKeyQDown=(event)=>{
      if(event.key.toLowerCase() === 'q' && !isFlipping.current){
        isFlipping.current=true;
        playAnim('dance');
        const duration=(actions['dance']?._clip.duration ?? 1)*1000;
        setTimeout(()=>{
          isFlipping.current=false;
        },duration)
      }
    }
    document.addEventListener('keydown',handleKeyQDown);
    return ()=> document.removeEventListener('keydown',handleKeyQDown)
  },[actions])

  useEffect(()=>{
    if(props.playfall===true && !isFlipping.current){
      isFlipping.current=true;

      playAnim('pulled');
        const duration=(actions['pulled']?._clip.duration ?? 1)*1000;
        setTimeout(()=>{
          isFlipping.current=false;
        },duration)
    }
  },[props.playfall,actions])

  return (
  
<RigidBody colliders={false} position={[4, 20, 0]} lockRotations ref={rbRef}>
   
      <CuboidCollider args={[3, 14, 5]} position={[0, 14, 0]} />

    
      <group scale={2.8} {...props} dispose={null}>
        <group name="Scene">
          <group ref={group} name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <primitive object={nodes.mixamorigHips} />
            <skinnedMesh
              name="Object_2001"
              geometry={nodes.Object_2001.geometry}
              material={materials['aiStandardSurface24SG.001']}
              skeleton={nodes.Object_2001.skeleton}
            />
            <skinnedMesh
              name="Object_3001"
              geometry={nodes.Object_3001.geometry}
              material={materials['set19.001']}
              skeleton={nodes.Object_3001.skeleton}
            />
            <skinnedMesh
              name="Object_4001"
              geometry={nodes.Object_4001.geometry}
              material={materials['set22.001']}
              skeleton={nodes.Object_4001.skeleton}
            />
          </group>
        </group>
      </group>
    </RigidBody>
  )
})

useGLTF.preload('/model/mup.glb')