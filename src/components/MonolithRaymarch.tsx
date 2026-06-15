import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════
   3D Simplex Noise (Ian McEwan / Ashima Arts — MIT)
   ═══════════════════════════════════════════════════════ */

const SIMPLEX_3D = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * 7.0 * n_);

    vec4 x_ = floor(j * n_);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(
      dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)
    ));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

/* ═══════════════════════════════════════════════════════
   Vertex Shader — pass position and UV for raymarching
   ═══════════════════════════════════════════════════════ */

const VERTEX_SHADER = `
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

/* ═══════════════════════════════════════════════════════
   Fragment Shader — SDF Raymarching through text volume
   Steps through bounding box, samples text texture with
   simplex noise erosion, accumulates volumetric gold smoke.
   ═══════════════════════════════════════════════════════ */

const FRAGMENT_SHADER = `
  uniform sampler2D uTextTexture;
  uniform vec3 uMouse3D;
  uniform float uScrollDepth;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColorGold;
  uniform vec3 uColorHot;

  varying vec3 vPosition;
  varying vec2 vUv;

  ${SIMPLEX_3D}

  void main() {
    vec2 uv = vUv;

    // ─── Ray setup ───
    vec3 rayOrigin = cameraPosition;
    vec3 rayDir = normalize(vPosition - rayOrigin);

    // ─── Bounding box (centered at origin) ───
    vec3 boxMin = vec3(-1.0, -0.35, -0.3);
    vec3 boxMax = vec3(1.0, 0.35, 0.3);

    vec3 invDir = 1.0 / rayDir;
    vec3 tMin = (boxMin - rayOrigin) * invDir;
    vec3 tMax = (boxMax - rayOrigin) * invDir;
    vec3 t1 = min(tMin, tMax);
    vec3 t2 = max(tMin, tMax);
    float tNear = max(max(t1.x, t1.y), t1.z);
    float tFar  = min(min(t2.x, t2.y), t2.z);

    if (tNear > tFar) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    tNear = max(tNear, 0.0);

    // ─── March through volume ───
    vec3 pos = rayOrigin + rayDir * tNear;
    float range = tFar - tNear;
    int steps = 64;
    float stepSize = range / float(steps);

    vec3 accumColor = vec3(0.0);
    float transmission = 1.0;

    for (int i = 0; i < 64; i++) {
      // Map box position to text UV [0,1]
      vec2 textUV = (pos.xy - boxMin.xy) / (boxMax.xy - boxMin.xy);

      // Sample text mask from texture
      float textMask = texture2D(uTextTexture, textUV).r;

      // ─── Simplex noise smoke erosion ───
      // Use streaked position for noise (elongates when scrolling fast)
      vec3 noisePos = vec3(pos.x, pos.y, steppedZ);

      float noiseScale = 3.5;
      float noise = snoise(noisePos * noiseScale + uTime * 0.12);
      // Second octave for finer detail
      float noise2 = snoise(noisePos * noiseScale * 2.3 + uTime * 0.18);
      float combinedNoise = noise * 0.6 + noise2 * 0.4;

      // Erode letter edges: textMask defines shape, noise erodes boundaries
      float smoke = textMask - (combinedNoise * 0.5 + 0.5) * 0.35;
      smoke = clamp(smoke, 0.0, 1.0);

      // ─── Mouse heat source ───
      // Project mouse position into the box's XY plane at this Z depth
      vec3 mousePos = uMouse3D;
      float mouseDist = distance(pos, mousePos);
      float heat = exp(-mouseDist * 8.0);

      // Heat dissipates smoke (pushes it away) and brightens the glow
      float dissipated = smoke * (1.0 - heat * 0.6);
      float brightness = 1.0 + heat * 2.0;

      // ─── Scroll Z-axis depth + streaking ───
      // Scroll pushes the sampling position along Z (camera push)
      // AND stretches the noise along Z (streaking effect)
      float scrollOffset = uScrollDepth * 0.15;
      float zPos = pos.z + scrollOffset;
      float scrollFade = 1.0 - smoothstep(0.0, 0.5, abs(zPos));

      // Streak: when scrolling fast, elongate the volume along Z
      // by reducing the effective Z-step near the viewer
      float streakFactor = 1.0 + abs(uScrollDepth) * 4.0;
      float steppedZ = pos.z * streakFactor + uScrollDepth * 0.3;

      // ─── Accumulate volumetric density ───
      if (dissipated > 0.01 && scrollFade > 0.01) {
        float stepDensity = dissipated * stepSize * 3.0 * scrollFade;
        vec3 goldColor = mix(uColorGold, uColorHot, heat);
        accumColor += goldColor * stepDensity * brightness * transmission;
        transmission *= exp(-stepDensity * 1.5);

        if (transmission < 0.01) break;
      }

      pos += rayDir * stepSize;
    }

    // ─── Final composite ───
    // Background is pure black (pitch-black void)
    vec3 finalColor = accumColor;
    float alpha = 1.0 - transmission;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/* ═══════════════════════════════════════════════════════
   Text Texture Generator
   Renders text to a hidden canvas → THREE.CanvasTexture
   ═══════════════════════════════════════════════════════ */

function generateTextTexture(
  text: string,
  canvasEl: HTMLCanvasElement | null,
): THREE.CanvasTexture | null {
  if (!canvasEl) return null;

  const ctx = canvasEl.getContext('2d');
  if (!ctx) return null;

  const w = canvasEl.width;
  const h = canvasEl.height;

  // Clear to black
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  // Draw text in white (used as mask)
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Scale font to fit canvas width
  const fontSize = Math.min(w * 0.11, h * 0.6);
  ctx.font = `700 ${fontSize}px "Syne", sans-serif`;
  ctx.fillText(text, w / 2, h / 2);

  const texture = new THREE.CanvasTexture(canvasEl);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

/* ═══════════════════════════════════════════════════════
   RaymarchingQuad — the 3D box with raymarch shader
   ═══════════════════════════════════════════════════════ */

function RaymarchingQuad({ textTexture }: { textTexture: THREE.CanvasTexture }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniformsRef = useRef({
    uTextTexture: { value: textTexture },
    uMouse3D: { value: new THREE.Vector3(0, 0, 0) },
    uScrollDepth: { value: 0 },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1024, 768) },
    uColorGold: { value: new THREE.Color('#E8B65A') },
    uColorHot: { value: new THREE.Color('#F3EAEF') },
  });

  const mouseTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const scrollVelRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const scrollDepthRef = useRef(0);
  const { size } = useThree();

  // ─── Update resolution uniform on resize ───
  useEffect(() => {
    uniformsRef.current.uResolution.value.set(size.width, size.height);
  }, [size.width, size.height]);

  // ─── Update texture uniform when texture changes ───
  useEffect(() => {
    uniformsRef.current.uTextTexture.value = textTexture;
  }, [textTexture]);

  // ─── Mouse tracking (document-level) ───
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Map viewport mouse to 3D space within the box
      const x = (e.clientX / window.innerWidth) * 2 - 1; // [-1, 1]
      const y = -(e.clientY / window.innerHeight) * 2 + 1; // [-1, 1]
      mouseTargetRef.current.set(x * 0.8, y * 0.35, 0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ─── Scroll velocity tracking ───
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const delta = window.scrollY - lastScrollYRef.current;
      lastScrollYRef.current = window.scrollY;
      scrollVelRef.current = Math.max(-1, Math.min(1, delta * 0.01));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Animation loop ───
  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const u = uniformsRef.current;

    // Smooth mouse tracking
    u.uMouse3D.value.lerp(mouseTargetRef.current, delta * 4.0);

    // Scroll depth accumulation and decay
    scrollVelRef.current *= 0.9;
    if (Math.abs(scrollVelRef.current) < 0.001) scrollVelRef.current = 0;
    scrollDepthRef.current += scrollVelRef.current * delta * 0.5;
    // Clamp to box depth range
    scrollDepthRef.current = Math.max(-0.3, Math.min(0.3, scrollDepthRef.current));
    // Spring toward zero when scrolling stops
    scrollDepthRef.current *= 0.97;
    u.uScrollDepth.value = scrollDepthRef.current;

    // Time
    u.uTime.value = state.clock.elapsedTime;
  });

  const groupRef = useRef<THREE.Group>(null);

  // ─── Box geometry matching text aspect ratio ───
  const geometry = useMemo(
    () => new THREE.BoxGeometry(2, 0.7, 0.6),
    [],
  );

  // ─── Micro-rotation: subtle organic drift ───
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.02;
    groupRef.current.rotation.y = Math.sin(t * 0.12 + 0.5) * 0.03;
    groupRef.current.rotation.z = Math.sin(t * 0.09 + 1.2) * 0.015;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniformsRef.current}
          transparent={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   Scene — combines text texture generation + raymarching
   ═══════════════════════════════════════════════════════ */

function Scene({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  // ─── Create hidden canvas for text rendering ───
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 358; // matches BoxGeometry(2, 0.7) aspect ratio
    canvasRef.current = canvas;
    setCanvasEl(canvas);
    return () => {
      canvasRef.current = null;
      setCanvasEl(null);
    };
  }, []);

  // ─── Generate texture from canvas ───
  const texture = useMemo(
    () => (canvasEl ? generateTextTexture(text, canvasEl) : null),
    [canvasEl, text],
  );

  if (!texture) return null;    return (
      <RaymarchingQuad textTexture={texture} />
    );
}

/* ============================================================
   MonolithRaymarch — public component
   Volumetric gold smoke text rendered via SDF raymarching.
   Renders at half resolution for performance.
   ============================================================ */

export function MonolithRaymarch({ text = 'MUKTHANAND' }: { text?: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      style={{ zIndex: 0 }}
    >
      <Canvas
        dpr={[0.5, 0.5]}
        camera={{ position: [0, 0, 2.2], fov: 50, near: 0.1, far: 10 }}
        gl={{ alpha: false, antialias: false }}
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0A0A0A');
        }}
      >
        <Scene text={text} />
      </Canvas>
    </div>
  );
}
