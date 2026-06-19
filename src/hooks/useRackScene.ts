import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import gsap from 'gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/* ═══════════════════════════════════════════════════════
   useRackScene — Imperative Three.js scene hook
   Ported from server-rack-premium(3).html draft.
   Reads colors from CSS custom properties at runtime.
   Syncs render loop to gsap.ticker (not its own rAF).

   Three.js r184 — physically correct lighting default.
   Light intensities are calibrated for PBR falloff.
   ═══════════════════════════════════════════════════════ */

type RackUnit = {
  label: string;
  sub: string;
  state: 'live' | 'warn' | 'idle';
};

type RackConfig = {
  detailed: boolean;
  unitData: RackUnit[];
  width: number;
  height: number;
  depth: number;
};

/* ─── CSS color reader ─── */
function cssColor(varName: string): number {
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return new THREE.Color(val).getHex();
}

function shade(hex: number, factor: number): number {
  return new THREE.Color(hex).multiplyScalar(factor).getHex();
}

function toCss(hex: number): string {
  return '#' + hex.toString(16).padStart(6, '0');
}

/* ─── Grille texture factory ─── */
function makeGrilleTexture(bgSubtle: number, bg: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 48; c.height = 48;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = toCss(bgSubtle);
  ctx.fillRect(0, 0, 48, 48);
  ctx.fillStyle = toCss(bg);
  const step = 8;
  for (let y = step / 2; y < 48; y += step) {
    const offset = (Math.round(y / step) % 2) ? step / 2 : 0;
    for (let x = step / 2 + offset; x < 48; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeRailTexture(bgSubtle: number, bg: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 24; c.height = 48;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = toCss(bgSubtle);
  ctx.fillRect(0, 0, 24, 48);
  ctx.fillStyle = toCss(bg);
  ctx.fillRect(7, 6, 10, 6);
  ctx.fillRect(7, 24, 10, 6);
  ctx.fillRect(7, 42, 10, 6);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function tiled(base: THREE.CanvasTexture, repX: number, repY: number): THREE.CanvasTexture {
  const t = base.clone();
  t.needsUpdate = true;
  t.repeat.set(repX, repY);
  return t;
}

/* ─── LED glow sprite texture factory — radial gradient color→transparent ─── */
function makeLedGlowTexture(colorHex: number): THREE.CanvasTexture {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  const colorCss = toCss(colorHex);
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, colorCss);
  gradient.addColorStop(0.3, colorCss);
  gradient.addColorStop(0.7, colorCss + '66');   // ~40% opacity at mid-radius
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* ─── Floor glow texture factory — radial gradient accent→transparent ─── */
function makeFloorGlow(accent: number): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  const accentCss = toCss(accent);

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, accentCss);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/* ─── Rack factory ─── */
function createRack(
  { detailed, unitData, width, height, depth }: RackConfig,
  colors: ReturnType<typeof readColors>,
  isMobile: boolean,
) {
  const group = new THREE.Group();
  const leds: { material: THREE.MeshStandardMaterial; blinkSpeed: number; phase: number; state: string }[] = [];
  const fans: THREE.Group[] = [];
  const labels: {
    material: THREE.MeshBasicMaterial;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    unit: { label: string; sub: string; state: string };
  }[] = [];

  /* ─── Three distinct chassis levels ─── */
  // Chassis outer: bg (darkest) — the frame
  // Chassis inner: bg-elevated — recessed unit panels
  // Brushed panel: bg-subtle (lightest) — handles, fan blades
  const matChassisOuter = new THREE.MeshStandardMaterial({ color: colors.bg, metalness: 0.9, roughness: 0.28 });
  const matChassisInner = new THREE.MeshStandardMaterial({ color: shade(colors.bgSubtle, 1.7), metalness: 0.8, roughness: 0.4 });
  const matBrushedPanel = new THREE.MeshStandardMaterial({ color: shade(colors.bgSubtle, 2.3), metalness: 0.75, roughness: 0.5 });
  const matAccentTrim = new THREE.MeshStandardMaterial({
    color: colors.accent, metalness: 0.85, roughness: 0.22,
    emissive: shade(colors.accent, 0.2), emissiveIntensity: 0.6,
  });

  const grilleTexBase = makeGrilleTexture(colors.bgSubtle, colors.bg);
  const railTexBase = makeRailTexture(colors.bgSubtle, colors.bg);

  /* Frame */
  const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), matChassisOuter);
  frameMesh.position.y = height / 2;
  frameMesh.castShadow = detailed && !isMobile;
  frameMesh.receiveShadow = true;
  group.add(frameMesh);

  /* Rails */
  const railW = width * 0.07;
  [-1, 1].forEach(side => {
    const railMat = new THREE.MeshStandardMaterial({
      map: tiled(railTexBase, 1, 7),
      metalness: 0.6, roughness: 0.6,
    });
    const railMesh = new THREE.Mesh(new THREE.PlaneGeometry(railW, height - 0.25), railMat);
    railMesh.position.set(side * (width / 2 - railW / 2 - 0.05), height / 2, depth / 2 + 0.035);
    group.add(railMesh);
  });

  /* Edge trim — gold, creates the dimensional outline */
  [-1, 1].forEach(side => {
    const edgeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.018, height, 0.018), matAccentTrim);
    edgeMesh.position.set(side * width / 2, height / 2, depth / 2);
    group.add(edgeMesh);
  });

  /* Units */
  const railClearance = railW * 2 + 0.16;
  const unitWidth = width - railClearance;
  const unitGap = 0.045;
  const unitHeight = (height - 0.3) / unitData.length;

  unitData.forEach((unit, i) => {
    const unitGroup = new THREE.Group();
    const yPos = (height - 0.15) - (i + 0.5) * unitHeight;
    unitGroup.position.set(0, yPos, depth / 2 + 0.05);
    group.add(unitGroup);

    /* Panel — inner chassis (recessed feel) */
    const panelMesh = new THREE.Mesh(new THREE.BoxGeometry(unitWidth, unitHeight - unitGap, 0.06), matChassisInner);
    panelMesh.castShadow = detailed && !isMobile;
    panelMesh.receiveShadow = true;
    unitGroup.add(panelMesh);

    /* Grille */
    const grilleW = unitWidth * 0.82;
    const grilleH = (unitHeight - unitGap) * 0.7;
    const grilleMat = new THREE.MeshStandardMaterial({
      map: tiled(grilleTexBase, Math.max(2, Math.round(grilleW * 4)), Math.max(2, Math.round(grilleH * 4))),
      metalness: 0.3, roughness: 0.85,
    });
    const grilleMesh = new THREE.Mesh(new THREE.PlaneGeometry(grilleW, grilleH), grilleMat);
    grilleMesh.position.set(detailed ? width * 0.07 : 0, 0, 0.034);
    unitGroup.add(grilleMesh);

    /* Handle */
    const handleMesh = new THREE.Mesh(new THREE.BoxGeometry(unitWidth * 0.92, 0.014, 0.018), matBrushedPanel);
    handleMesh.position.set(0, -(unitHeight - unitGap) / 2 + 0.012, 0.045);
    unitGroup.add(handleMesh);

    /* LEDs — emissive glow */
    const ledCount = detailed ? (isMobile ? 1 : 3) : 1;
    for (let l = 0; l < ledCount; l++) {
      const state = (l === 0) ? unit.state : 'idle';
      // Warn uses accentDim (muted gold), not accent (primary brand gold)
      const c = state === 'live' ? colors.success : (state === 'warn' ? colors.accentDim : colors.bgSubtle);
      const ledMat = new THREE.MeshStandardMaterial({
        color: c,
        emissive: c,
        emissiveIntensity: 1.0,
        roughness: 0.3,
      });
      const ledMesh = new THREE.Mesh(new THREE.CircleGeometry(0.035, 14), ledMat);
      ledMesh.position.set(unitWidth / 2 - 0.14 - l * 0.11, unitHeight * 0.18, 0.045);
      unitGroup.add(ledMesh);

      /* Glow sprite behind LED — soft halo */
      const glowTex = makeLedGlowTexture(c);
      const glowSpriteMat = new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const glowSprite = new THREE.Sprite(glowSpriteMat);
      glowSprite.scale.set(0.14, 0.14, 1);
      glowSprite.position.set(
        unitWidth / 2 - 0.14 - l * 0.11,
        unitHeight * 0.18,
        0.043, // slightly behind the LED mesh (z=0.046)
      );
      unitGroup.add(glowSprite);

      leds.push({
        material: ledMat,
        blinkSpeed: state === 'live' ? 1.1 : (state === 'warn' ? 1.6 : 0.35),
        phase: i * 0.65 + l * 0.3,
        state,
      });
    }

    /* Fans */
    if (detailed && !isMobile && (i === 1 || i === 2)) {
      const fanGroup = new THREE.Group();
      fanGroup.position.set(unitWidth / 2 - 0.55, 0, 0.045);
      fanGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.011, 8, 20), matAccentTrim));
      for (let b = 0; b < 6; b++) {
        const bladeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.016, 0.007), matBrushedPanel);
        bladeMesh.position.set(0.05, 0, 0);
        const pivot = new THREE.Group();
        pivot.rotation.z = (b / 6) * Math.PI * 2;
        pivot.add(bladeMesh);
        fanGroup.add(pivot);
      }
      unitGroup.add(fanGroup);
      fans.push(fanGroup);
    }

    /* Labels */
    if (detailed) {
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 480; labelCanvas.height = 72;
      const ctx = labelCanvas.getContext('2d')!;

      function drawLabel(main: string, sub: string) {
        ctx.clearRect(0, 0, 480, 72);
        ctx.font = '600 27px Inter, sans-serif';
        ctx.fillStyle = unit.state === 'live' ? toCss(colors.textPrimary) : toCss(colors.textMuted);
        ctx.textBaseline = 'middle';
        ctx.fillText(main, 4, 24);
        ctx.font = '400 16px Inter, sans-serif';
        ctx.fillStyle = toCss(colors.textSecondary);
        ctx.fillText(sub, 4, 52);
      }

      drawLabel(unit.label, unit.sub);

      const labelTex = new THREE.CanvasTexture(labelCanvas);
      labelTex.minFilter = THREE.LinearFilter;
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
      const labelMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(unitWidth * 0.42, unitHeight * 0.7),
        labelMat,
      );
      labelMesh.position.set(-unitWidth / 2 + unitWidth * 0.42 / 2 + 0.14, 0, 0.046);
      unitGroup.add(labelMesh);

      labels.push({ material: labelMat, canvas: labelCanvas, ctx, unit: { label: unit.label, sub: unit.sub, state: unit.state } });
    }

    /* Separator */
    if (i < unitData.length - 1) {
      const sepMesh = new THREE.Mesh(new THREE.BoxGeometry(unitWidth, 0.008, 0.07), matChassisInner);
      sepMesh.position.set(0, -unitHeight / 2 - 0.01, 0);
      unitGroup.add(sepMesh);
    }
  });

  /* Cap — gold trim top */
  const capMesh = new THREE.Mesh(new THREE.BoxGeometry(width + 0.03, 0.03, depth + 0.03), matAccentTrim);
  capMesh.position.set(0, height + 0.015, 0);
  group.add(capMesh);

  /* Base */
  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(width + 0.25, 0.12, depth + 0.25), matChassisOuter);
  baseMesh.position.set(0, -0.06, 0);
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  return { group, leds, fans, labels };
}

/* ─── Read colors from CSS at runtime ─── */
function readColors() {
  return {
    bg: cssColor('--color-bg'),
    bgElevated: cssColor('--color-bg-elevated'),
    bgSubtle: cssColor('--color-bg-subtle'),
    accent: cssColor('--color-accent'),
    accentDim: cssColor('--color-accent-dim'),
    textPrimary: cssColor('--color-text-primary'),
    textSecondary: cssColor('--color-text-secondary'),
    textMuted: cssColor('--color-text-muted'),
    success: cssColor('--color-success'),
    border: cssColor('--color-border'),
  };
}

/* ═══════════════════════════════════════════════════════
   Hook
   ═══════════════════════════════════════════════════════ */
export function useRackScene(containerRef: React.RefObject<HTMLDivElement | null>) {
  const reduced = usePrefersReducedMotion();
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    composer: EffectComposer | null;
    heroGroup: THREE.Group;
    leds: { material: THREE.MeshStandardMaterial; blinkSpeed: number; phase: number; state: string }[];
    fans: THREE.Group[];
    labels: { material: THREE.MeshBasicMaterial; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; unit: { label: string; sub: string; state: string } }[];
    motes: THREE.Points;
    moteGeo: THREE.BufferGeometry;
    rimLight: THREE.SpotLight;
    topAccent: THREE.PointLight;
    glowMat: THREE.MeshBasicMaterial;
    clock: THREE.Clock;
    mouseX: number;
    mouseY: number;
    smoothMouseX: number;
    smoothMouseY: number;
    isMobile: boolean;
    animating: boolean;
  } | null>(null);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const isMobile = window.innerWidth < 768;
    const colors = readColors();

    /* ─── Renderer — OPAQUE, owns its own background ─── */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: false,
        powerPreference: isMobile ? 'default' : 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      return;
    }

    renderer.setClearColor(colors.bg, 1);
    renderer.shadowMap.enabled = !isMobile;
    if (!isMobile) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = isMobile ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);

    /* ─── Scene ─── */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(colors.bg, isMobile ? 0.06 : 0.04);

    /* ─── Camera ─── */
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 35 : 40,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100,
    );

    /* ─── Post-processing — UnrealBloomPass ───
       Desktop only (mobile perf), skipped on reduced motion.
       Subtle bloom (strength 0.2) to make gold trim, LEDs,
       and floor glow pools pop against the dark background.
       ─── */
    let composer: EffectComposer | null = null;

    function onResize() {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (composer) {
        composer.setSize(w, h);
      }
    }
    onResize();
    window.addEventListener('resize', onResize);

    if (!isMobile && !reduced) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight,
        ),
        0.2,   // strength — subtle
        0.5,   // radius   — moderate spread
        0.1,   // threshold — only bloom bright areas
      );
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
    }

    /* ─── Lighting ───
       Design spec: no violet, no cyan. Warm palette only.
       Three.js r184+ uses physically correct lights by default.
       Spot/Point light intensities are calibrated for inverse-square falloff.
       ─── */
    // Ambient — negligible flat fill. Near-black from spec token.
    const ambient = new THREE.AmbientLight(colors.bg, 0.4);
    scene.add(ambient);

    // Key light — warm off-white, positioned to cast shadows that reveal depth
    const keyLight = new THREE.DirectionalLight(colors.textPrimary, 3.0);
    keyLight.position.set(4, 6, 5);
    if (!isMobile) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 30;
      keyLight.shadow.bias = -0.001;
    }
    scene.add(keyLight);

    // Rim light — gold accent, defines the silhouette from behind-left
    const rimLight = new THREE.SpotLight(colors.accent, 12, 16, Math.PI / 5, 0.5, 1.5);
    rimLight.position.set(-4, 2.5, -2);
    rimLight.target.position.set(0, 1.5, 0);
    scene.add(rimLight);
    scene.add(rimLight.target);

    // Warm fill — subtle neutral from below-right (no violet)
    if (!isMobile) {
      const fillLight = new THREE.PointLight(shade(colors.bgSubtle, 2.0), 0.5, 14);
      fillLight.position.set(3, -0.5, 5);
      scene.add(fillLight);
    }

    // Top accent — direct gold downlight on the rack crown
    const topAccent = new THREE.PointLight(colors.accent, 1.5, 5);
    topAccent.position.set(0, 5, 0.5);
    scene.add(topAccent);

    /* ─── Rack ─── */
    const RACK_WIDTH = 4.2, RACK_HEIGHT = 5.0, RACK_DEPTH = 1.55;

    const heroUnitData = [
      { label: '/status', sub: 'system', state: 'idle' as const },
      { label: '/retrieve', sub: 'pgvector rag', state: 'live' as const },
      { label: '/chat', sub: 'scheme saathi', state: 'live' as const },
      { label: '/agentic', sub: 'tooling', state: 'idle' as const },
      { label: '/cache', sub: 'redis', state: 'warn' as const },
    ];

    const hero = createRack(
      { detailed: !isMobile, unitData: heroUnitData, width: RACK_WIDTH, height: RACK_HEIGHT, depth: RACK_DEPTH },
      colors,
      isMobile,
    );
    scene.add(hero.group);
    const leds = hero.leds.slice();
    const fans = hero.fans.slice();
    const labels = hero.labels.slice();

    /* Side racks (desktop only) */
    if (!isMobile) {
      const sideUnitData = [
        { label: '/edge', sub: 'cdn', state: 'idle' as const },
        { label: '/queue', sub: 'jobs', state: 'live' as const },
        { label: '/db', sub: 'postgres', state: 'live' as const },
        { label: '/auth', sub: 'oauth', state: 'idle' as const },
        { label: '/log', sub: 'observability', state: 'idle' as const },
      ];
      [-1, 1].forEach(side => {
        const r = createRack(
          { detailed: true, unitData: sideUnitData, width: RACK_WIDTH * 0.92, height: RACK_HEIGHT * 0.94, depth: RACK_DEPTH * 0.92 },
          colors,
          isMobile,
        );
        r.group.position.set(side * (RACK_WIDTH + 0.5), 0, -1.0);
        r.group.rotation.y = side * -0.2;
        scene.add(r.group);
        leds.push(...r.leds);
      });
    }

    /* ─── Floor — reflective on desktop, simple solid on mobile ───
       Uses Reflector (real-time mirror) on desktop for a subtle reflection
       of the racks above. Tinted dark with low opacity so it reads as a
       polished dark surface rather than a literal mirror.
       ─── */
    if (!isMobile && !reduced) {
      const reflector = new Reflector(
        new THREE.PlaneGeometry(40, 40),
        {
          clipBias: 0.003,
          textureWidth: 1024,
          textureHeight: 1024,
          color: new THREE.Color(shade(colors.bgElevated, 0.7)),
        },
      );
      reflector.rotation.x = -Math.PI / 2;
      reflector.position.y = -0.12;
      scene.add(reflector);
    } else {
      const matFloor = new THREE.MeshStandardMaterial({ color: colors.bg, metalness: 0.55, roughness: 0.35 });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), matFloor);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.12;
      floor.receiveShadow = true;
      scene.add(floor);
    }

    /* Warm glow pools beneath each rack — radial gradient discs */
    const glowTex = makeFloorGlow(colors.accent);
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    const glowPositions = [
      { x: 0, z: 0 },                          // hero rack
      ...(isMobile ? [] : [                      // side racks (desktop only)
        { x: -(RACK_WIDTH + 0.8), z: -1.5 },
        { x: RACK_WIDTH + 0.8, z: -1.5 },
      ]),
    ];
    glowPositions.forEach(pos => {
      const disc = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), glowMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(pos.x, -0.1, pos.z);
      scene.add(disc);
    });

    const gridHelper = new THREE.GridHelper(40, isMobile ? 20 : 40, shade(colors.bgSubtle, 0.6), colors.bg);
    gridHelper.position.y = -0.11;
    scene.add(gridHelper);

    /* ─── Ambient motes — gold dust ─── */
    const MOTE_COUNT = isMobile ? 15 : 130;
    const moteGeo = new THREE.BufferGeometry();
    const motePositions = new Float32Array(MOTE_COUNT * 3);
    for (let i = 0; i < MOTE_COUNT; i++) {
      motePositions[i * 3] = (Math.random() - 0.5) * (isMobile ? 12 : 20);
      motePositions[i * 3 + 1] = Math.random() * 7;
      motePositions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    const moteMat = new THREE.PointsMaterial({
      color: colors.accent, size: 0.022, transparent: true, opacity: 0.35, sizeAttenuation: true,
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    /* ─── Camera positions ───
       Elevated, centered (x=0), back far enough to show the full rack row.
       Looking slightly downward to reveal the 3/4 depth of the rack.
       ─── */
    const camStart = isMobile
      ? { pos: new THREE.Vector3(9, 4.5, 11), look: new THREE.Vector3(0, 2.5, 0) }
      : { pos: new THREE.Vector3(0, 7.5, 20), look: new THREE.Vector3(0, 2.8, -1.5) };
    const camEnd = isMobile
      ? { pos: new THREE.Vector3(5.8, 1.3, 8.5), look: new THREE.Vector3(0, 1.6, 0) }
      : { pos: new THREE.Vector3(0, 1.9, 13), look: new THREE.Vector3(0, 1.9, -0.6) };

    camera.position.copy(camStart.pos);
    camera.lookAt(camStart.look);

    /* ─── Mouse tracking (desktop only) ─── */
    let mouseX = 0, mouseY = 0, smoothMouseX = 0, smoothMouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!isMobile) window.addEventListener('mousemove', handleMouseMove);

    /* ─── State ─── */
    const state = {
      scene, camera, renderer, composer,
      heroGroup: hero.group,
      leds, fans, labels, motes, moteGeo,
      rimLight, topAccent,
      glowMat,
      clock: new THREE.Clock(),
      mouseX: 0, mouseY: 0,
      smoothMouseX: 0, smoothMouseY: 0,
      isMobile,
      animating: true,
    };

    sceneRef.current = state;

    /* ─── Intro animation ─── */
    const INTRO_DURATION = reduced ? 0 : 2.6;
    let introStart: number | null = null;

    function easeOutExpo(t: number) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

    /* ─── Render tick ─── */
    function tick() {
      if (!sceneRef.current?.animating) return;

      const dt = Math.min(state.clock.getDelta(), 0.05);
      const elapsed = state.clock.getElapsedTime();

      if (introStart === null) introStart = elapsed;
      const introT = Math.min((elapsed - introStart) / INTRO_DURATION, 1);
      const introEased = easeOutExpo(introT);

      smoothMouseX += (mouseX - smoothMouseX) * 0.04;
      smoothMouseY += (mouseY - smoothMouseY) * 0.04;

      if (introT < 1) {
        const pos = new THREE.Vector3().lerpVectors(camStart.pos, camEnd.pos, introEased);
        const look = new THREE.Vector3().lerpVectors(camStart.look, camEnd.look, introEased);
        camera.position.copy(pos);
        camera.lookAt(look);
      } else if (reduced) {
        camera.position.copy(camEnd.pos);
        camera.lookAt(camEnd.look);
      } else {
        const breatheX = Math.sin(elapsed * 0.12) * 0.18;
        const breatheY = Math.cos(elapsed * 0.09) * 0.1;
        camera.position.x = camEnd.pos.x + breatheX + smoothMouseX * 0.5;
        camera.position.y = camEnd.pos.y + breatheY - smoothMouseY * 0.3;
        camera.position.z = camEnd.pos.z;
        camera.lookAt(camEnd.look.x, camEnd.look.y, camEnd.look.z);
      }

      if (!reduced && !isMobile) {
        /* Auto-orbit ±3° + enhanced mouse response */
        const autoOrbit = Math.sin(elapsed * 0.07) * 0.05;
        const targetRotation = smoothMouseX * 0.18 + autoOrbit;
        hero.group.rotation.y += (targetRotation - hero.group.rotation.y) * 0.025;
      }

      /* LEDs — pulsing emissive glow (static on mobile) */
      leds.forEach(led => {
        let intensity: number;
        if (reduced || isMobile) {
          intensity = led.state === 'warn' ? 1.5 : (led.state === 'live' ? 2.0 : 0.15);
        } else if (led.state === 'live') {
          intensity = 1.2 + Math.sin(elapsed * led.blinkSpeed + led.phase) * 0.8;
        } else if (led.state === 'warn') {
          intensity = 0.8 + Math.sin(elapsed * led.blinkSpeed + led.phase) * 1.0;
        } else {
          intensity = 0.15 + Math.sin(elapsed * led.blinkSpeed + led.phase) * 0.08;
        }
        led.material.emissiveIntensity = Math.max(0.08, intensity);
      });

      /* Fans (desktop only) — no-op on mobile since fans don't exist */
      if (!reduced && !isMobile) {
        fans.forEach((fan, i) => { fan.rotation.z += dt * (2.2 + i * 0.4); });
      }

      /* Animated unit labels — cycle sub-text data every ~4s (desktop only) */
      if (!reduced && !isMobile && labels.length > 0) {
        const labelPhase = Math.floor(elapsed / 4) % 3;
        labels.forEach(l => {
          if (l.unit.state === 'idle') return; // only animate live/warn labels
          const subData: Record<string, string[]> = {
            '/retrieve': ['pgvector rag', '12.4k queries', '86ms avg'],
            '/chat': ['scheme saathi', '142 sessions', '97% uptime'],
            '/cache': ['redis', 'hit rate 87%', 'latency 4ms'],
          };
          const subs = subData[l.unit.label] || [l.unit.sub];
          const newSub = subs[labelPhase % subs.length];
          if (l.unit.sub !== newSub) {
            l.unit.sub = newSub;
            const ctx = l.ctx;
            ctx.clearRect(0, 0, 480, 72);
            ctx.font = '600 27px Inter, sans-serif';
            ctx.fillStyle = l.unit.state === 'live' ? toCss(colors.textPrimary) : toCss(colors.textMuted);
            ctx.textBaseline = 'middle';
            ctx.fillText(l.unit.label, 4, 24);
            ctx.font = '400 16px Inter, sans-serif';
            ctx.fillStyle = toCss(colors.textSecondary);
            ctx.fillText(newSub, 4, 52);
            l.material.map!.needsUpdate = true;
          }
        });
      }

      /* Motes — slow drift (static on mobile) */
      if (!reduced && !isMobile) {
        const moteAttr = moteGeo.attributes.position;
        for (let i = 0; i < MOTE_COUNT; i++) {
          moteAttr.array[i * 3 + 1] += dt * 0.12;
          if (moteAttr.array[i * 3 + 1] > 7) moteAttr.array[i * 3 + 1] = 0;
        }
        moteAttr.needsUpdate = true;
      }

      /* Lighting — gentle drift (static on mobile) */
      rimLight.intensity = (reduced || isMobile) ? 10 : 10 + Math.sin(elapsed * 0.6) * 1.5;
      topAccent.intensity = (reduced || isMobile) ? 1.2 : 1.2 + Math.sin(elapsed * 0.4 + 1) * 0.25;

      /* Floor glow — subtle ambient pulse */
      state.glowMat.opacity = (reduced || isMobile) ? 0.1 : 0.07 + Math.sin(elapsed * 0.5 + 0.3) * 0.03;

      if (state.composer && !state.isMobile && !reduced) {
        state.composer.render();
      } else {
        renderer.render(scene, camera);
      }
    }

    /* Sync to gsap.ticker instead of own rAF */
    gsap.ticker.add(tick);

    /* ─── Cleanup ─── */
    return () => {
      state.animating = false;
      gsap.ticker.remove(tick);
      if (!isMobile) window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', onResize);

      /* Dispose geometries, materials, textures */
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      if (composer) {
        composer.dispose();
      }
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [containerRef, reduced]);

  /* ─── Init on mount, cleanup on unmount ─── */
  useEffect(() => {
    const cleanup = initScene();
    return () => cleanup?.();
  }, [initScene]);

  /* ─── Pause/resume via IntersectionObserver ─── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !sceneRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (sceneRef.current) {
          sceneRef.current.animating = entry.isIntersecting;
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);
}