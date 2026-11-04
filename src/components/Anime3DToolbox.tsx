"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { animate } from "animejs";
import { Layers, Eye, Sparkles } from "lucide-react";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

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
  const [explodeProgress, setExplodeProgress] = useState(0.72);
  const [isExploded, setIsExploded] = useState(true);
  const [colorMode, setColorMode] = useState<"cream" | "gold" | "blueprint">("cream");

  const animStateRef = useRef({
    progress: 0.72,
    rotX: 0.38,
    rotY: -0.62,
    rotZ: 0.08,
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

    let width = mount.clientWidth || 1000;
    let height = mount.clientHeight || 640;

    const camera = new THREE.PerspectiveCamera(26, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      precision: "mediump",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mount.appendChild(renderer.domElement);

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // ── Master Lens Group (Angled Diagonally like Anime.js CAD view) ───
    const lensMasterGroup = new THREE.Group();
    lensMasterGroup.rotation.set(0.38, -0.62, 0.08);
    scene.add(lensMasterGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 3.2);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x70b8ff, 1.8);
    rimLight.position.set(-8, -6, -6);
    scene.add(rimLight);

    const goldFill = new THREE.DirectionalLight(0xd4a359, 2.0);
    goldFill.position.set(-6, 6, 6);
    scene.add(goldFill);

    // Theme Color Palettes (High Contrast, Vibrant on Dark Cinema BG)
    const getThemeColors = (mode: "cream" | "gold" | "blueprint"): ThemeColors => {
      if (mode === "cream") {
        return {
          fill: 0xfbf8f1,
          edge: 0xd4a359,
          accent: 0xe6ab4a,
          glass: 0x93c5fd,
          metalness: 0.35,
          roughness: 0.25,
          opacity: 0.96,
        };
      } else if (mode === "gold") {
        return {
          fill: 0x1c1917,
          edge: 0xf59e0b,
          accent: 0xfbbf24,
          glass: 0x38bdf8,
          metalness: 0.88,
          roughness: 0.18,
          opacity: 0.94,
        };
      } else {
        return {
          fill: 0x091428,
          edge: 0x38bdf8,
          accent: 0x818cf8,
          glass: 0x06b6d4,
          metalness: 0.55,
          roughness: 0.22,
          opacity: 0.92,
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
      let mat: THREE.Material;
      if (isGlass) {
        mat = new THREE.MeshPhysicalMaterial({
          color: currentColors.glass,
          metalness: 0.1,
          roughness: 0.05,
          transmission: 0.88,
          thickness: 1.4,
          reflectivity: 0.9,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          ior: 1.52,
          transparent: true,
          opacity: 0.75,
        });
      } else {
        mat = new THREE.MeshStandardMaterial({
          color: isAccent ? currentColors.accent : currentColors.fill,
          metalness: isAccent ? 0.9 : currentColors.metalness,
          roughness: isAccent ? 0.2 : currentColors.roughness,
          transparent: true,
          opacity: currentColors.opacity,
        });
      }

      const mesh = new THREE.Mesh(geom, mat);
      const edgeGeom = new THREE.EdgesGeometry(geom, 24);
      const edgeMat = new THREE.LineBasicMaterial({
        color: isGlass ? 0x93c5fd : currentColors.edge,
        linewidth: 1.5,
      });
      const lines = new THREE.LineSegments(edgeGeom, edgeMat);
      mesh.add(lines);
      return mesh;
    };

    // ── Build 9 High-Precision Optical Lens Assembly Groups ─────────────
    // Optical axis is along Z. Cylinders are rotated 90° on X so they point down Z!
    const elementsData: { group: THREE.Group; restZ: number; explodeZ: number }[] = [];

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
    addAssemblyGroup(2.4, 4.6, (g) => {
      const hoodGeom = new THREE.CylinderGeometry(2.3, 2.0, 0.6, 36, 1, true);
      hoodGeom.rotateX(Math.PI / 2);
      g.add(makePart(hoodGeom));

      const ringGeom = new THREE.CylinderGeometry(2.0, 1.85, 0.25, 36);
      ringGeom.rotateX(Math.PI / 2);
      g.add(makePart(ringGeom));
    });

    // 2. Front Aspherical Objective Glass (Optical Element 1)
    addAssemblyGroup(1.8, 3.5, (g) => {
      const glassGeom = new THREE.SphereGeometry(1.8, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.32);
      glassGeom.rotateX(Math.PI / 2);
      const glass = makePart(glassGeom, true);
      glass.scale.set(1, 1, 0.45);
      g.add(glass);

      const collarGeom = new THREE.CylinderGeometry(1.85, 1.85, 0.2, 36, 1, true);
      collarGeom.rotateX(Math.PI / 2);
      g.add(makePart(collarGeom));
    });

    // 3. Knurled Manual Focus Helicoid Barrel
    addAssemblyGroup(1.2, 2.4, (g) => {
      const barrelGeom = new THREE.CylinderGeometry(1.8, 1.8, 0.85, 36);
      barrelGeom.rotateX(Math.PI / 2);
      g.add(makePart(barrelGeom));

      // 24 Knurled vertical grip bars around the barrel
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const barGeom = new THREE.BoxGeometry(0.06, 0.08, 0.72);
        const bar = makePart(barGeom, false, true);
        bar.position.set(Math.cos(angle) * 1.82, Math.sin(angle) * 1.82, 0);
        bar.rotation.z = angle;
        g.add(bar);
      }
    });

    // 4. Distance Scale & Depth of Field Calibration Collar
    addAssemblyGroup(0.6, 1.5, (g) => {
      const scaleGeom = new THREE.CylinderGeometry(1.76, 1.76, 0.45, 36);
      scaleGeom.rotateX(Math.PI / 2);
      g.add(makePart(scaleGeom));

      const accentGeom = new THREE.CylinderGeometry(1.78, 1.78, 0.12, 36);
      accentGeom.rotateX(Math.PI / 2);
      const accent = makePart(accentGeom, false, true);
      accent.position.z = 0.12;
      g.add(accent);
    });

    // 5. 8-Blade Mechanical Aperture Iris Diaphragm
    addAssemblyGroup(0.0, 0.5, (g) => {
      const outerIrisGeom = new THREE.CylinderGeometry(1.72, 1.72, 0.4, 36, 1, true);
      outerIrisGeom.rotateX(Math.PI / 2);
      g.add(makePart(outerIrisGeom));

      // 8 polygonal aperture blades forming the iris
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const bladeGeom = new THREE.BoxGeometry(0.7, 0.22, 0.03);
        const blade = makePart(bladeGeom, false, true);
        blade.position.set(Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, 0);
        blade.rotation.z = angle + 0.45;
        g.add(blade);
      }
    });

    // 6. Dispersion Doublet Optical Group (Optical Element 2)
    addAssemblyGroup(-0.6, -0.5, (g) => {
      const concaveGeom = new THREE.CylinderGeometry(1.4, 1.4, 0.35, 32);
      concaveGeom.rotateX(Math.PI / 2);
      const concaveGlass = makePart(concaveGeom, true);
      g.add(concaveGlass);

      const collarGeom = new THREE.CylinderGeometry(1.46, 1.46, 0.4, 36, 1, true);
      collarGeom.rotateX(Math.PI / 2);
      g.add(makePart(collarGeom));
    });

    // 7. Internal Linear Float Motor & Electronics Group
    addAssemblyGroup(-1.2, -1.6, (g) => {
      const motorGeom = new THREE.CylinderGeometry(1.65, 1.65, 0.75, 36);
      motorGeom.rotateX(Math.PI / 2);
      g.add(makePart(motorGeom));

      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const block = makePart(new THREE.BoxGeometry(0.38, 0.28, 0.52));
        block.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0);
        block.rotation.z = angle;
        g.add(block);
      }
    });

    // 8. Stainless Steel Bayonet Mount & Electronic Contacts
    addAssemblyGroup(-1.8, -2.7, (g) => {
      const bayonetGeom = new THREE.CylinderGeometry(1.75, 1.75, 0.35, 36);
      bayonetGeom.rotateX(Math.PI / 2);
      g.add(makePart(bayonetGeom));

      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const lug = makePart(new THREE.BoxGeometry(0.35, 0.45, 0.15), false, true);
        lug.position.set(Math.cos(angle) * 1.85, Math.sin(angle) * 1.85, -0.08);
        lug.rotation.z = angle;
        g.add(lug);
      }
    });

    // 9. Full-Frame CMOS Sensor Block
    addAssemblyGroup(-2.4, -3.8, (g) => {
      // Sensor silicon plate (3:2 format)
      const sensor = makePart(new THREE.BoxGeometry(2.4, 1.6, 0.12), true, true);
      g.add(sensor);
      // Gold frame bezel
      const frame = makePart(new THREE.BoxGeometry(2.65, 1.85, 0.08), false, true);
      frame.position.z = -0.06;
      g.add(frame);
    });

    elementsRef.current = elementsData;

    // Align all elements along the optical Z axis
    const updatePositions = (progress: number) => {
      elementsData.forEach((el) => {
        const currentZ = THREE.MathUtils.lerp(el.restZ, el.explodeZ, progress);
        el.group.position.set(0, 0, currentZ);
      });
    };
    updatePositions(animStateRef.current.progress);

    // ── Intersection Observer: Only render WebGL when visible on screen ───
    let isVisible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { rootMargin: "120px" }
    );
    io.observe(mount);

    // ── 60fps Animation Loop (Zero GPU usage when offscreen) ────────────
    let animId: number;
    let clock = 0;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      if (!isVisible) return;

      clock += 0.015;
      const s = animStateRef.current;

      if (s.autoSpin && !s.isDragging) {
        // Subtle, elegant oscillation that preserves the diagonal exploded CAD perspective
        const oscY = -0.65 + Math.sin(clock * 0.45) * 0.14;
        const oscX = 0.30 + Math.cos(clock * 0.35) * 0.05;
        lensMasterGroup.rotation.set(oscX, oscY, 0.06);
      } else {
        lensMasterGroup.rotation.set(s.rotX, s.rotY, s.rotZ);
      }

      updatePositions(s.progress);
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(tick);

    // ── Resize Observer ───────────────────────────────────────────────
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });

    ro.observe(mount);

    return () => {
      cancelAnimationFrame(animId);
      io.disconnect();
      ro.disconnect();
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else if (m.material) {
            m.material.dispose();
          }
        }
      });
      renderer.dispose();
      pmremGenerator.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [colorMode]);

  // ── Anime.js: Animate Scrubber & Exploded State ─────────────────────
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

  // ── Mouse Drag 3D Orbit Handlers ───────────────────────────────────
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

    animStateRef.current.rotY += dx * 0.008;
    animStateRef.current.rotX += dy * 0.008;
  };

  const onMouseUp = () => {
    animStateRef.current.isDragging = false;
  };

  return (
    <section className="relative z-20 py-24 bg-background border-t border-border/40 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-mono tracking-widest uppercase">
            <Sparkles className="size-3" />
            <span>Interactive Disassembly</span>
          </div>
          <h2 className="mt-4 font-display text-4xl md:text-6xl font-light text-foreground tracking-tight">
            Medium-format optics.
          </h2>
          <p className="mt-3 text-xs md:text-sm text-muted-foreground font-light max-w-lg leading-relaxed">
            Break free from browser limitations and explore our medium-format lens anatomy in
            full real-time 3D, powered by Anime.js.
          </p>
        </div>

        {/* 3D Stage Container */}
        <div
          className="relative w-full h-[580px] md:h-[680px] rounded-2xl border border-gold/20 bg-black/40 backdrop-blur-sm overflow-hidden shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Three.js Canvas Container */}
          <div ref={mountRef} className="absolute inset-0 w-full h-full" />

          {/* ── Left Technical Labels ─────────────────────────────── */}
          <div className="pointer-events-none absolute left-6 md:left-12 top-10 flex flex-col gap-6 z-10 font-mono text-[10px] md:text-xs text-gold/90">
            {[
              "35MM CINE HOOD",
              "ASPHERICAL GLASS",
              "HELICOID FOCUS",
              "f/1.2 APERTURE IRIS",
              "DOUBLET GLASS",
              "BAYONET FLANGE",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center gap-3 transition-all duration-500"
                style={{
                  opacity: 0.4 + explodeProgress * 0.6,
                  transform: `translateX(${(1 - explodeProgress) * -12}px)`,
                }}
              >
                <span className="tracking-widest uppercase font-semibold">{label}</span>
                <span className="w-8 md:w-16 h-px bg-gold/40" />
              </div>
            ))}
          </div>

          {/* ── Right Technical Labels ────────────────────────────── */}
          <div className="pointer-events-none absolute right-6 md:right-12 top-10 flex flex-col items-end gap-6 z-10 font-mono text-[10px] md:text-xs text-gold/90">
            {[
              "FLUORITE COATING",
              "CALIBRATION SCALE",
              "8-BLADE IRIS",
              "OPTICAL STABILIZER",
              "LINEAR ACTUATOR",
              "FULL-FRAME SENSOR",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center gap-3 transition-all duration-500"
                style={{
                  opacity: 0.4 + explodeProgress * 0.6,
                  transform: `translateX(${(1 - explodeProgress) * 12}px)`,
                }}
              >
                <span className="w-8 md:w-16 h-px bg-gold/40" />
                <span className="tracking-widest uppercase font-semibold">{label}</span>
              </div>
            ))}
          </div>

          {/* ── Center Prompt Hint ────────────────────────────────── */}
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 border border-gold/30 text-gold/90 backdrop-blur-md text-[9px] font-mono tracking-widest uppercase shadow-lg">
            ⟲ DRAG IN 3D TO ORBIT · SCRUB BELOW TO EXPLODE
          </div>

          {/* ── Bottom Right: Anime.js Iconic Ticker Scrubber ───────── */}
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-10 z-20 flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleAssemble}
                className="px-3.5 py-1.5 rounded-full bg-black/90 hover:bg-black border border-gold/40 text-gold text-[10px] font-mono tracking-wider transition-transform active:scale-95 shadow-lg flex items-center gap-1.5"
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
                className="size-8 rounded-full bg-black/80 border border-gold/40 flex items-center justify-center text-gold hover:text-white transition-colors"
                title="Toggle Theme"
              >
                <Eye className="size-3.5" />
              </button>
            </div>

            {/* Horizontal Ticker Scrubber (Iconic Anime.js style) */}
            <div
              className="relative w-64 md:w-84 h-11 rounded-lg bg-black/90 border border-gold/40 backdrop-blur-md px-3 flex items-center cursor-ew-resize select-none shadow-2xl"
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
                    className={`inline-block w-px bg-gold transition-all ${
                      i % 5 === 0 ? "h-4 bg-gold" : "h-2 bg-gold/40"
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
