import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Types ─── */
type Skill = {
  name: string;
  group: string;
  groupIndex: number;
};

type SkillNode = {
  name: string;
  group: string;
  color: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  target: THREE.Vector3;
};

/* ─── Group colors ─── */
const GROUP_COLORS: Record<string, string> = {
  LANGUAGES: '#E8B65A',   // gold
  BACKEND: '#F3EAEF',      // warm white
  FRONTEND: '#A8C3A0',     // sage
  'DATA & ML': '#B79CAE',  // mauve
  DEVOPS: '#6B4D6B',       // muted purple
};

const GROUP_COLORS_ARRAY: Record<string, THREE.Color> = {};
Object.entries(GROUP_COLORS).forEach(([k, v]) => {
  GROUP_COLORS_ARRAY[k] = new THREE.Color(v);
});

/* ─── Skill data ─── */
const SKILLS: Skill[] = [
  { name: 'Python', group: 'LANGUAGES', groupIndex: 0 },
  { name: 'JavaScript', group: 'LANGUAGES', groupIndex: 0 },
  { name: 'TypeScript', group: 'LANGUAGES', groupIndex: 0 },
  { name: 'Java', group: 'LANGUAGES', groupIndex: 0 },
  { name: 'C', group: 'LANGUAGES', groupIndex: 0 },
  { name: 'FastAPI', group: 'BACKEND', groupIndex: 1 },
  { name: 'PostgreSQL', group: 'BACKEND', groupIndex: 1 },
  { name: 'Flask', group: 'BACKEND', groupIndex: 1 },
  { name: 'Redis', group: 'BACKEND', groupIndex: 1 },
  { name: 'React', group: 'FRONTEND', groupIndex: 2 },
  { name: 'Vite', group: 'FRONTEND', groupIndex: 2 },
  { name: 'Tailwind', group: 'FRONTEND', groupIndex: 2 },
  { name: 'Streamlit', group: 'DATA & ML', groupIndex: 3 },
  { name: 'Pandas', group: 'DATA & ML', groupIndex: 3 },
  { name: 'scikit-learn', group: 'DATA & ML', groupIndex: 3 },
  { name: 'Docker', group: 'DEVOPS', groupIndex: 4 },
  { name: 'GitLab CI', group: 'DEVOPS', groupIndex: 4 },
  { name: 'Postman', group: 'DEVOPS', groupIndex: 4 },
];

/* ─── Generate positions in a radial layout ─── */
function generatePositions(count: number, radius: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = radius * (0.6 + Math.random() * 0.4);
    positions.push(
      new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r * 0.6, (Math.random() - 0.5) * 2),
    );
  }
  return positions;
}

/* ─── Lines between skills in the same group ─── */
function GroupLines({ nodes }: { nodes: SkillNode[] }) {
  const lines = useMemo(() => {
    const grouped: Record<string, SkillNode[]> = {};
    nodes.forEach((n) => {
      if (!grouped[n.group]) grouped[n.group] = [];
      grouped[n.group].push(n);
    });

    const result: { start: THREE.Vector3; end: THREE.Vector3; color: THREE.Color }[] = [];
    Object.entries(grouped).forEach(([group, groupNodes]) => {
      const color = GROUP_COLORS_ARRAY[group] || new THREE.Color('#6B4D6B');
      for (let i = 0; i < groupNodes.length; i++) {
        for (let j = i + 1; j < groupNodes.length; j++) {
          result.push({
            start: groupNodes[i].position,
            end: groupNodes[j].position,
            color,
          });
        }
      }
    });
    return result;
  }, [nodes]);

  return (
    <group>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry
            onUpdate={(self) => {
              const positions = new Float32Array([
                line.start.x, line.start.y, line.start.z,
                line.end.x, line.end.y, line.end.z,
              ]);
              self.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            }}
          />
          <lineBasicMaterial
            color={line.color}
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </line>
      ))}
    </group>
  );
}

/* ─── Individual skill node ─── */
function SkillNodeMesh({
  skill,
  position,
  mouse,
}: {
  skill: Skill;
  position: THREE.Vector3;
  mouse: React.RefObject<THREE.Vector2>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = GROUP_COLORS_ARRAY[skill.group] || new THREE.Color('#6B4D6B');
  const targetPos = useRef(position.clone());

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Spring toward target position
    const current = meshRef.current.position;
    current.lerp(targetPos.current, 1 - Math.pow(0.001, delta));

    // Mouse repulsion
    if (mouse.current) {
      const dx = current.x - mouse.current.x * 6;
      const dy = current.y - (mouse.current.y * 4 + 1);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2.5 && dist > 0.01) {
        const force = (2.5 - dist) / 2.5 * 0.3;
        current.x += (dx / dist) * force;
        current.y += (dy / dist) * force;
      }
    }

    // Pulse opacity for hovered nodes - simplified, just gentle float
    current.y += Math.sin(Date.now() * 0.001 + skill.name.length) * 0.001;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
      {/* Label */}
      <Text
        position={[0, 0.28, 0]}      fontSize={0.12}
              color={color.getStyle()}
              anchorX="center"
              anchorY="middle"
      >
        {skill.name}
      </Text>
    </mesh>
  );
}

/* ─── Scene content ─── */
function Scene({ mouse }: { mouse: React.RefObject<THREE.Vector2> }) {
  const { viewport } = useThree();

  const nodes = useMemo(() => {
    const positions = generatePositions(SKILLS.length, Math.min(viewport.width, 6) * 0.35);
    return SKILLS.map((skill, i) => ({
      ...skill,
      color: GROUP_COLORS[skill.group] || '#6B4D6B',
      position: positions[i],
      velocity: new THREE.Vector3(),
      target: positions[i].clone(),
    }));
  }, [viewport.width]);

  return (
    <>
      <GroupLines nodes={nodes} />
      {nodes.map((node) => (
        <SkillNodeMesh
          key={node.name}
          skill={node}
          position={node.position}
          mouse={mouse}
        />
      ))}
    </>
  );
}

/* ============================================================
   SkillConstellation — R3F physics-based node graph
   Skills float in dark space, connected by group lines.
   Mouse interaction pushes nodes away.
   ============================================================ */
export function SkillConstellation() {
  const mouse = useRef(new THREE.Vector2(0, 0));

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouse.current.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
  }, []);

  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-card border-thin border-border bg-bg"
      onPointerMove={handlePointerMove}
      style={{ touchAction: 'none' }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene mouse={mouse} />
      </Canvas>

      {/* Hint text */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.15em] text-fg-muted/30 uppercase">
        Move your cursor through the void
      </p>
    </div>
  );
}
