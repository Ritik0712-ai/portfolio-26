'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Html, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Floating particles
function Particles({ count = 200 }) {
  const mesh = useRef<THREE.Points>(null)
  const lightColor = '#7c3aed'
  const fillColor = '#ec4899'
  
  const particlesPosition = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    particlesPosition[i * 3] = (Math.random() - 0.5) * 20
    particlesPosition[i * 3 + 1] = (Math.random() - 0.5) * 20
    particlesPosition[i * 3 + 2] = (Math.random() - 0.5) * 20
  }

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.0005
      mesh.current.rotation.y += 0.0008
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={lightColor}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

// Animated sphere
function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} position={[2, 0, -2]}>
        <MeshDistortMaterial
          color="#7c3aed"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

// Second sphere
function AnimatedSphere2() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.25
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <Sphere ref={meshRef} args={[0.7, 100, 100]} position={[-2.5, 1, -1]}>
        <MeshDistortMaterial
          color="#ec4899"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.3}
          metalness={0.7}
        />
      </Sphere>
    </Float>
  )
}

// Scene component
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} color="#7c3aed" intensity={0.5} />
      <Particles />
      <AnimatedSphere />
      <AnimatedSphere2 />
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
    </>
  )
}

// 3D Canvas component
export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <Scene />
      </Canvas>
    </div>
  )
}
