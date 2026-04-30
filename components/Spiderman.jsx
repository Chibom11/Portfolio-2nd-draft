import React, { forwardRef, useCallback, useEffect, useRef, useMemo } from 'react'
import { useFrame, useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { CapsuleCollider, CuboidCollider, RigidBody } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

export const Spiderman = forwardRef((props, rbRef) => {
  const group = useRef()
  const { scene, animations } = useGLTF('/model/spiderman.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group) 
console.log(actions)
  const currentAnim=useRef('idle')
  const playAnim=useCallback((name)=>{
    if(currentAnim.current===name) return;
    actions[currentAnim.current]?.fadeOut(0.2);
    actions[name].reset().fadeIn(0.2).play();
    currentAnim.current=name;
  })


  useEffect(() => {
    
   
    actions['idle']?.reset().play() 
  }, [])

  const currentAngle = useRef(0)
  const isFlipping=useRef(false)
   const [, get] = useKeyboardControls()
    useFrame(() => {
      if (!rbRef.current) return
  
      const vel = rbRef.current.linvel()
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
        else                                               playAnim('idle')
      }
    })

  useEffect(() => {
    const handleKeyDown = (event) => {
  
      if (event.key === ' ' && !isFlipping.current) {
        isFlipping.current = true
        
        playAnim('jump')
      setTimeout(() => {
        rbRef.current?.applyImpulse({ x: 0, y: 30000, z: 0 }, true)
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
   <RigidBody colliders={false} lockRotations ref={rbRef}>
      <CuboidCollider args={[4, 7,3]} position={[0, 7, 0]} />
      <group {...props} dispose={null}>
       
        <group name="Scene">
        
          <group
            ref={group}
            name="Armature"
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.07}
          >
            <primitive object={nodes.mixamorigHips} />
            <skinnedMesh
              name="Amazing_Spider-man_OBJ_mesh_Meshpart1Mtl_0"
              geometry={nodes['Amazing_Spider-man_OBJ_mesh_Meshpart1Mtl_0'].geometry}
              material={materials.Meshpart1Mtl}
              skeleton={nodes['Amazing_Spider-man_OBJ_mesh_Meshpart1Mtl_0'].skeleton}
            />
          </group>
        </group>
      </group>
    </RigidBody>
  )
})

useGLTF.preload('/model/spiderman.glb')