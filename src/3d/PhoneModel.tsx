import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

export default function PhoneModel() {
  const phoneRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (phoneRef.current) {
      phoneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      phoneRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <spotLight
        position={[0, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />

      <group ref={phoneRef}>
        <RoundedBox
          args={[1.5, 3, 0.2]}
          radius={0.1}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.9}
            roughness={0.1}
          />
        </RoundedBox>

        <mesh ref={screenRef} position={[0, 0, 0.11]} castShadow>
          <planeGeometry args={[1.3, 2.7]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={0.5}
            metalness={0.1}
            roughness={0.2}
          />
        </mesh>

        <mesh position={[0, 1.2, 0.11]}>
          <circleGeometry args={[0.05, 32]} />
          <meshStandardMaterial color="#334155" />
        </mesh>

        <mesh position={[0, -1.4, 0.11]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      <Environment preset="city" />
    </>
  );
}
