"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { InstancedMesh } from "three"
import * as THREE from "three"

interface FloatingParticlesProps {
  count: number
}

export function FloatingParticles({ count }: FloatingParticlesProps) {
  const meshRef = useRef<InstancedMesh>(null)

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10],
        speed: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() * 0.1 + 0.05,
      })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (meshRef.current) {
      particles.forEach((particle, i) => {
        const matrix = new THREE.Matrix4()
        const time = state.clock.elapsedTime

        const x = particle.position[0] + Math.sin(time * particle.speed + particle.phase) * 2
        const y = particle.position[1] + Math.cos(time * particle.speed * 0.7 + particle.phase) * 1.5
        const z = particle.position[2] + Math.sin(time * particle.speed * 0.5 + particle.phase) * 1

        matrix.setPosition(x, y, z)
        matrix.scale(new THREE.Vector3(particle.size, particle.size, particle.size))

        meshRef.current!.setMatrixAt(i, matrix)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} transparent opacity={0.6} />
    </instancedMesh>
  )
}
