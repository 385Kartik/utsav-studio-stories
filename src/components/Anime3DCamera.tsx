"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import {
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Camera,
  Layers,
  Eye,
  Sliders,
} from "lucide-react";
import { Eyebrow } from "@/components/buttons";

// ── 3D Geometry Types ────────────────────────────────────────────────────────
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face3D {
  indices: number[];
  color: string;
  wireColor: string;
  normal?: Point3D;
  centerZ?: number;
  isGlass?: boolean;
}

interface ElementGroup {
  name: string;
  zExplodeOffset: number;
  vertices: Point3D[];
  faces: Face3D[];
}

export function Anime3DCamera() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [colorTheme, setColorTheme] = useState<"gold" | "blueprint" | "chrome">("gold");
  const [isDragging, setIsDragging] = useState(false);
  const [shutterFired, setShutterFired] = useState(false);
  const [hudStats, setHudStats] = useState({ yaw: -22, pitch: 14, explode: 0 });

  // 3D State managed for Anime.js
  const stateRef = useRef({
    yaw: -0.38, // radians
    pitch: 0.24,
    roll: 0,
    explodeProgress: 0, // 0 = assembled, 1 = exploded
    apertureOpen: 1, // 0 = closed, 1 = open
    flashOpacity: 0,
    autoRotate: true,
    lastMouseX: 0,
    lastMouseY: 0,
    focalLength: 50,
  });

  // ── Build 3D Camera Geometry ───────────────────────────────────────────────
  const geometryRef = useRef<ElementGroup[]>([]);

  useEffect(() => {
    const groups: ElementGroup[] = [];

    // Helper: Generate a 3D circle/cylinder ring
    const createRing = (
      r: number,
      z1: number,
      z2: number,
      segments: number,
      explodeOffset: number,
      name: string,
      color: string,
      wireColor: string,
      isGlass = false,
    ): ElementGroup => {
      const vertices: Point3D[] = [];
      const faces: Face3D[] = [];

      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        vertices.push({ x: cos * r, y: sin * r, z: z1 });
        vertices.push({ x: cos * r, y: sin * r, z: z2 });
      }

      for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        const p1 = i * 2;
        const p2 = i * 2 + 1;
        const p3 = next * 2 + 1;
        const p4 = next * 2;
        faces.push({
          indices: [p1, p2, p3, p4],
          color,
          wireColor,
          isGlass,
        });
      }

      return { name, zExplodeOffset: explodeOffset, vertices, faces };
    };

    // Helper: Generate a 3D Box
    const createBox = (
      w: number,
      h: number,
      d: number,
      cx: number,
      cy: number,
      cz: number,
      explodeOffset: number,
      name: string,
      color: string,
      wireColor: string,
    ): ElementGroup => {
      const hw = w / 2;
      const hh = h / 2;
      const hd = d / 2;
      const vertices: Point3D[] = [
        { x: cx - hw, y: cy - hh, z: cz - hd },
        { x: cx + hw, y: cy - hh, z: cz - hd },
        { x: cx + hw, y: cy + hh, z: cz - hd },
        { x: cx - hw, y: cy + hh, z: cz - hd },
        { x: cx - hw, y: cy - hh, z: cz + hd },
        { x: cx + hw, y: cy - hh, z: cz + hd },
        { x: cx + hw, y: cy + hh, z: cz + hd },
        { x: cx - hw, y: cy + hh, z: cz + hd },
      ];

      const faces: Face3D[] = [
        { indices: [0, 1, 2, 3], color, wireColor }, // Back
        { indices: [5, 4, 7, 6], color, wireColor }, // Front
        { indices: [4, 0, 3, 7], color, wireColor }, // Left
        { indices: [1, 5, 6, 2], color, wireColor }, // Right
        { indices: [4, 5, 1, 0], color, wireColor }, // Top
        { indices: [3, 2, 6, 7], color, wireColor }, // Bottom
      ];

      return { name, zExplodeOffset: explodeOffset, vertices, faces };
    };

    // 1. Camera Chassis (Body)
    groups.push(
      createBox(170, 105, 52, 0, 0, -45, -70, "Camera Chassis", "rgba(18, 18, 20, 0.85)", "rgba(212, 163, 89, 0.6)"),
    );

    // 2. Top Viewfinder Prism & Dial Deck
    groups.push(
      createBox(60, 24, 46, -45, -60, -45, -85, "Optical Viewfinder", "rgba(25, 25, 28, 0.9)", "rgba(212, 163, 89, 0.8)"),
    );
    groups.push(
      createBox(28, 14, 28, 52, -56, -45, -80, "Shutter Speed Dial", "rgba(212, 163, 89, 0.25)", "rgba(212, 163, 89, 0.9)"),
    );

    // 3. Full-Frame CMOS Sensor Plate (visible when exploded!)
    groups.push(
      createBox(44, 32, 4, 0, 0, -18, -35, "Full-Frame Sensor", "rgba(40, 180, 160, 0.35)", "rgba(40, 220, 180, 0.9)"),
    );

    // 4. Lens Mount Base Ring
    groups.push(
      createRing(48, -12, 12, 18, 10, "Bayonet Mount", "rgba(22, 22, 25, 0.85)", "rgba(212, 163, 89, 0.65)"),
    );

    // 5. Rear Lens Element (Optical Glass 1)
    groups.push(
      createRing(34, 14, 22, 16, 45, "Rear Aspherical Glass", "rgba(80, 190, 240, 0.25)", "rgba(120, 210, 255, 0.9)", true),
    );

    // 6. Aperture Diaphragm Ring & Blades
    groups.push(
      createRing(44, 24, 42, 18, 85, "Aperture Iris Group", "rgba(18, 18, 22, 0.9)", "rgba(212, 163, 89, 0.9)"),
    );

    // 7. Middle Dispersion Doublet Lens (Optical Glass 2)
    groups.push(
      createRing(38, 44, 52, 16, 125, "Dispersion Doublet", "rgba(212, 163, 89, 0.25)", "rgba(240, 200, 120, 0.9)", true),
    );

    // 8. Focus Helicoid Outer Barrel
    groups.push(
      createRing(48, 54, 76, 20, 165, "Helicoid Focus Barrel", "rgba(20, 20, 24, 0.85)", "rgba(212, 163, 89, 0.75)"),
    );

    // 9. Front Aspherical Objective Lens (Optical Glass 3)
    groups.push(
      createRing(44, 78, 88, 20, 215, "Front Convex Element", "rgba(70, 200, 240, 0.3)", "rgba(100, 220, 255, 0.95)", true),
    );

    // 10. Front Filter Thread & Sun Hood
    groups.push(
      createRing(54, 90, 106, 22, 265, "Anodized Lens Hood", "rgba(15, 15, 18, 0.9)", "rgba(212, 163, 89, 0.85)"),
    );

    geometryRef.current = groups;
  }, []);

  // ── Render 3D Loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const lightDir: Point3D = { x: 0.35, y: -0.65, z: 0.68 };
    const len = Math.hypot(lightDir.x, lightDir.y, lightDir.z);
    lightDir.x /= len;
    lightDir.y /= len;
    lightDir.z /= len;

    const render = () => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      // Auto-orbit smoothly when not dragging
      if (s.autoRotate && !isDragging) {
        s.yaw += 0.007;
        s.pitch = 0.22 + Math.sin(Date.now() * 0.001) * 0.08;
      }

      // Update telemetry for HUD
      setHudStats({
        yaw: Math.round(((s.yaw * 180) / Math.PI) % 360),
        pitch: Math.round(((s.pitch * 180) / Math.PI) % 360),
        explode: Math.round(s.explodeProgress * 100),
      });

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Camera focal distance
      const D = 460;
      const cosY = Math.cos(s.yaw);
      const sinY = Math.sin(s.yaw);
      const cosX = Math.cos(s.pitch);
      const sinX = Math.sin(s.pitch);

      interface ProjectedFace {
        points: { x: number; y: number }[];
        avgZ: number;
        color: string;
        wireColor: string;
        isGlass: boolean;
        intensity: number;
      }

      const projectedFaces: ProjectedFace[] = [];

      // Transform all elements
      geometryRef.current.forEach((group) => {
        const explodeZ = group.zExplodeOffset * s.explodeProgress;

        // Transform vertices
        const transVerts = group.vertices.map((v) => {
          const ez = v.z + explodeZ;

          // Yaw rotation (Y axis)
          const x1 = v.x * cosY + ez * sinY;
          const z1 = -v.x * sinY + ez * cosY;

          // Pitch rotation (X axis)
          const y2 = v.y * cosX - z1 * sinX;
          const z2 = v.y * sinX + z1 * cosX;

          // Perspective projection
          const p = D / Math.max(120, D + z2 + 80);
          return {
            px: cx + x1 * p,
            py: cy + y2 * p,
            z2,
          };
        });

        // Build faces
        group.faces.forEach((f) => {
          const pts = f.indices.map((idx) => ({
            x: transVerts[idx].px,
            y: transVerts[idx].py,
          }));

          const avgZ =
            f.indices.reduce((sum, idx) => sum + transVerts[idx].z2, 0) /
            f.indices.length;

          // Calculate surface normal for flat shading
          let intensity = 0.7;
          if (f.indices.length >= 3) {
            const v0 = group.vertices[f.indices[0]];
            const v1 = group.vertices[f.indices[1]];
            const v2 = group.vertices[f.indices[2]];
            const ax = v1.x - v0.x;
            const ay = v1.y - v0.y;
            const az = v1.z - v0.z;
            const bx = v2.x - v0.x;
            const by = v2.y - v0.y;
            const bz = v2.z - v0.z;
            let nx = ay * bz - az * by;
            let ny = az * bx - ax * bz;
            let nz = ax * by - ay * bx;
            const nlen = Math.hypot(nx, ny, nz) || 1;
            nx /= nlen;
            ny /= nlen;
            nz /= nlen;

            // Rotate normal
            const rnx = nx * cosY + nz * sinY;
            const rnz1 = -nx * sinY + nz * cosY;
            const rny = ny * cosX - rnz1 * sinX;
            const rnz = ny * sinX + rnz1 * cosX;

            const dot = Math.max(0.15, rnx * lightDir.x + rny * lightDir.y + rnz * lightDir.z);
            intensity = 0.3 + dot * 0.7;
          }

          let fillColor = f.color;
          let strokeColor = f.wireColor;

          if (colorTheme === "blueprint") {
            fillColor = f.isGlass ? "rgba(40, 160, 240, 0.3)" : "rgba(10, 30, 60, 0.75)";
            strokeColor = "rgba(80, 200, 255, 0.85)";
          } else if (colorTheme === "chrome") {
            fillColor = f.isGlass ? "rgba(220, 230, 255, 0.3)" : "rgba(35, 35, 40, 0.85)";
            strokeColor = "rgba(200, 215, 235, 0.8)";
          }

          projectedFaces.push({
            points: pts,
            avgZ,
            color: fillColor,
            wireColor: strokeColor,
            isGlass: !!f.isGlass,
            intensity,
          });
        });
      });

      // Painter's algorithm: sort faces from back to front
      projectedFaces.sort((a, b) => b.avgZ - a.avgZ);

      // Draw Center Laser Axis Line in exploded view
      if (s.explodeProgress > 0.05) {
        ctx.save();
        ctx.strokeStyle = "rgba(212, 163, 89, 0.4)";
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.5;
        const frontZ = 280 * s.explodeProgress;
        const backZ = -90 * s.explodeProgress;

        const p1 = projectSimple(0, 0, backZ, cx, cy, cosY, sinY, cosX, sinX, D);
        const p2 = projectSimple(0, 0, frontZ, cx, cy, cosY, sinY, cosX, sinX, D);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      }

      // Render sorted faces
      projectedFaces.forEach((face) => {
        if (face.points.length < 3) return;

        ctx.beginPath();
        ctx.moveTo(face.points[0].x, face.points[0].y);
        for (let i = 1; i < face.points.length; i++) {
          ctx.lineTo(face.points[i].x, face.points[i].y);
        }
        ctx.closePath();

        ctx.save();
        ctx.fillStyle = face.color;
        ctx.globalAlpha = face.intensity;
        ctx.fill();

        ctx.strokeStyle = face.wireColor;
        ctx.lineWidth = face.isGlass ? 1.5 : 1;
        ctx.globalAlpha = face.isGlass ? 0.95 : 0.65;
        ctx.stroke();
        ctx.restore();
      });

      // Render Shutter Camera Flash
      if (s.flashOpacity > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${s.flashOpacity})`;
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [colorTheme, isDragging]);

  // Helper for simple point projection
  const projectSimple = (
    x: number,
    y: number,
    z: number,
    cx: number,
    cy: number,
    cosY: number,
    sinY: number,
    cosX: number,
    sinX: number,
    D: number,
  ) => {
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    const p = D / Math.max(120, D + z2 + 80);
    return { x: cx + x1 * p, y: cy + y2 * p };
  };

  // ── Anime.js: Explode / Assemble 3D Elements ───────────────────────────────
  const toggleExplode = () => {
    const next = !isExploded;
    setIsExploded(next);

    const s = stateRef.current;
    s.autoRotate = false;

    // Use Anime.js to smoothly slide optical elements apart along Z-axis
    animate(s, {
      explodeProgress: next ? 1 : 0,
      duration: 1350,
      ease: next ? "outElastic(1, 0.55)" : "outExpo",
      onComplete: () => {
        if (!next) s.autoRotate = true;
      },
    });
  };

  // ── Anime.js: Trigger Shutter Flash & Aperture Snap ────────────────────────
  const triggerShutter = () => {
    setShutterFired(true);
    const s = stateRef.current;

    // Anime.js timeline: flash burst + aperture blade snap
    animate(s, {
      flashOpacity: [0, 0.92, 0],
      duration: 380,
      ease: "outQuad",
      onComplete: () => setShutterFired(false),
    });

    animate(s, {
      pitch: [s.pitch, s.pitch - 0.08, s.pitch],
      duration: 280,
      ease: "outQuad",
    });
  };

  // ── Mouse Drag 3D Orbit Handlers ───────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    stateRef.current.autoRotate = false;
    stateRef.current.lastMouseX = e.clientX;
    stateRef.current.lastMouseY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const s = stateRef.current;
    const dx = e.clientX - s.lastMouseX;
    const dy = e.clientY - s.lastMouseY;
    s.lastMouseX = e.clientX;
    s.lastMouseY = e.clientY;

    s.yaw += dx * 0.01;
    s.pitch = Math.max(-1.1, Math.min(1.1, s.pitch - dy * 0.01));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const reset3D = () => {
    const s = stateRef.current;
    s.autoRotate = false;
    animate(s, {
      yaw: -0.38,
      pitch: 0.24,
      explodeProgress: 0,
      duration: 800,
      ease: "outExpo",
      onComplete: () => {
        setIsExploded(false);
        s.autoRotate = true;
      },
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative z-20 mx-auto max-w-7xl px-6 py-20 md:py-28 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-gold/5 blur-[160px]" />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
        <Eyebrow>Anatomy of our craft</Eyebrow>
        <h2 className="mt-3 font-display text-3xl md:text-5xl font-light text-foreground tracking-tight">
          Every story begins inside the glass.
        </h2>
        <p className="mt-4 text-xs md:text-sm text-muted-foreground max-w-xl font-light leading-relaxed">
          Drag to orbit our 35mm rangefinder camera in 360°. Click{" "}
          <span className="text-gold font-medium">Explode Optical Elements</span> to pull apart
          the 8-group lens barrel in real-time 3D, driven by Anime.js.
        </p>
      </div>

      {/* 3D Canvas Stage */}
      <div className="relative z-10 w-full h-[540px] md:h-[620px] rounded-xl border border-border/70 bg-gradient-to-b from-card/85 via-background to-card/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col justify-between p-4 md:p-6 select-none">
        {/* Top Telemetry HUD */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3 text-[10px] font-mono tracking-widest text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-gold font-semibold">
              <Camera className="size-3.5 text-gold" />
              UTSAV SPEC-35
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="hidden sm:inline">50MM f/1.2 PRIME</span>
          </div>

          <div className="flex items-center gap-4 text-[9px]">
            <span>
              YAW: <strong className="text-foreground">{hudStats.yaw}°</strong>
            </span>
            <span>
              PITCH: <strong className="text-foreground">{hudStats.pitch}°</strong>
            </span>
            <span className="text-gold">
              DISASSEMBLY: <strong>{hudStats.explode}%</strong>
            </span>
          </div>
        </div>

        {/* The 3D Interactive Canvas */}
        <div
          className="relative flex-1 cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{ touchAction: "none" }}
          />

          {/* Center hint text */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 border border-border text-[9px] font-mono tracking-wider text-muted-foreground backdrop-blur-sm">
            <span>⟲ CLICK &amp; DRAG TO ORBIT 360°</span>
          </div>
        </div>

        {/* Bottom Interactive Controls Bar */}
        <div className="relative z-20 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
          {/* Main Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleExplode}
              className={`flex items-center gap-2 px-4 py-2 rounded border text-xs font-mono tracking-wider transition-all duration-300 ${
                isExploded
                  ? "bg-gold text-background border-gold font-bold shadow-[0_0_20px_rgba(212,163,89,0.4)]"
                  : "bg-card hover:bg-gold/15 text-gold border-gold/60"
              }`}
            >
              {isExploded ? <Minimize2 className="size-3.5" /> : <Layers className="size-3.5" />}
              <span>{isExploded ? "ASSEMBLE CAMERA" : "EXPLODE 3D ELEMENTS"}</span>
            </button>

            <button
              type="button"
              onClick={triggerShutter}
              className="flex items-center gap-2 px-3.5 py-2 rounded bg-card hover:bg-card/80 text-foreground border border-border text-xs font-mono tracking-wider transition-colors"
            >
              <Sparkles className="size-3.5 text-gold" />
              <span>SNAP SHUTTER</span>
            </button>

            <button
              type="button"
              onClick={reset3D}
              className="flex items-center justify-center size-8 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
              title="Reset 3D Orientation"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>

          {/* Color Blueprint Theme Toggles */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-muted-foreground mr-1 hidden sm:inline">SCHEME:</span>
            {(["gold", "blueprint", "chrome"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setColorTheme(t)}
                className={`px-2.5 py-1 rounded uppercase text-[9px] transition-colors border ${
                  colorTheme === t
                    ? "bg-gold/20 text-gold border-gold/70 font-semibold"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
