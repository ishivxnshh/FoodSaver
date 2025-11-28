import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import FloatingFood from './FloatingFood';

export default function HeroScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <>
      <color attach="background" args={['#020617']} />

      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
        color="#14b8a6"
      />

      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
          <FloatingFood type="apple" position={[-3, 2, 0]} />
        </Float>

        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
          <FloatingFood type="bread" position={[3, -1, -2]} />
        </Float>

        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.8}>
          <FloatingFood type="carrot" position={[-2, -2, -1]} />
        </Float>

        <Float speed={2.2} rotationIntensity={0.6} floatIntensity={2.2}>
          <FloatingFood type="bag" position={[2, 1, 1]} />
        </Float>

        <Float speed={1.6} rotationIntensity={0.35} floatIntensity={1.6}>
          <FloatingFood type="leaf" position={[0, -1, 2]} />
        </Float>
      </group>

      <Sparkles
        count={100}
        scale={15}
        size={2}
        speed={0.3}
        opacity={0.6}
        color="#10b981"
      />

      <Environment preset="night" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.5}
      />

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
    </>
  );
}
