import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Stars, Float, Line } from '@react-three/drei';
import * as THREE from 'three';

const NODE_COUNT = 8;
const nodePositions: [number, number, number][] = Array.from({ length: NODE_COUNT }, (_, i) => {
  const angle = (i / NODE_COUNT) * Math.PI * 2;
  const radius = 2.4 + (i % 3) * 0.35;
  return [
    Math.cos(angle) * radius,
    Math.sin(angle * 2.1) * 0.9,
    Math.sin(angle) * radius,
  ];
});

function Nexus() {
  const coreRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    target.current.x = state.pointer.x * 0.6;
    target.current.y = state.pointer.y * 0.35;

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
      coreRef.current.rotation.x = THREE.MathUtils.lerp(
        coreRef.current.rotation.x,
        target.current.y,
        0.04,
      );
    }
    if (nodesRef.current) {
      nodesRef.current.rotation.y -= delta * 0.12;
      nodesRef.current.rotation.z = THREE.MathUtils.lerp(
        nodesRef.current.rotation.z,
        target.current.x * 0.2,
        0.04,
      );
    }
  });

  return (
    <group>
      <group ref={coreRef}>
        <mesh>
          <torusKnotGeometry args={[1.05, 0.32, 220, 32, 2, 3]} />
          <MeshDistortMaterial
            color="#a855f7"
            metalness={0.6}
            roughness={0.15}
            distort={0.28}
            speed={1.6}
            emissive="#7e22ce"
            emissiveIntensity={0.35}
          />
        </mesh>
      </group>

      <group ref={nodesRef}>
        {nodePositions.map((pos, i) => (
          <group key={i}>
            <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.1}>
              <mesh position={pos}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? '#22d3ee' : '#f472b6'}
                  emissive={i % 2 === 0 ? '#22d3ee' : '#f472b6'}
                  emissiveIntensity={1.2}
                  toneMapped={false}
                />
              </mesh>
            </Float>
            <Line
              points={[[0, 0, 0], pos]}
              color={i % 2 === 0 ? '#22d3ee' : '#f472b6'}
              transparent
              opacity={0.18}
              lineWidth={1}
            />
          </group>
        ))}
      </group>
    </group>
  );
}

export function SplashScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 6], fov: 42 }}
      gl={{ antialias: true }}
      dpr={[1, 1.75]}
    >
      <color attach="background" args={['#0d0620']} />
      <fog attach="fog" args={['#0d0620', 7, 15]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 4]} intensity={70} color="#a855f7" />
      <pointLight position={[-4, -2, -3]} intensity={50} color="#22d3ee" />
      <pointLight position={[0, -3, 3]} intensity={30} color="#f472b6" />

      <Stars radius={40} depth={30} count={2500} factor={3} saturation={0} fade speed={0.6} />

      <Nexus />
    </Canvas>
  );
}
