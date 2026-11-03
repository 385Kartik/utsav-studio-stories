"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { animate } from "animejs";
import { Layers, Eye, RotateCw, Sparkles, Sliders } from "lucide-react";

interface LensElement {
  id: string;
  name: string;
  label: string;
  side: "left" | "right";
  build: (theme: ThemeColors) => THREE.Group;
  restZ: number;
  explodeZ: number;
}

interface ThemeColors {
  fill: number;
  edge: number;
  accent: number;
  glass: number;
  metalness: number;
  roughness: number;
  opacity: number;
}

export function Anime3DToolbox() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [explodeProgress, setExplodeProgress] = useState(0.75); // Start exploded like animejs.com!
  const [isExploded, setIsExploded] = useState(true);
  const [colorMode, setColorMode] = useState<"cream" | "gold" | "blueprint">("cream");

  // State reference for 60fps loop & Anime.js
  const animStateRef = useRef({
    progress: 0.75,
    rotX: 0.48,
    rotY: -0.65,
    rotZ: 0.32,
    autoSpin: true,
    lastX: 0,
    lastY: 0,
    isDragging: false,
  });

  const elementsRef = useRef<{ group: THREE.Group; restZ: number; explodeZ: number }[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mount = mountRef.current;
    if (!mount) return;

    // ── Three.js Scene Setup ──────────────────────────────────────────
    const scene = new THREE.Scene();

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 580;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(7.5, 5.5, 9.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Main 3D Pivot Group angled diagonally (Isometric 45° view like animejs.com!)
    const lensMasterGroup = new THREE.Group();
    lensMasterGroup.rotation.set(0.48, -0.65, 0.32);
    scene.add(lensMasterGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(8, 14, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xd4a359, 1.6);
    dirLight2.position.set(-8, -6, -6);
    scene.add(dirLight2);

    // Theme Color Palettes
    const getThemeColors = (mode: "cream" | "gold" | "blueprint"): ThemeColors => {
      if (mode === "cream") {
        return {
          fill: 0xf4f0e8,
          edge: 0x242220,
          accent: 0xc99446,
          glass: 0x64b5f6,
          metalness: 0.15,
          roughness: 0.35,
          opacity: 0.96,
        };
      } else if (mode === "gold") {
        return {
          fill: 0x161619,
          edge: 0xd4a359,
          accent: 0xf5dfa0,
          glass: 0x4dd0e1,
          metalness: 0.85,
          roughness: 0.2,
          opacity: 0.94,
        };
      } else {
        return {
          fill: 0x081324,
          edge: 0x38bdf8,
          accent: 0x818cf8,
          glass: 0x38bdf8,
          metalness: 0.5,
          roughness: 0.3,
          opacity: 0.9,
        };
      }
    };

    const currentColors = getThemeColors(colorMode);

    // Helper: Material Creator with CAD line edges
    const makePart = (
      geom: THREE.BufferGeometry,
      isGlass = false,
      isAccent = false,
    ) => {
      const mat = new THREE.MeshStandardMaterial({
        color: isGlass
          ? currentColors.glass
          : isAccent
            ? currentColors.accent
            : currentColors.fill,
        metalness: isGlass ? 0.9 : currentColors.metalness,
        roughness: isGlass ? 0.1 : currentColors.roughness,
        transparent: true,
        opacity: isGlass ? 0.35 : currentColors.opacity,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });

      const mesh = new THREE.Mesh(geom, mat);
      const edgeGeom = new THREE.EdgesGeometry(geom, 22);
      const edgeMat = new THREE.LineBasicMaterial({
        color: isGlass ? 0x90caf9 : currentColors.edge,
        linewidth: 1.5,
      });
      const lines = new THREE.LineSegments(edgeGeom, edgeMat);
      mesh.add(lines);
      return mesh;
    };

    // ── Build 8 High-Precision Optical Lens Assembly Groups ─────────────
    const elementsData: { group: THREE.Group; restZ: number; explodeZ: number }[] = [];

    // Axis direction vector: diagonal [1, 1, 1] normalized
    const axisDir = new THREE.Vector3(1, 1, 1).normalize();

    const addAssemblyGroup = (
      restDist: number,
      explodeDist: number,
      builder: (g: THREE.Group) => void,
    ) => {
      const group = new THREE.Group();
      builder(group);
      lensMasterGroup.add(group);
      elementsData.push({
        group,
        restZ: restDist,
        explodeZ: explodeDist,
      });
    };

    // 1. Front Sun Hood & Filter Thread
    addAssemblyGroup(2.4, 4.8, (g) => {
      // Main flared hood
      g.add(makePart(new THREE.CylinderGeometry(2.3, 2.0, 0.6, 32, 1, true)));
      g.add(makePart(new THREE.CylinderGeometry(2.0, 1.85, 0.3, 32)));
      // Thread ridges
      for (let i = 0; i < 4; i++) {
        const ring = makePart(new THREE.TorusGeometry(1.88, 0.02, 6, 32));
        ring.position.y = (i - 1.5) * 0.06;
        g.add(ring);
      }
    });

    // 2. Front Aspherical Objective Glass (Optical Element 1)
    addAssemblyGroup(1.8, 3.8, (g) => {
      // Curved lens element
      const glass = makePart(new THREE.SphereGeometry(1.8, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.35), true);
      glass.rotation.x = Math.PI;
      glass.scale.set(1, 0.45, 1);
      g.add(glass);
      // Retaining collar
      g.add(makePart(new THREE.CylinderGeometry(1.85, 1.85, 0.25, 32, 1, true)));
    });

    // 3. Knurled Manual Focus Helicoid Barrel
    addAssemblyGroup(1.2, 2.7, (g) => {
      // Barrel cylinder
      g.add(makePart(new THREE.CylinderGeometry(1.8, 1.8, 0.9, 32)));
      // 24 Knurled vertical grip bars around the barrel
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const bar = makePart(new THREE.BoxGeometry(0.06, 0.75, 0.08));
        bar.position.set(Math.cos(angle) * 1.82, 0, Math.sin(angle) * 1.82);
        bar.rotation.y = -angle;
        g.add(bar);
      }
    });

    // 4. Distance Scale & Depth of Field Calibration Collar
    addAssemblyGroup(0.6, 1.7, (g) => {
      g.add(makePart(new THREE.CylinderGeometry(1.76, 1.76, 0.45, 32)));
      // Accent calibration ring
      const accentRing = makePart(new THREE.CylinderGeometry(1.78, 1.78, 0.12, 32), false, true);
      accentRing.position.y = 0.1;
      g.add(accentRing);
    });

    // 5. 8-Blade Mechanical Aperture Iris Diaphragm
    addAssemblyGroup(0.0, 0.6, (g) => {
      // Outer aperture collar
      g.add(makePart(new THREE.CylinderGeometry(1.72, 1.72, 0.5, 32, 1, true)));
      // 8 polygonal aperture blades forming the iris
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const blade = makePart(new THREE.BoxGeometry(0.7, 0.04, 0.25), false, true);
        blade.position.set(Math.cos(angle) * 0.75, 0, Math.sin(angle) * 0.75);
        blade.rotation.y = angle + 0.45;
        g.add(blade);
      }
    });

    // 6. Dispersion Doublet Optical Group (Optical Element 2)
    addAssemblyGroup(-0.6, -0.6, (g) => {
      const concaveGlass = makePart(new THREE.CylinderGeometry(1.4, 1.4, 0.35, 32), true);
      g.add(concaveGlass);
      g.add(makePart(new THREE.CylinderGeometry(1.46, 1.46, 0.45, 32, 1, true)));
    });

    // 7. Internal Linear Float Motor & Electronics Group
    addAssemblyGroup(-1.2, -1.8, (g) => {
      g.add(makePart(new THREE.CylinderGeometry(1.65, 1.65, 0.8, 32)));
      // Electronic actuator blocks
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const block = makePart(new THREE.BoxGeometry(0.4, 0.55, 0.3));
        block.position.set(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5);
        block.rotation.y = angle;
        g.add(block);
      }
    });

    // 8. Stainless Steel Bayonet Mount & Electronic Contacts
    addAssemblyGroup(-1.8, -2.9, (g) => {
      g.add(makePart(new THREE.CylinderGeometry(1.75, 1.75, 0.35, 32)));
      // 3 Bayonet locking lugs
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const lug = makePart(new THREE.BoxGeometry(0.35, 0.15, 0.5), false, true);
        lug.position.set(Math.cos(angle) * 1.85, 0.08, Math.sin(angle) * 1.85);
        lug.rotation.y = angle;
        g.add(lug);
      }
    });

    // 9. Full-Frame CMOS Sensor Block
    addAssemblyGroup(-2.4, -4.0, (g) => {
      // Sensor silicon plate (3:2 format)
      const sensor = makePart(new THREE.BoxGeometry(2.4, 0.15, 1.6), true, true);
      g.add(sensor);
      // Gold frame bezel
      g.add(makePart(new THREE.BoxGeometry(2.6, 0.1, 1.8)));
    });

    elementsRef.current = elementsData;

    // Align all elements along the diagonal axis
    const updatePositions = (progress: number) => {
      elementsData.forEach((el) => {
        const currentDist = THREE.MathUtils.lerp(el.restZ, el.explodeZ, progress);
        el.group.position.copy(axisDir.clone().multiplyScalar(currentDist));
      });
    };
    updatePositions(animStateRef.current.progress);

    // ── 60fps Animation Loop ──────────────────────────────────────────
    let animId: number;

    const tick = () => {
      const s = animStateRef.current;

      // Smooth auto-orbit when not dragging
      if (s.autoSpin && !s.isDragging) {
        s.rotZ += 0.0035;
        lensMasterGroup.rotation.set(s.rotX, s.rotY, s.rotZ);
      } else {
        lensMasterGroup.rotation.set(s.rotX, s.rotY, s.rotZ);
      }

      updatePositions(s.progress);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
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
    setExplosion(isExploded ? 0 : 0.82);
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

  const bgStyle =
    colorMode === "cream"
      ? "bg-[#e5e0d8] text-[#242320]"
      : colorMode === "gold"
        ? "bg-[#111113] text-[#f4eedf]"
        : "bg-[#091220] text-[#e0f2fe]";

  return (
    <section
      className={`relative z-20 py-24 md:py-32 transition-colors duration-700 select-none overflow-hidden ${bgStyle}`}
    >
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        {/* Top Header */}
        <div className="max-w-xl mb-10">
          <span className="font-mono text-xs uppercase tracking-[0.35em] text-gold font-semibold block mb-3">
            Optical Engineering · Est. 1994
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-light tracking-tight leading-[1.08]">
            The complete <br />
            <span className="font-italic">studio optical system</span>
          </h2>
          <p className="mt-4 text-xs md:text-sm text-foreground/75 font-light leading-relaxed">
            Break free from browser limitations and explore our medium-format lens anatomy in
            full real-time 3D, powered by Anime.js.
          </p>
        </div>

        {/* 3D Stage Container */}
        <div
          className="relative w-full h-[580px] md:h-[680px] rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Three.js Canvas Container */}
          <div ref={mountRef} className="absolute inset-0 w-full h-full" />

          {/* ── Left Technical Labels ─────────────────────────────── */}
          <div className="pointer-events-none absolute left-6 md:left-12 top-10 flex flex-col gap-6 z-10 font-mono text-[10px] md:text-xs">
            {[
              "35MM CINE HOOD",
              "ASPHERICAL GLASS",
              "HELICOID FOCUS",
              "f/1.2 APERTURE IRIS",
              "DOUBLET GLASS",
              "BAYONET FLANGE",
            ].map((label, idx) => (
              <div
                key={label}
                className="flex items-center gap-3 transition-all duration-500"
                style={{
                  opacity: 0.35 + explodeProgress * 0.65,
                  transform: `translateX(${(1 - explodeProgress) * -15}px)`,
                }}
              >
                <span className="tracking-widest uppercase font-semibold">{label}</span>
                <span className="w-8 md:w-16 h-px bg-current opacity-40" />
              </div>
            ))}
          </div>

          {/* ── Right Technical Labels ────────────────────────────── */}
          <div className="pointer-events-none absolute right-6 md:right-12 top-10 flex flex-col items-end gap-6 z-10 font-mono text-[10px] md:text-xs">
            {[
              "FLUORITE COATING",
              "CALIBRATION SCALE",
              "8-BLADE IRIS",
              "OPTICAL STABILIZER",
              "LINEAR ACTUATOR",
              "FULL-FRAME SENSOR",
            ].map((label, idx) => (
              <div
                key={label}
                className="flex items-center gap-3 transition-all duration-500"
                style={{
                  opacity: 0.35 + explodeProgress * 0.65,
                  transform: `translateX(${(1 - explodeProgress) * 15}px)`,
                }}
              >
                <span className="w-8 md:w-16 h-px bg-current opacity-40" />
                <span className="tracking-widest uppercase font-semibold">{label}</span>
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
                className="px-3.5 py-1.5 rounded-full bg-black/85 hover:bg-black text-white text-[10px] font-mono tracking-wider transition-transform active:scale-95 shadow-lg flex items-center gap-1.5"
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
              className="relative w-64 md:w-84 h-11 rounded-lg bg-black/90 border border-white/20 backdrop-blur-md px-3 flex items-center cursor-ew-resize select-none shadow-2xl"
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
                {Array.from({ length: 44 }).map((_, i) => (
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
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-xs bg-[#ff3344] shadow-[0_0_12px_#ff3344] pointer-events-none transition-all duration-75"
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
