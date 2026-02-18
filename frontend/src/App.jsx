import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, MeshDistortMaterial, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Glitch } from '@react-three/postprocessing';

// --- HIGH-END WORLD TEMPLATES ---
const FaceBoss = () => (
  <mesh scale={2}>
    <sphereGeometry args={[1, 64, 64]} />
    <MeshDistortMaterial color="#ff00ff" speed={3} distort={0.5} emissive="#ff00ff" emissiveIntensity={2} />
  </mesh>
);

const CarRacer = () => (
  <gridHelper args={[100, 50, 0x00ffff, 0x00ffff]} rotation={[Math.PI / 2, 0, 0]} />
);

export default function App() {
  const [gameState, setGameState] = useState('IDLE');
  const [type, setType] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGameState('SCANNING');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();
      setType(data.object_type);
      setGameState('PLAYING');
    } catch (err) {
      setGameState('IDLE');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <div style={{ position: 'absolute', zIndex: 10, padding: 20, pointerEvents: 'none' }}>
        <h1 style={{ color: '#0ff', fontFamily: 'Orbitron' }}>LYLOWORLD UNIVERSAL</h1>
        <input type="file" onChange={handleUpload} style={{ pointerEvents: 'auto' }} />
        <p style={{ color: '#f0f' }}>STATUS: {gameState}</p>
      </div>

      <Canvas shadows>
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} />
          <PerspectiveCamera makeDefault position={[0, 5, 10]} />
          <OrbitControls autoRotate />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#0ff" />

          {type === 'FACE' && <FaceBoss />}
          {type === 'CAR' && <CarRacer />}

          <EffectComposer>
            <Bloom intensity={1.5} luminanceThreshold={0.1} mipmapBlur />
            {gameState === 'SCANNING' && <Glitch strength={[0.5, 0.5]} />}
            <ChromaticAberration offset={[0.002, 0.002]} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
