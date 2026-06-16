import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ============================================================
   Constants
   ============================================================ */
const RACK_WIDTH = 4.0;
const RACK_HEIGHT = 5.0;
const RACK_DEPTH = 2.4;
const UNIT_COUNT = 5;

const UNIT_DATA = [
  { label: '/status',   sub: 'system',        state: 'idle' as const },
  { label: '/retrieve', sub: 'pgvector rag',  state: 'live' as const },
  { label: '/chat',     sub: 'scheme saathi', state: 'live' as const },
  { label: '/agentic',  sub: 'tooling',       state: 'idle' as const },
  { label: '/cache',    sub: 'redis',         state: 'warn' as const },
];

const unitHeight = (RACK_HEIGHT - 0.3) / UNIT_COUNT;
const unitWidth = RACK_WIDTH - 0.3;
const INTRO_DURATION = 2.6;

/* ============================================================
   Materials (module-level singletons)
   ============================================================ */
const materials = {
  chassisOuter: new THREE.MeshStandardMaterial({
    color: 0x0e0d0f,
    metalness: 0.9,
    roughness: 0.28,
  }),
  chassisInner: new THREE.MeshStandardMaterial({
    color: 0x18171a,
    metalness: 0.8,
    roughness: 0.4,
  }),
  brushedPanel: new THREE.MeshStandardMaterial({
    color: 0x1c1b1e,
    metalness: 0.75,
    roughness: 0.5,
  }),
  goldBrushed: new THREE.MeshStandardMaterial({
    color: 0xe8b65a,
    metalness: 0.85,
    roughness: 0.22,
    emissive: 0x3a2c10,
    emissiveIntensity: 0.3,
  }),
  ventDark: new THREE.MeshStandardMaterial({
    color: 0x020202,
    metalness: 0.2,
    roughness: 0.85,
  }),
  floor: new THREE.MeshStandardMaterial({
    color: 0x0a090a,
    metalness: 0.55,
    roughness: 0.35,
  }),
  separator: new THREE.MeshStandardMaterial({
    color: 0x2a2620,
    metalness: 0.6,
    roughness: 0.5,
  }),
};

/* ============================================================
   Rack Chassis
   ============================================================ */
function RackChassis() {
  return (
    <group>
      <mesh
        position={[0, RACK_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
        material={materials.chassisOuter}
      >
        <boxGeometry args={[RACK_WIDTH, RACK_HEIGHT, RACK_DEPTH]} />
      </mesh>

      {[[-RACK_WIDTH / 2, RACK_DEPTH / 2], [RACK_WIDTH / 2, RACK_DEPTH / 2]].map(([x, z], i) => (
        <mesh key={i} position={[x, RACK_HEIGHT / 2, z]} material={materials.goldBrushed}>
          <boxGeometry args={[0.02, RACK_HEIGHT, 0.02]} />
        </mesh>
      ))}

      <mesh position={[0, RACK_HEIGHT / 2, RACK_DEPTH / 2 + 0.025]} material={materials.brushedPanel}>
        <boxGeometry args={[RACK_WIDTH - 0.1, RACK_HEIGHT - 0.1, 0.05]} />
      </mesh>

      <mesh position={[0, RACK_HEIGHT + 0.015, 0]} material={materials.goldBrushed}>
        <boxGeometry args={[RACK_WIDTH + 0.03, 0.03, RACK_DEPTH + 0.03]} />
      </mesh>

      <mesh position={[0, -0.06, 0]} receiveShadow material={materials.chassisOuter}>
        <boxGeometry args={[RACK_WIDTH + 0.25, 0.12, RACK_DEPTH + 0.25]} />
      </mesh>
    </group>
  );
}

/* ============================================================
   Server Unit
   ============================================================ */
function ServerUnit({
  data,
  yPos,
  index,
}: {
  data: typeof UNIT_DATA[number];
  yPos: number;
  index: number;
}) {
  const ledMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!ledMatRef.current) return;
    const t = clock.getElapsedTime();
    let intensity: number;
    if (data.state === 'live') {
      intensity = 0.7 + Math.sin(t * 1.1 + index * 0.65) * 0.55;
    } else if (data.state === 'warn') {
      intensity = Math.sin(t * 3.2) > 0.75 ? 2.0 : 0.25;
    } else {
      intensity = 0.25 + Math.sin(t * 0.35 + index * 0.65) * 0.08;
    }
    ledMatRef.current.emissiveIntensity = Math.max(0.08, intensity);
  });

  const labelMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;
    ctx.font = '300 30px "JetBrains Mono", monospace';
    ctx.fillStyle = data.state === 'live' ? '#d8d3c8' : '#5f5e5a';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.label, 4, 28);
    ctx.font = '300 19px "JetBrains Mono", monospace';
    ctx.fillStyle = '#454340';
    ctx.fillText(data.sub, 4, 58);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, [data.label, data.sub, data.state]);

  return (
    <group position={[0, yPos, RACK_DEPTH / 2 + 0.06]}>
      <mesh material={materials.chassisInner} castShadow receiveShadow>
        <boxGeometry args={[unitWidth, unitHeight - 0.035, 0.07]} />
      </mesh>

      {Array.from({ length: 12 }).map((_, v) => (
        <mesh
          key={v}
          position={[-unitWidth / 2 + 0.22 + v * (unitWidth * 0.42 / 12), 0, 0.05]}
          material={materials.ventDark}
        >
          <boxGeometry args={[(unitWidth * 0.42 / 12) * 0.55, unitHeight - 0.16, 0.025]} />
        </mesh>
      ))}

      <mesh position={[unitWidth / 2 - 0.14, unitHeight * 0.18, 0.045]}>
        <circleGeometry args={[0.04, 16]} />
        <meshStandardMaterial
          ref={ledMatRef}
          color={data.state === 'live' ? 0x5dc9a5 : data.state === 'warn' ? 0xe24b4a : 0x6b6660}
          emissive={data.state === 'live' ? 0x5dc9a5 : data.state === 'warn' ? 0xe24b4a : 0x3a3833}
          emissiveIntensity={1.0}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[-unitWidth / 2 + unitWidth * 0.5 / 2 + 0.16, 0, 0.045]}>
        <planeGeometry args={[unitWidth * 0.5, unitHeight * 0.75]} />
        <meshBasicMaterial map={labelMap} transparent />
      </mesh>

      {index < UNIT_COUNT - 1 && (
        <mesh position={[0, -unitHeight / 2 - 0.008, 0]} material={materials.separator}>
          <boxGeometry args={[unitWidth, 0.01, 0.08]} />
        </mesh>
      )}

      {(index === 1 || index === 2) && <Fan />}
    </group>
  );
}

/* ============================================================
   Spinning Fan
   ============================================================ */
function Fan() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 2.4;
    }
  });

  return (
    <group ref={groupRef} position={[unitWidth / 2 - 0.5, 0, 0.04]}>
      <mesh material={materials.goldBrushed}>
        <torusGeometry args={[0.115, 0.012, 8, 24]} />
      </mesh>
      {Array.from({ length: 6 }).map((_, b) => (
        <group key={b} rotation={[0, 0, (b / 6) * Math.PI * 2]}>
          <mesh position={[0.055, 0, 0]} material={materials.brushedPanel}>
            <boxGeometry args={[0.085, 0.018, 0.008]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ============================================================
   Floating Motes (Gold Dust Particles)
   ============================================================ */
function FloatingMotes() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const count = isMobile ? 50 : 110;
  const ref = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    return [pos];
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * 0.12;
      if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = 0;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={0xe8b65a}
        size={0.025}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ============================================================
   Scene Contents (Camera + Lights + Rack)
   ============================================================ */
function SceneContents({ startIntro }: { startIntro: boolean }) {
  const { camera, scene } = useThree();
  const rackRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const introStartRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const rimRef = useRef<THREE.SpotLight>(null);
  const topAccentRef = useRef<THREE.PointLight>(null);

  const camStart = useMemo(
    () => ({ pos: new THREE.Vector3(11, 4.5, 13), look: new THREE.Vector3(0, 2.5, 0) }),
    [],
  );
  const camEnd = useMemo(
    () => ({ pos: new THREE.Vector3(6.2, 1.3, 8), look: new THREE.Vector3(0, 1.6, 0) }),
    [],
  );

  // ─── Fog ───
  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x060607, 0.055);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  // ─── Mouse tracking with proper useEffect ───
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // ─── Easing functions ───
  function easeOutExpo(t: number) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // ─── Smooth mouse ───
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.04;
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.04;

    // ─── Intro dolly (time-based, gated by startIntro) ───
    if (startIntro && introStartRef.current === null) {
      introStartRef.current = elapsed;
    }
    const introT = introStartRef.current !== null
      ? Math.min((elapsed - introStartRef.current) / INTRO_DURATION, 1)
      : 0;
    const introEased = easeOutExpo(introT);

    if (!doneRef.current) {
      camera.position.lerpVectors(camStart.pos, camEnd.pos, introEased);
      camera.lookAt(
        camStart.look.x + (camEnd.look.x - camStart.look.x) * introEased,
        camStart.look.y + (camEnd.look.y - camStart.look.y) * introEased,
        camStart.look.z + (camEnd.look.z - camStart.look.z) * introEased,
      );
      if (introT >= 1) doneRef.current = true;
    } else {
      // Idle: breathing + mouse parallax
      const breatheX = Math.sin(elapsed * 0.12) * 0.18;
      const breatheY = Math.cos(elapsed * 0.09) * 0.1;
      const px = smoothMouse.current.x * 0.5;
      const py = -smoothMouse.current.y * 0.3;

      camera.position.x += (camEnd.pos.x + breatheX + px - camera.position.x) * 0.04;
      camera.position.y += (camEnd.pos.y + breatheY + py - camera.position.y) * 0.04;
      camera.position.z += (camEnd.pos.z - camera.position.z) * 0.04;
      camera.lookAt(camEnd.look.x, camEnd.look.y, camEnd.look.z);
    }

    // ─── Rack micro-rotation toward mouse ───
    if (rackRef.current) {
      rackRef.current.rotation.y += (
        smoothMouse.current.x * 0.12 - rackRef.current.rotation.y
      ) * 0.025;
    }

    // ─── Rim light pulsing ───
    if (rimRef.current) {
      rimRef.current.intensity = 5.5 + Math.sin(elapsed * 0.6) * 0.8;
    }

    // ─── Top accent pulsing ───
    if (topAccentRef.current) {
      topAccentRef.current.intensity = 1.3 + Math.sin(elapsed * 0.4 + 1) * 0.3;
    }
  });

  return (
    <>
      {/* Scene background */}
      <color attach="background" args={[0x060607]} />

      {/* Lights */}
      <ambientLight intensity={0.6} color={0x0c0b0a} />
      <directionalLight
        position={[5, 7, 4]}
        intensity={2.0}
        color={0xfff0d8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.001}
      />
      <spotLight
        ref={rimRef}
        position={[-3.5, 2.5, -2.5]}
        intensity={6}
        distance={18}
        angle={Math.PI / 5}
        penumbra={0.5}
        decay={1.5}
        color={0xe8b65a}
        target-position={[0, 1.5, 0]}
      />
      <pointLight position={[2, -0.5, 5]} intensity={0.7} color={0x3a4a66} distance={15} />
      <pointLight ref={topAccentRef} position={[0, 5.3, 1.5]} intensity={1.5} color={0xe8b65a} distance={6} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow material={materials.floor}>
        <planeGeometry args={[50, 50]} />
      </mesh>

      {/* Grid */}
      <gridHelper args={[50, 50, 0x161412, 0x0e0d0c]} position={[0, -0.11, 0]} />

      {/* Rack */}
      <group ref={rackRef}>
        <RackChassis />
        {UNIT_DATA.map((data, i) => (
          <ServerUnit
            key={data.label}
            data={data}
            index={i}
            yPos={(RACK_HEIGHT - 0.15) - (i + 0.5) * unitHeight}
          />
        ))}
      </group>

      {/* Floating motes */}
      <FloatingMotes />
    </>
  );
}

/* ============================================================
   ServerRack — Main Export
   ============================================================ */
export function ServerRack({ startIntro = false }: { startIntro?: boolean }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      camera={{
        fov: 28,
        near: 0.1,
        far: 100,
        position: [11, 4.5, 13],
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <SceneContents startIntro={startIntro} />
    </Canvas>
  );
}
