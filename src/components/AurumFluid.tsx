import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   GLSL — FBM Noise
   ═══════════════════════════════════════════════════════ */

const FBM_GLSL = `
  // ─── Simple hash functions ───
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  // ─── 2D value noise ───
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // ─── Fractal Brownian Motion ───
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
`;

/* ═══════════════════════════════════════════════════════
   Vertex Shader
   Displaces plane Z-axis using FBM noise + mouse repeller
   + scroll shear. Normals computed in fragment shader.
   ═══════════════════════════════════════════════════════ */

const VERTEX_SHADER = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseRadius;
  uniform float uScrollVelocity;
  uniform float uAmplitude;

  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vDisplacement;

  ${FBM_GLSL}

  void main() {
    vUv = uv;

    vec3 pos = position;

    // ─── Base FBM displacement ───
    float t = uTime * 0.015;
    float disp = fbm(pos.xy * 0.35 + t);
    disp = disp * 2.0 - 1.0; // remap [0,1] → [-1,1]
    disp *= uAmplitude;

    // ─── Mouse gravitational repeller ───
    // Map mouse [0,1] to plane [-aspect/2, aspect/2] x [-0.5, 0.5]
    float aspect = 1.0;
    vec2 mousePos = vec2(
      (uMouse.x - 0.5) * aspect,
      uMouse.y - 0.5
    );
    float dist = distance(pos.xy, mousePos);
    float mouseInfluence = smoothstep(uMouseRadius, 0.0, dist);
    // Gently push vertices downward near mouse position
    disp -= mouseInfluence * uAmplitude * 0.6;

    // ─── Scroll shear ───
    // Stretch/compress vertically based on scroll velocity
    float shear = pos.y * uScrollVelocity * 0.08;
    disp += shear;

    pos.z += disp;
    vDisplacement = disp;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

/* ═══════════════════════════════════════════════════════
   Fragment Shader
   Computes normals dynamically (dFdx/dFdy), applies
   Fresnel effect (dark → gold), and fake specular.
   ═══════════════════════════════════════════════════════ */

const FRAGMENT_SHADER = `
  uniform vec3 uColorDark;
  uniform vec3 uColorGold;
  uniform float uFresnelPower;
  uniform float uSpecularStrength;
  uniform float uSpecularExponent;
  uniform float uTime;

  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vDisplacement;

  ${FBM_GLSL}

  void main() {
    // ─── Compute normals from screen-space derivatives ───
    vec3 dx = dFdx(vPosition);
    vec3 dy = dFdy(vPosition);
    vec3 normal = normalize(cross(dx, dy));

    vec3 viewDir = normalize(cameraPosition - vPosition);

    // ─── Fresnel edge sheen (subtle — wet metal rim) ───
    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, uFresnelPower);

    // ─── Gold veins in valleys ───
    // The spec: "Deep within the valleys of this fluid, veins of gold catch the light"
    // Valleys = low displacement areas. We layer a high-frequency noise that
    // reveals gold where displacement is lowest and noise aligns.
    float valleyDepth = 1.0 - abs(vDisplacement * 10.0);  // 0 at ridges, 1 at valley bottom
    float veinNoise = fbm(vUv * 3.0 + uTime * 0.005);
    float veinMask = smoothstep(0.35, 0.7, valleyDepth) * smoothstep(0.3, 0.6, veinNoise);

    // ─── Base color: dark with gold veins in valleys + Fresnel sheen on edges ───
    vec3 color = uColorDark;
    color = mix(color, uColorGold, fresnel * 0.4);        // Subtle gold rim
    color = mix(color, uColorGold, veinMask * 0.7);        // Gold veins in valleys

    // ─── Fake specular highlight (wet metal reflection) ───
    vec3 halfDir = normalize(viewDir + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(normal, halfDir), 0.0), uSpecularExponent);
    color += spec * uColorGold * uSpecularStrength * 0.3;

    // ─── Valley micro-detail (subtle texture in dark areas) ───
    float microNoise = fbm(vPosition.xy * 6.0 + uTime * 0.01);
    color += (1.0 - fresnel) * microNoise * 0.04;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ═══════════════════════════════════════════════════════
   Default uniforms
   ═══════════════════════════════════════════════════════ */

function getDefaultUniforms() {
  return {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uMouseRadius: { value: 0.25 },
    uScrollVelocity: { value: 0 },
    uAmplitude: { value: 0.12 },
    uColorDark: { value: new THREE.Color('#0A0A0A') },
    uColorGold: { value: new THREE.Color('#E8B65A') },
    uFresnelPower: { value: 3.0 },
    uSpecularStrength: { value: 0.4 },
    uSpecularExponent: { value: 32.0 },
  };
}

/* ═══════════════════════════════════════════════════════
   FluidMesh — the actual 3D plane with custom material
   ═══════════════════════════════════════════════════════ */

function FluidMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniformsRef = useRef(getDefaultUniforms());
  const mouseTargetRef = useRef(new THREE.Vector2(0.5, 0.5));
  const scrollVelRef = useRef(0);
  const lastScrollYRef = useRef(0);

  const { viewport } = useThree();

  // ─── Plane resolution based on DPR (spec: 512 desktop, 128 mobile) ───
  const segments = useMemo(() => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    if (dpr >= 2) return 512;
    if (dpr >= 1) return 384;
    return 128;
  }, []);

  // ─── Geometry ───
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(1, 1, segments, segments),
    [segments],
  );

  // ─── Track scroll velocity ───
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;
      lastScrollYRef.current = currentY;
      // Clamp and smooth velocity
      scrollVelRef.current = Math.max(-1, Math.min(1, delta * 0.02));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Mouse handler — document-level, bypasses R3F event system ───
  // Using document listener avoids CSS pointer-events: none issues and
  // decouples mouse tracking from the 3D mesh's raycasting.
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to [0,1] across the full viewport
      mouseTargetRef.current.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight, // flip Y for GL
      );
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ─── Update uniforms on resize ───
  useEffect(() => {
    if (materialRef.current) {
      const u = uniformsRef.current;
      u.uMouseRadius.value = viewport.width > 7 ? 0.25 : 0.5;
    }
  }, [viewport.width]);

  // ─── Animation loop ───
  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const u = uniformsRef.current;

    // Smoothly interpolate mouse to target (viscous lag)
    u.uMouse.value.lerp(mouseTargetRef.current, delta * 3.0);

    // Decay scroll velocity to zero when idle
    scrollVelRef.current *= 0.92;
    if (Math.abs(scrollVelRef.current) < 0.001) scrollVelRef.current = 0;
    u.uScrollVelocity.value = scrollVelRef.current;

    // Update time
    u.uTime.value = state.clock.elapsedTime;
  });

  // ─── Update mesh scale when viewport changes ───
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [viewport.width, viewport.height]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      frustumCulled={false}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniformsRef.current}
        transparent={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ============================================================
   AurumFluid — public component
   Renders a full-screen liquid metal plane behind content.
   Usage: place inside any section as a positioned background.
   ============================================================ */

export function AurumFluid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 2.5], fov: 60, near: 0.1, far: 10 }}
        gl={{ alpha: false, antialias: true }}
        style={{ background: '#0A0A0A' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0A0A0A');
        }}
      >
        <FluidMesh />
      </Canvas>
    </div>
  );
}
