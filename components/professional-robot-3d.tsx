"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh, Group } from "three"

interface ProfessionalRobot3DProps {
  position?: [number, number, number]
  scale?: number
}

export function ProfessionalRobot3D({ position = [0, 0, 0], scale = 1 }: ProfessionalRobot3DProps) {
  const groupRef = useRef<Group>(null)
  const headRef = useRef<Mesh>(null)
  const eyeLeftRef = useRef<Mesh>(null)
  const eyeRightRef = useRef<Mesh>(null)
  const chestLightRef = useRef<Mesh>(null)
  const shoulderLeftRef = useRef<Mesh>(null)
  const shoulderRightRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.1
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }

    if (headRef.current) {
      // Gentle head movement
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.1
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.05
    }

    // Realistic blinking
    if (eyeLeftRef.current && eyeRightRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 1.5) > 0.95 ? 0.1 : 1
      eyeLeftRef.current.scale.y = blink
      eyeRightRef.current.scale.y = blink
    }

    // Breathing chest light
    if (chestLightRef.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) * 0.3 + 0.7
      chestLightRef.current.scale.setScalar(pulse)
    }

    // Shoulder movement
    if (shoulderLeftRef.current && shoulderRightRef.current) {
      shoulderLeftRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      shoulderRightRef.current.rotation.z = -Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main Body - Professional sleek design */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.9, 2.2, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.05} envMapIntensity={1.5} />
      </mesh>

      {/* Chest Panel - Modern design */}
      <mesh position={[0, 0.3, 0.9]}>
        <boxGeometry args={[0.6, 0.8, 0.08]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Central Chest Light - Professional blue */}
      <mesh ref={chestLightRef} position={[0, 0.3, 0.95]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>

      {/* Side Indicator Lights */}
      <mesh position={[-0.2, 0.1, 0.95]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.2, 0.1, 0.95]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.6} />
      </mesh>

      {/* Professional Head Design */}
      <mesh ref={headRef} position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial color="#0f0f0f" metalness={0.98} roughness={0.02} envMapIntensity={2} />
      </mesh>

      {/* Head Panel */}
      <mesh position={[0, 1.8, 0.85]}>
        <boxGeometry args={[0.5, 0.3, 0.05]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Professional Eyes - Larger and more prominent */}
      <mesh ref={eyeLeftRef} position={[-0.3, 1.9, 0.8]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.2} transparent opacity={0.95} />
      </mesh>
      <mesh ref={eyeRightRef} position={[0.3, 1.9, 0.8]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.2} transparent opacity={0.95} />
      </mesh>

      {/* Eye Glow Rings */}
      <mesh position={[-0.3, 1.9, 0.85]}>
        <ringGeometry args={[0.2, 0.25, 16]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.3, 1.9, 0.85]}>
        <ringGeometry args={[0.2, 0.25, 16]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>

      {/* Professional Shoulders */}
      <mesh ref={shoulderLeftRef} position={[-1.1, 1.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh ref={shoulderRightRef} position={[1.1, 1.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Professional Arms */}
      <mesh position={[-1.3, 0.5, 0]} rotation={[0, 0, Math.PI / 12]}>
        <cylinderGeometry args={[0.18, 0.18, 1.4, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1.3, 0.5, 0]} rotation={[0, 0, -Math.PI / 12]}>
        <cylinderGeometry args={[0.18, 0.18, 1.4, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Professional Hands */}
      <mesh position={[-1.5, -0.2, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1.5, -0.2, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Professional Antenna System */}
      <mesh position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Antenna Light */}
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.5} transparent opacity={0.9} />
      </mesh>

      {/* Professional Base/Legs */}
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.9, 0.7, 0.5, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Hover Ring Effect */}
      <mesh position={[0, -1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.3, 32]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>

      {/* Additional Professional Details */}
      <mesh position={[0, 0.8, 0.9]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[0, -0.2, 0.9]}>
        <boxGeometry args={[0.4, 0.08, 0.05]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}
