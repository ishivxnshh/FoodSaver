import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Box, Cone, Dodecahedron } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingFoodProps {
  type: 'apple' | 'bread' | 'carrot' | 'bag' | 'leaf';
  position: [number, number, number];
}

export default function FloatingFood({ type, position }: FloatingFoodProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const renderFood = () => {
    switch (type) {
      case 'apple':
        return (
          <Sphere ref={meshRef} args={[0.5, 32, 32]}>
            <meshStandardMaterial
              color="#ef4444"
              emissive="#dc2626"
              emissiveIntensity={0.3}
              metalness={0.3}
              roughness={0.4}
            />
          </Sphere>
        );
      case 'bread':
        return (
          <Box ref={meshRef} args={[0.8, 0.5, 0.5]}>
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.2}
              metalness={0.2}
              roughness={0.6}
            />
          </Box>
        );
      case 'carrot':
        return (
          <Cone ref={meshRef} args={[0.3, 1, 16]}>
            <meshStandardMaterial
              color="#fb923c"
              emissive="#f97316"
              emissiveIntensity={0.3}
              metalness={0.3}
              roughness={0.5}
            />
          </Cone>
        );
      case 'bag':
        return (
          <Dodecahedron ref={meshRef} args={[0.6]}>
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={0.4}
              metalness={0.5}
              roughness={0.3}
            />
          </Dodecahedron>
        );
      case 'leaf':
        return (
          <Torus ref={meshRef} args={[0.4, 0.15, 16, 32]}>
            <meshStandardMaterial
              color="#22c55e"
              emissive="#16a34a"
              emissiveIntensity={0.3}
              metalness={0.4}
              roughness={0.4}
            />
          </Torus>
        );
    }
  };

  return <group position={position}>{renderFood()}</group>;
}
