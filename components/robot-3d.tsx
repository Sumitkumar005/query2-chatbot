"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh, Group } from "three"

interface Robot3DProps {
  position?: [number, number, number]
  scale?: number
}

export function Robot3D({ position = [0, 0, 0], scale = 1 }: Robot3DProps) {
  const groupRef = useRef<Group>(null)
  const headRef = useRef<Mesh>(null)
  const eyeLeftRef = useRef<Mesh>(null)
  const eyeRightRef = useRef<Mesh>(null)
  const chestLightRef = useRef<Mesh>(null)
  const antennaLightRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }

    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }

    // Blinking eyes effect
    if (eyeLeftRef.current && eyeRightRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 2) > 0.9 ? 0.1 : 1
      eyeLeftRef.current.scale.y = blink
      eyeRightRef.current.scale.y = blink
    }

    // Pulsing lights
    if (chestLightRef.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * 3) + 1) * 0.5
      chestLightRef.current.scale.setScalar(0.8 + pulse * 0.4)
    }

    if (antennaLightRef.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * 4) + 1) * 0.5
      antennaLightRef.current.scale.setScalar(0.8 + pulse * 0.6)
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Robot Head */}
      <mesh ref={headRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} envMapIntensity={1} />
      </mesh>

      {/* Eyes */}
      <mesh ref={eyeLeftRef} position={[-0.25, 1.6, 0.7]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>

      <mesh ref={eyeRightRef} position={[0.25, 1.6, 0.7]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>

      {/* Eye glow rings */}
      <mesh position={[-0.25, 1.6, 0.75]}>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} transparent opacity={0.6} />
      </mesh>

      <mesh position={[0.25, 1.6, 0.75]}>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} transparent opacity={0.6} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 1.8, 32]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} envMapIntensity={1} />
      </mesh>

      {/* Chest Panel */}
      <mesh position={[0, 0.2, 0.8]}>
        <boxGeometry args={[0.4, 0.6, 0.05]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Chest Light */}
      <mesh ref={chestLightRef} position={[0, 0.2, 0.85]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={1} transparent opacity={0.8} />
      </mesh>

      {/* Side Lights */}
      <mesh position={[-0.15, 0, 0.85]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.6} />
      </mesh>

      <mesh position={[0.15, 0, 0.85]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.6} />
      </mesh>

      {/* Arms */}
      <mesh position={[-1, 0.5, 0]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh position={[1, 0.5, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Hands */}
      <mesh position={[-1.4, -0.1, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh position={[1.4, -0.1, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh ref={antennaLightRef} position={[0, 2.7, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1.2} transparent opacity={0.9} />
      </mesh>

      {/* Base/Legs */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.8, 0.6, 0.4, 32]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Hover effect rings */}
      <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.1, 32]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.2} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
