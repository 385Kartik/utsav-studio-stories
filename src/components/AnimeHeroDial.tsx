"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { animate } from "animejs";
import { Play, Pause, RotateCcw, Sparkles } from "lucide-react";

/**
 * AnimeHeroDial
 * ──────────────
 * The iconic animejs.com circular HUD speedometer / aperture dial:
 * • 4 glowing neon segmented arcs (Coral, Amber, Emerald, Cyan)
 * • 360° calibrated precision graduation ticks
 * • Dynamic tracing sweep arcs powered by Anime.js
 * • Center interactive cinematic wave & aperture iris
 * • 3D mouse velocity tilt
 * • Interactive timeline scrubber
 */

export function AnimeHeroDial({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<SVGCircleElement>(null);
  const wavePathRef = useRef<SVGPathElement>(null);
  const [scrubberVal, setScrubberVal] = useState(0.45);
  const [isPlaying, setIsPlaying] = useState(true);

  // 3D Tilt on mouse move
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / (rect.height / 2)) * -14;
    const rotY = (x / (rect.width / 2)) * 14;

    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  };

  const handleMouseLeave = () => {
    const el = containerRef.current;
    if (!el) return;
    animate(el, {
      rotateX: 0,
      rotateY: 0,
      duration: 700,
      ease: "outElastic(1, 0.5)",
    });
  };

  // ── Anime.js: Dynamic Wave & Sweep Tracer ───────────────────────────
  useEffect(() => {
    let animId: number;
    let t = 0;

    const updateWave = () => {
      t += 0.04;
      const path = wavePathRef.current;
      if (path) {
        // Generate dynamic sin/cos optical wave in the center
        const points: string[] = [];
        const width = 240;
        const cy = 120;
        const amp = 28 * (0.4 + scrubberVal * 0.8);
        const freq = 0.035;

        for (let x = 0; x <= width; x += 4) {
          const y = cy + Math.sin(x * freq + t) * Math.cos(x * 0.015 - t * 0.5) * amp;
          points.push(`${x === 0 ? "M" : "L"} ${x} ${y.toFixed(2)}`);
        }
        path.setAttribute("d", points.join(" "));
      }
      animId = requestAnimationFrame(updateWave);
    };

    if (isPlaying) {
      animId = requestAnimationFrame(updateWave);
    }

    // Continuous sweep tracer rotation
    const sweep = sweepRef.current;
    let sweepAnim: ReturnType<typeof animate> | null = null;
    if (sweep) {
      sweepAnim = animate(sweep, {
        rotate: [0, 360],
        duration: 8000,
        loop: true,
        ease: "linear",
      });
    }

    return () => {
      cancelAnimationFrame(animId);
      sweepAnim?.pause();
    };
  }, [isPlaying, scrubberVal]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D Dial Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative size-[340px] md:size-[440px] flex items-center justify-center will-change-transform transition-transform duration-100"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Ambient Backlight Glow */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-gold/15 via-red-500/10 to-cyan-500/10 blur-[60px] pointer-events-none" />

        {/* ── Main SVG Radar Dial ────────────────────────────────────── */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-[0_0_25px_rgba(212,163,89,0.2)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="neonRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d4d" />
              <stop offset="100%" stopColor="#ff7849" />
            </linearGradient>
            <linearGradient id="neonAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d4a359" />
            </linearGradient>
            <linearGradient id="neonEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06d6a0" />
            </linearGradient>
            <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* 1. Outer Inactive Track Ring */}
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-white/10"
          />

          {/* 2. Four Glowing Colored Quadrant Arcs (The animejs.com signature!) */}
          {/* Quadrant 1: Top Right - Red */}
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke="url(#neonRed)"
            strokeWidth="4"
            strokeDasharray="260 840"
            strokeDashoffset="-20"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 8px #ff4d4d)" }}
          />

          {/* Quadrant 2: Bottom Right - Amber */}
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke="url(#neonAmber)"
            strokeWidth="4"
            strokeDasharray="250 850"
            strokeDashoffset="-295"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 8px #f59e0b)" }}
          />

          {/* Quadrant 3: Bottom Left - Cyan */}
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke="url(#neonCyan)"
            strokeWidth="4"
            strokeDasharray="250 850"
            strokeDashoffset="-565"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }}
          />

          {/* Quadrant 4: Top Left - Emerald */}
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke="url(#neonEmerald)"
            strokeWidth="4"
            strokeDasharray="250 850"
            strokeDashoffset="-835"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 8px #10b981)" }}
          />

          {/* 3. Concentric 360° Graduation Ticks */}
          {Array.from({ length: 90 }).map((_, i) => {
            const angle = (i * 4 * Math.PI) / 180;
            const r1 = i % 5 === 0 ? 154 : 160;
            const r2 = 168;
            const x1 = Math.round((200 + Math.cos(angle) * r1) * 100) / 100;
            const y1 = Math.round((200 + Math.sin(angle) * r1) * 100) / 100;
            const x2 = Math.round((200 + Math.cos(angle) * r2) * 100) / 100;
            const y2 = Math.round((200 + Math.sin(angle) * r2) * 100) / 100;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
                className={i % 5 === 0 ? "text-gold/70" : "text-white/20"}
              />
            );
          })}

          {/* 4. Sweeping Tracer Arc */}
          <circle
            ref={sweepRef}
            cx="200"
            cy="200"
            r="142"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="2.5"
            strokeDasharray="70 800"
            strokeLinecap="round"
            style={{
              transformOrigin: "200px 200px",
              filter: "drop-shadow(0 0 10px var(--gold))",
            }}
          />

          {/* 5. Inner Viewport Bezel */}
          <circle
            cx="200"
            cy="200"
            r="125"
            fill="#0f0f12"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/15"
          />

          {/* Grid lines inside viewport */}
          <line x1="80" y1="200" x2="320" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="200" y1="80" x2="200" y2="320" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* ── Center Kinetic Animation Layer ───────────────────────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Dynamic Audio/Light Wave */}
          <div className="w-[240px] h-[120px] flex items-center justify-center">
            <svg viewBox="0 0 240 240" className="w-full h-full overflow-visible">
              <path
                ref={wavePathRef}
                fill="none"
                stroke="url(#neonRed)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 12px #ff4d4d)" }}
              />
            </svg>
          </div>

          {/* Central Telemetry readout */}
          <div className="absolute bottom-20 flex flex-col items-center font-mono text-[9px] tracking-widest text-gold uppercase">
            <span>35MM PRIME · f/1.2</span>
            <span className="text-[7px] text-muted-foreground mt-0.5">OPTICAL RESONANCE</span>
          </div>
        </div>
      </div>

      {/* ── Anime.js Iconic Ticker Scrubber Below Dial ──────────────── */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <div
          className="relative w-72 md:w-88 h-10 rounded-lg bg-black/85 border border-white/20 backdrop-blur-md px-3 flex items-center cursor-ew-resize select-none shadow-2xl"
          onMouseDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const update = (moveE: globalThis.MouseEvent) => {
              const val = Math.max(0, Math.min(1, (moveE.clientX - rect.left) / rect.width));
              setScrubberVal(val);
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
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-xs bg-[#ff3344] shadow-[0_0_12px_#ff3344] pointer-events-none transition-all duration-75"
            style={{
              left: `calc(${scrubberVal * 100}% - 3px)`,
            }}
          />
        </div>

        <span className="font-mono text-[8px] tracking-widest uppercase text-muted-foreground">
          DRAG SCRUBBER TO MODULATE OPTICAL FREQUENCY
        </span>
      </div>
    </div>
  );
}
