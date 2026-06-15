import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   Wireframe Globe — subtle rotating sphere behind letters
   Represents global server presence at ~10% opacity
   ═══════════════════════════════════════════════════════ */
function WireframeGlobe({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const globeGeo = useMemo(() => new THREE.SphereGeometry(2.4, 24, 18), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Slow rotation — barely perceptible
    groupRef.current.rotation.y += delta * 0.08;
    groupRef.current.rotation.x += delta * 0.02;
  });

  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      {/* Main wireframe sphere */}
      <mesh geometry={globeGeo}>
        <meshBasicMaterial
          ref={materialRef}
          color="#E8B65A"
          wireframe
          transparent
          opacity={active ? 0.08 : 0}
          depthWrite={false}
        />
      </mesh>
      {/* Inner glow sphere — barely visible, adds depth */}
      <mesh>
        <sphereGeometry args={[1.8, 24, 18]} />
        <meshBasicMaterial
          color="#E8B65A"
          transparent
          opacity={active ? 0.02 : 0}
          wireframe
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   Scanning Ring — radar ring that expands outward
   Syncs with script cycling duration
   ═══════════════════════════════════════════════════════ */
function ScanningRing({ active, locked }: { active: boolean; locked: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ringRef.current || !dotRef.current || !active) {
      if (ringRef.current) ringRef.current.visible = false;
      if (dotRef.current) dotRef.current.visible = false;
      return;
    }

    ringRef.current.visible = true;
    dotRef.current.visible = true;

    const elapsed = clock.getElapsedTime();

    if (!locked) {
      // Expand outward — ring grows from 0 to 3.5 radius over ~3s
      const t = Math.min(elapsed / 3.5, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const radius = eased * 3.5;
      const opacity = 1 - eased * 0.7; // fades slightly as it grows

      // Update ring
      const geo = ringRef.current.geometry as THREE.RingGeometry;
      geo.copy(new THREE.RingGeometry(radius - 0.02, radius, 64));

      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity * 0.15;
      mat.color.setHex(0xE8B65A);

      // Scanning dot travels along the ring circumference
      const angle = elapsed * 2.5; // speed
      const dotRadius = radius - 0.01;
      dotRef.current.position.set(
        Math.cos(angle) * dotRadius,
        Math.sin(angle) * dotRadius,
        0,
      );
      (dotRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.6;
    } else {
      // All locked — ring dissolves
      const dissolveT = Math.min((elapsed - 3.5) / 0.8, 1);
      const remaining = 1 - dissolveT;
      const radius = 3.5;

      const geo = ringRef.current.geometry as THREE.RingGeometry;
      geo.copy(new THREE.RingGeometry(radius - 0.02, radius, 64));

      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = remaining * 0.15;

      // Dot makes one final sweep then fades
      const angle = elapsed * 2.5;
      dotRef.current.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0,
      );
      (dotRef.current.material as THREE.MeshBasicMaterial).opacity = remaining * 0.6;

      if (dissolveT >= 1) {
        ringRef.current.visible = false;
        dotRef.current.visible = false;
      }
    }
  });

  return (
    <group position={[0, 0, -0.5]}>
      {/* Ring */}
      <mesh ref={ringRef} visible={false}>
        <ringGeometry args={[0, 0.02, 64]} />
        <meshBasicMaterial
          color="#E8B65A"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Scanning dot */}
      <mesh ref={dotRef} visible={false}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial
          color="#E8B65A"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   Scene — combines globe + ring
   ═══════════════════════════════════════════════════════ */
function Scene({ phase, allLocked }: { phase: string; allLocked: boolean }) {
  const active = phase === 'active';

  return (
    <>
      <WireframeGlobe active={active} />
      <ScanningRing active={active} locked={allLocked} />
    </>
  );
}

/* ============================================================
   BootBackground3D — R3F Canvas with wireframe globe + ring
   Positioned behind the letter row, fades in with boot sequence.
   ============================================================ */
export function BootBackground3D({
  phase,
  allLocked,
}: {
  phase: string;
  allLocked: boolean;
}) {
  if (phase !== 'active' && phase !== 'boot') return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: false }}
        style={{ background: 'transparent' }}
      >
        <Scene phase={phase} allLocked={allLocked} />
      </Canvas>
    </div>
  );
}
