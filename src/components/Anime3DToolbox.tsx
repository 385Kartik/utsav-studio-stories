"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { animate } from "animejs";
import { RotateCcw, Sparkles, Layers, Sliders, Camera, Eye } from "lucide-react";
import { Eyebrow } from "@/components/buttons";

interface ModuleConfig {
  file: string;
  name: string;
  label?: string;
  side?: "left" | "right";
  restPos: [number, number, number];
  explodePos: [number, number, number];
  rotation?: [number, number, number];
}

const MODULES: ModuleConfig[] = [
  // 1. Front Lens Hood & Objective Glass
  {
    file: "module-shield-01.glb",
    name: "Hood & Sun Shield",
    label: "35mm Cine Hood",
    side: "left",
    restPos: [1.8, 1.8, 1.8],
    explodePos: [3.8, 3.8, 3.8],
  },
  {
    file: "module-shield-02.glb",
    name: "Anodized Front Ring",
    label: "Fluorite Coating",
    side: "right",
    restPos: [1.5, 1.5, 1.5],
    explodePos: [3.2, 3.2, 3.2],
  },
  {
    file: "module-animate-01.glb",
    name: "Front Aspherical Element",
    label: "Aspherical Glass",
    side: "left",
    restPos: [1.2, 1.2, 1.2],
    explodePos: [2.6, 2.6, 2.6],
  },

  // 2. Focus & Zoom Helicoid
  {
    file: "module-draggable-01.glb",
    name: "Manual Focus Helicoid",
    label: "Helicoid Focus",
    side: "right",
    restPos: [0.8, 0.8, 0.8],
    explodePos: [1.9, 1.9, 1.9],
  },
  {
    file: "module-scroll-01.glb",
    name: "Zoom Guide Collar",
    label: "Stepless Zoom",
    side: "left",
    restPos: [0.4, 0.4, 0.4],
    explodePos: [1.3, 1.3, 1.3],
  },

  // 3. Aperture Diaphragm Group
  {
    file: "module-timer-01.glb",
    name: "Aperture Iris Diaphragm",
    label: "f/1.2 Aperture Iris",
    side: "left",
    restPos: [0.0, 0.0, 0.0],
    explodePos: [0.6, 0.6, 0.6],
  },
  {
    file: "module-timer-02.glb",
    name: "Mechanical Blades Ring",
    label: "8-Blade Iris",
    side: "right",
    restPos: [-0.3, -0.3, -0.3],
    explodePos: [0.0, 0.0, 0.0],
  },

  // 4. Dispersion Doublet & Float Group
  {
    file: "module-spring-01.glb",
    name: "Dispersion Doublet",
    label: "Doublet Glass",
    side: "left",
    restPos: [-0.6, -0.6, -0.6],
    explodePos: [-0.6, -0.6, -0.6],
  },
  {
    file: "module-stagger-01.glb",
    name: "Floating Compensator",
    label: "Optical Stabilizer",
    side: "right",
    restPos: [-0.9, -0.9, -0.9],
    explodePos: [-1.3, -1.3, -1.3],
  },

  // 5. Rear Elements & Electronics
  {
    file: "module-svg-01.glb",
    name: "Rear Aspheric Group",
    label: "Bavarian Element",
    side: "left",
    restPos: [-1.2, -1.2, -1.2],
    explodePos: [-1.9, -1.9, -1.9],
  },
  {
    file: "module-engine-01.glb",
    name: "Electronic Contacts",
    label: "Linear Actuator",
    side: "right",
    restPos: [-1.5, -1.5, -1.5],
    explodePos: [-2.6, -2.6, -2.6],
  },

  // 6. Camera Bayonet Mount & Full-Frame Sensor
  {
    file: "module-timeline-01.glb",
    name: "Steel Bayonet Mount",
    label: "Bayonet Flange",
    side: "left",
    restPos: [-1.8, -1.8, -1.8],
    explodePos: [-3.2, -3.2, -3.2],
  },
  {
    file: "module-renderer-01.glb",
    name: "Full-Frame CMOS Sensor",
    label: "Full-Frame Sensor",
    side: "right",
    restPos: [-2.1, -2.1, -2.1],
    explodePos: [-3.8, -3.8, -3.8],
  },
];

export function Anime3DToolbox() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [explodeProgress, setExplodeProgress] = useState(0.85); // Start exploded like animejs.com!
  const [isExploded, setIsExploded] = useState(true);
  const [colorMode, setColorMode] = useState<"cream" | "gold" | "blueprint">("cream");
  const [loadedCount, setLoadedCount] = useState(0);

  // References for live 3D animation loop
  const animStateRef = useRef({
    progress: 0.85,
    rotX: 0.42,
    rotY: -0.68,
    rotZ: 0.28,
    autoSpin: true,
    lastX: 0,
    lastY: 0,
    isDragging: false,
  });

  const meshNodesRef = useRef<
    {
      mesh: THREE.Group;
      edges: THREE.LineSegments[];
      rest: THREE.Vector3;
      exploded: THREE.Vector3;
    }[]
  >([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mount = mountRef.current;
    if (!mount) return;

    // ── Three.js Scene Setup ──────────────────────────────────────────
    const scene = new THREE.Scene();

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 560;

    const camera = new THREE.OrthographicCamera(
      -width / 240,
      width / 240,
      height / 240,
      -height / 240,
      -20,
      50,
    );
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Main 3D Pivot Group angled diagonally (Isometric view)
    const lensGroup = new THREE.Group();
    lensGroup.rotation.set(0.42, -0.68, 0.28);
    scene.add(lensGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(5, 12, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd4a359, 1.5);
    dirLight2.position.set(-8, -5, -4);
    scene.add(dirLight2);

    // Materials
    const getThemeColors = (mode: "cream" | "gold" | "blueprint") => {
      if (mode === "cream") {
        return {
          fill: 0xf5f3ee,
          edge: 0x2b2926,
          metalness: 0.1,
          roughness: 0.4,
          opacity: 0.95,
        };
      } else if (mode === "gold") {
        return {
          fill: 0x18181b,
          edge: 0xd4a359,
          metalness: 0.8,
          roughness: 0.2,
          opacity: 0.92,
        };
      } else {
        return {
          fill: 0x091424,
          edge: 0x4cc9f0,
          metalness: 0.5,
          roughness: 0.3,
          opacity: 0.88,
        };
      }
    };

    const currentColors = getThemeColors(colorMode);

    const surfaceMaterial = new THREE.MeshStandardMaterial({
      color: currentColors.fill,
      metalness: currentColors.metalness,
      roughness: currentColors.roughness,
      transparent: true,
      opacity: currentColors.opacity,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: currentColors.edge,
      linewidth: 1.5,
    });

    // ── Load GLB Models ───────────────────────────────────────────────
    const loader = new GLTFLoader();
    const loadedList: typeof meshNodesRef.current = [];

    MODULES.forEach((mod) => {
      loader.load(
        `/assets/models/${mod.file}`,
        (gltf) => {
          const root = gltf.scene;
          const edgesList: THREE.LineSegments[] = [];

          root.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = surfaceMaterial;

              // Generate crisp CAD line edges
              const edgesGeom = new THREE.EdgesGeometry(mesh.geometry, 24);
              const line = new THREE.LineSegments(edgesGeom, edgeMaterial);
              mesh.add(line);
              edgesList.push(line);
            }
          });

          // Scale and initial position
          root.scale.set(0.7, 0.7, 0.7);

          const rest = new THREE.Vector3(...mod.restPos);
          const exploded = new THREE.Vector3(...mod.explodePos);

          root.position.lerpVectors(rest, exploded, animStateRef.current.progress);
          lensGroup.add(root);

          loadedList.push({
            mesh: root,
            edges: edgesList,
            rest,
            exploded,
          });

          meshNodesRef.current = loadedList;
          setLoadedCount((c) => c + 1);
        },
        undefined,
        (err) => console.warn(`Failed loading model: ${mod.file}`, err),
      );
    });

    // ── 60fps Animation Loop ──────────────────────────────────────────
    let animId: number;

    const tick = () => {
      const s = animStateRef.current;

      // Smooth auto-orbit when not dragging
      if (s.autoSpin && !s.isDragging) {
        s.rotZ += 0.003;
        lensGroup.rotation.set(s.rotX, s.rotY, s.rotZ);
      } else {
        lensGroup.rotation.set(s.rotX, s.rotY, s.rotZ);
      }

      // Update element explosion along 3D axis
      meshNodesRef.current.forEach((item) => {
        item.mesh.position.lerpVectors(item.rest, item.exploded, s.progress);
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.left = -w / 240;
      camera.right = w / 240;
      camera.top = h / 240;
      camera.bottom = -h / 240;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [colorMode]);

  // ── Anime.js: Animate Scrubber & Exploded State ─────────────────────────────
  const setExplosion = (targetVal: number, duration = 1200) => {
    setIsExploded(targetVal > 0.4);
    animStateRef.current.autoSpin = false;

    animate(animStateRef.current, {
      progress: targetVal,
      duration,
      ease: targetVal > 0.5 ? "outElastic(1, 0.55)" : "outExpo",
      onUpdate: () => {
        setExplodeProgress(animStateRef.current.progress);
      },
      onComplete: () => {
        animStateRef.current.autoSpin = true;
      },
    });
  };

  const toggleAssemble = () => {
    setExplosion(isExploded ? 0 : 0.85);
  };

  // ── Mouse Drag 3D Orbit Handlers ───────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    animStateRef.current.isDragging = true;
    animStateRef.current.autoSpin = false;
    animStateRef.current.lastX = e.clientX;
    animStateRef.current.lastY = e.clientY;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!animStateRef.current.isDragging) return;
    const dx = e.clientX - animStateRef.current.lastX;
    const dy = e.clientY - animStateRef.current.lastY;
    animStateRef.current.lastX = e.clientX;
    animStateRef.current.lastY = e.clientY;

    animStateRef.current.rotZ += dx * 0.01;
    animStateRef.current.rotX += dy * 0.01;
  };

  const onMouseUp = () => {
    animStateRef.current.isDragging = false;
  };

  const leftLabels = MODULES.filter((m) => m.side === "left");
  const rightLabels = MODULES.filter((m) => m.side === "right");

  const bgStyle =
    colorMode === "cream"
      ? "bg-[#e8e4dc] text-[#242320]"
      : colorMode === "gold"
        ? "bg-[#121214] text-[#f4eedf]"
        : "bg-[#0b1320] text-[#e0f2fe]";

  return (
    <section
      className={`relative z-20 py-24 md:py-32 transition-colors duration-700 select-none overflow-hidden ${bgStyle}`}
    >
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        {/* Top Header */}
        <div className="max-w-xl mb-12">
          <span className="font-mono text-xs uppercase tracking-[0.35em] text-gold font-semibold block mb-3">
            Optical Engineering · Est. 1994
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-light tracking-tight leading-[1.08]">
            The complete <br />
            <span className="font-italic">studio optical system</span>
          </h2>
          <p className="mt-4 text-xs md:text-sm text-foreground/70 font-light leading-relaxed">
            Break free from browser limitations and explore our medium-format lens anatomy in
            full real-time 3D, powered by Anime.js.
          </p>
        </div>

        {/* 3D Stage Container */}
        <div
          className="relative w-full h-[580px] md:h-[660px] rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Three.js Canvas Container */}
          <div ref={mountRef} className="absolute inset-0 w-full h-full" />

          {/* ── Left Technical Labels ─────────────────────────────── */}
          <div className="pointer-events-none absolute left-6 md:left-12 top-10 flex flex-col gap-5 z-10 font-mono text-[10px] md:text-xs">
            {leftLabels.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center gap-3 transition-all duration-500"
                style={{
                  opacity: 0.35 + explodeProgress * 0.65,
                  transform: `translateX(${(1 - explodeProgress) * -15}px)`,
                }}
              >
                <span className="tracking-widest uppercase font-medium">{item.label}</span>
                <span className="w-8 md:w-16 h-px bg-current opacity-40" />
              </div>
            ))}
          </div>

          {/* ── Right Technical Labels ────────────────────────────── */}
          <div className="pointer-events-none absolute right-6 md:right-12 top-10 flex flex-col items-end gap-5 z-10 font-mono text-[10px] md:text-xs">
            {rightLabels.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center gap-3 transition-all duration-500"
                style={{
                  opacity: 0.35 + explodeProgress * 0.65,
                  transform: `translateX(${(1 - explodeProgress) * 15}px)`,
                }}
              >
                <span className="w-8 md:w-16 h-px bg-current opacity-40" />
                <span className="tracking-widest uppercase font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* ── Center Prompt Hint ────────────────────────────────── */}
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md text-[9px] font-mono tracking-widest uppercase">
            ⟲ DRAG IN 3D TO ORBIT · SCRUB BELOW TO EXPLODE
          </div>

          {/* ── Bottom Right: Anime.js Iconic Ticker Scrubber ───────── */}
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-10 z-20 flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleAssemble}
                className="px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-[10px] font-mono tracking-wider transition-transform active:scale-95 shadow-lg flex items-center gap-1.5"
              >
                <Layers className="size-3 text-gold" />
                <span>{isExploded ? "ASSEMBLE" : "EXPLODE"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setColorMode((m) =>
                    m === "cream" ? "gold" : m === "gold" ? "blueprint" : "cream",
                  );
                }}
                className="size-8 rounded-full bg-black/15 dark:bg-white/15 flex items-center justify-center text-current hover:opacity-80 transition-opacity"
                title="Toggle Theme"
              >
                <Eye className="size-3.5" />
              </button>
            </div>

            {/* Horizontal Ticker Scrubber (Exactly like animejs.com!) */}
            <div
              className="relative w-64 md:w-80 h-10 rounded-lg bg-black/85 border border-white/20 backdrop-blur-md px-3 flex items-center cursor-ew-resize select-none shadow-2xl"
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const update = (moveE: MouseEvent) => {
                  const val = Math.max(0, Math.min(1, (moveE.clientX - rect.left) / rect.width));
                  setExplosion(val, 300);
                };
                update(e.nativeEvent);
                const onUp = () => {
                  window.removeEventListener("mousemove", update);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", update);
                window.addEventListener("mouseup", onUp);
              }}
            >
              {/* Ticker vertical ticks */}
              <div className="w-full flex justify-between items-center opacity-40 px-1 pointer-events-none">
                {Array.from({ length: 42 }).map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block w-px bg-white transition-all ${
                      i % 5 === 0 ? "h-4 bg-white/90" : "h-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Red Indicator Needle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-xs bg-[#ff3344] shadow-[0_0_10px_#ff3344] pointer-events-none transition-all duration-75"
                style={{
                  left: `calc(${explodeProgress * 100}% - 3px)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
