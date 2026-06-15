import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   MatCap Texture Generator
   Creates a black-and-gold sphere lighting map
   that gives the cloth photorealistic silk lighting.
   ═══════════════════════════════════════════════════════ */

function generateMatCapTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Fill with dark base
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, size, size);

  // Draw a gradient sphere: dark center, gold edges
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;

  // Create radial gradient for the sphere
  const gradient = ctx.createRadialGradient(cx * 0.7, cy * 0.6, 0, cx, cy, radius);
  gradient.addColorStop(0, '#1A1A1A');       // Dark center (facing camera)
  gradient.addColorStop(0.3, '#0A0A0A');      // Very dark mid
  gradient.addColorStop(0.5, '#3D2A3D');      // Subtle purple-gold transition
  gradient.addColorStop(0.7, '#6B4D6B');      // Muted gold-brown
  gradient.addColorStop(0.85, '#A87E35');     // Dim gold
  gradient.addColorStop(0.95, '#E8B65A');     // Gold rim
  gradient.addColorStop(1, '#F3EAEF');        // Hot white-gold edge

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Add a specular highlight dot
  const specGrad = ctx.createRadialGradient(cx * 0.65, cy * 0.55, 0, cx * 0.65, cy * 0.55, radius * 0.25);
  specGrad.addColorStop(0, 'rgba(243, 234, 239, 0.3)');
  specGrad.addColorStop(1, 'rgba(243, 234, 239, 0)');
  ctx.beginPath();
  ctx.arc(cx * 0.65, cy * 0.55, radius * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = specGrad;
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  return texture;
}

/* ═══════════════════════════════════════════════════════
   GLSL — Gerstner Waves (for cloth folding)
   5 overlapping waves at different frequencies/directions
   ═══════════════════════════════════════════════════════ */

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uScrollTension;
  uniform float uScrollRelease;
  uniform vec2 uMouseTrail[10];
  uniform float uMouseTrailCount;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // ─── Gerstner Wave function ───
  // Returns displaced position and normal for a single wave
  vec3 gerstnerWave(
    vec4 wave, vec3 pos, inout vec3 tangent, inout vec3 binormal
  ) {
    float steepness = wave.z;
    float wavelength = wave.w;
    float k = 2.0 * 3.14159 / wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(wave.xy);
    float f = k * (dot(d, pos.xy) - c * uTime);
    float a = steepness / k;

    tangent += vec3(
      -d.x * d.x * (steepness * sin(f)),
      d.x * (steepness * cos(f)),
      0.0
    );
    binormal += vec3(
      -d.y * d.y * (steepness * sin(f)),
      d.y * (steepness * cos(f)),
      0.0
    );

    return vec3(
      d.x * (a * cos(f)),
      a * sin(f),
      d.y * (a * cos(f))
    );
  }

  void main() {
    vUv = uv;

    vec3 pos = position;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);

    // ─── 5 Overlapping Gerstner Waves ───
    // Each wave: (dirX, dirY, steepness, wavelength)
    vec4 waves[5];
    waves[0] = vec4(1.0, 0.5, 0.3, 1.2);
    waves[1] = vec4(0.3, 1.0, 0.2, 0.8);
    waves[2] = vec4(-0.6, 0.8, 0.25, 1.5);
    waves[3] = vec4(0.9, -0.4, 0.15, 0.6);
    waves[4] = vec4(-0.2, -0.7, 0.35, 2.0);

    vec3 displacement = vec3(0.0);
    for (int i = 0; i < 5; i++) {
      displacement += gerstnerWave(waves[i], pos, tangent, binormal);
    }

    // ─── Scroll tension: pull cloth downward ───
    // When tension is high, the cloth stretches vertically
    float tensionPull = uScrollTension * 0.3;
    displacement.y -= tensionPull * (pos.y * 0.5 + 0.5); // pull more at bottom
    pos.y -= tensionPull * (pos.y * 0.5 + 0.5) * 0.1;

    // ─── Scroll release: dramatic billow ───
    // When release triggers, cloth bulges outward along Z
    float billow = uScrollRelease * 0.4;
    float billowShape = sin(pos.x * 3.0 + 1.5) * cos(pos.y * 2.5) * 0.5 + 0.5;
    displacement.z += billow * billowShape;

    // ─── Mouse trail ripples ───
    // Each trail point creates a propagating ripple
    for (int i = 0; i < 10; i++) {
      if (i >= int(uMouseTrailCount)) break;
      vec2 trailPos = uMouseTrail[i] * 2.0 - 1.0; // [0,1] -> [-1,1]
      // Trail positions are in UV space, map to plane coords
      vec2 delta = pos.xy - trailPos;
      float dist = length(delta);
      float ripple = sin(dist * 12.0 - uTime * 3.0 + float(i) * 0.5) * 0.5 + 0.5;
      float falloff = exp(-dist * 3.0);
      float age = 1.0 - float(i) / 10.0; // older trail points have less influence
      displacement.z += ripple * falloff * 0.06 * age;
    }

    pos += displacement;

    // ─── Compute normal from tangent/binormal ───
    vec3 normal = normalize(cross(binormal, tangent));

    vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vPosition = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

/* ═══════════════════════════════════════════════════════
   Fragment Shader — MatCap lighting
   Samples the MatCap texture using screen-space normals
   for photorealistic silk lighting at almost zero cost.
   ═══════════════════════════════════════════════════════ */

const FRAGMENT_SHADER = `
  uniform sampler2D uMatCap;
  uniform float uScrollRelease;
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    // ─── Compute screen-space normal ───
    vec3 normal = normalize(vNormal);

    // ─── MatCap lookup ───
    // Map normal to UV space for MatCap sampling
    vec2 matcapUV = normal.xy * 0.5 + 0.5;
    vec3 matcapColor = texture2D(uMatCap, matcapUV).rgb;

    // ─── Scroll release glow ───
    // When cloth billows, add a warm gold glow
    float glow = uScrollRelease * 0.3;
    vec3 glowColor = vec3(0.91, 0.71, 0.35); // #E8B65A
    matcapColor += glowColor * glow;

    // ─── Fresnel edge sheen ───
    // Steep viewing angles get a gold highlight
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, 4.0);
    matcapColor += glowColor * fresnel * 0.2;

    // ─── Subtle fold lines ───
    // Darken steep normal changes to emphasize fabric creases
    float crease = 1.0 - abs(vNormal.z);
    matcapColor *= 1.0 - crease * 0.15;

    gl_FragColor = vec4(matcapColor, uOpacity);
  }
`;

/* ═══════════════════════════════════════════════════════
   Default uniforms
   ═══════════════════════════════════════════════════════ */

function createUniforms(matCapTexture: THREE.CanvasTexture) {
  // Flattened mouse trail: 10 positions × 2 coords = 20 floats
  const trail = new Float32Array(20);
  for (let i = 0; i < 20; i++) trail[i] = 0.5;

  return {
    uTime: { value: 0 },
    uScrollTension: { value: 0 },
    uScrollRelease: { value: 0 },
    uMouseTrail: { value: trail },
    uMouseTrailCount: { value: 0 },
    uMatCap: { value: matCapTexture },
    uOpacity: { value: 0.85 },
  };
}

/* ═══════════════════════════════════════════════════════
   ClothMesh — the PlaneGeometry with custom shader
   ═══════════════════════════════════════════════════════ */

function ClothMesh({ matCapTexture, isVisibleRef }: { matCapTexture: THREE.CanvasTexture; isVisibleRef: React.RefObject<boolean> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniformsRef = useRef(createUniforms(matCapTexture));

  const { viewport } = useThree();

  // ─── Mouse trail buffer ───
  const mouseTrailRef = useRef<{ x: number; y: number }[]>([]);

  // ─── Scroll state ───
  const scrollVelRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const tensionRef = useRef(0);
  const releaseRef = useRef(0);
  const isReleasingRef = useRef(false);

  // ─── Plane segments (high for detailed cloth) ───
  const segments = useMemo(() => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    return dpr >= 2 ? 256 : 128;
  }, []);

  // ─── Geometry ───
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(1, 1, segments, segments),
    [segments],
  );

  // ─── Mouse tracking ───
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;

      // Add to trail buffer (keep last 10)
      mouseTrailRef.current.push({ x, y });
      if (mouseTrailRef.current.length > 10) {
        mouseTrailRef.current.shift();
      }

      // Update flattened uniform array
      const trail = uniformsRef.current.uMouseTrail.value as Float32Array;
      const count = mouseTrailRef.current.length;
      for (let i = 0; i < count; i++) {
        const p = mouseTrailRef.current[i];
        trail[i * 2] = p.x;
        trail[i * 2 + 1] = p.y;
      }
      uniformsRef.current.uMouseTrailCount.value = count;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ─── Scroll tracking ───
  useEffect(() => {
    const handleScroll = () => {
      const delta = window.scrollY - lastScrollYRef.current;
      lastScrollYRef.current = window.scrollY;
      scrollVelRef.current = Math.max(-1, Math.min(1, delta * 0.008));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Animation loop ───
  useFrame((state, delta) => {
    // Pause simulation when hero section is off-screen
    if (!isVisibleRef.current) return;

    const u = uniformsRef.current;

    // ─── Scroll tension ───
    // When scrolling down, tension builds. When idle, tension releases.
    scrollVelRef.current *= 0.88;
    if (Math.abs(scrollVelRef.current) < 0.001) scrollVelRef.current = 0;

    if (Math.abs(scrollVelRef.current) > 0.01) {
      // Scrolling — build tension
      tensionRef.current += Math.abs(scrollVelRef.current) * delta * 2.0;
      tensionRef.current = Math.min(1, tensionRef.current);
      isReleasingRef.current = false;
      releaseRef.current = 0;
    } else if (tensionRef.current > 0.01) {
      // Stopped scrolling — trigger dramatic release
      if (!isReleasingRef.current) {
        isReleasingRef.current = true;
        releaseRef.current = 1.0; // Start billow
      }
    }

    // Decay tension when not actively scrolling
    if (Math.abs(scrollVelRef.current) < 0.01) {
      tensionRef.current *= 0.96;
    }

    // Release billow: fast rise, slow settle (spring feel)
    if (isReleasingRef.current) {
      releaseRef.current *= 0.92;
      if (releaseRef.current < 0.001) {
        releaseRef.current = 0;
        isReleasingRef.current = false;
      }
    }

    u.uScrollTension.value = tensionRef.current;
    u.uScrollRelease.value = releaseRef.current;

    // Update time
    u.uTime.value = state.clock.elapsedTime;
  });

  // ─── Update mesh scale on resize ───
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(viewport.width * 1.2, viewport.height * 0.8, 1);
    }
  }, [viewport.width, viewport.height]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      frustumCulled={false}
      rotation={[-0.15, 0, 0]} // Slight tilt for better cloth drape
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniformsRef.current}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════
   ObsidianVeil — public component
   Hyper-realistic obsidian silk cloth with Gerstner wave
   folding, MatCap lighting, mouse ripples, scroll tension.
   ═══════════════════════════════════════════════════════ */

// MatCap generated once at module level (synchronous, no re-render needed)
const MATCAP_TEXTURE = generateMatCapTexture();

export function ObsidianVeil() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);

  // ─── IntersectionObserver: pause simulation when scrolled past ───
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.1, 2.2], fov: 55, near: 0.1, far: 10 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ClothMesh matCapTexture={MATCAP_TEXTURE} isVisibleRef={isVisibleRef} />
      </Canvas>
    </div>
  );
}
