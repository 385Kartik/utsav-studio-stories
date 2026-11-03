"use client";

import { useRef, useState, type MouseEvent } from "react";
import { animate } from "animejs";
import { Sparkles, RotateCw, Aperture, Camera } from "lucide-react";

interface Crazy3DCardProps {
  src: string;
  title: string;
  category: string;
  frameNumber?: string;
  className?: string;
  aspect?: string;
  onClick?: () => void;
  showBadge?: boolean;
}

/**
 * Crazy3DCard
 * ────────────
 * Full 3D Album Card:
 * 1. "Card band ho" — Two 3D golden shutter doors fold shut over the photo.
 * 2. "Rotate ho" — The entire card elevates in 3D (+80px) and spins a full 360° with gold specular glare.
 * 3. Camera shutter flash burst on snap.
 * 4. Flip to authentic darkroom studio back face with lens & camera metadata.
 */
export function Crazy3DCard({
  src,
  title,
  category,
  frameNumber = "FRAME #01",
  className = "",
  aspect = "aspect-[3/4]",
  onClick,
  showBadge = true,
}: Crazy3DCardProps) {
  const cardRootRef = useRef<HTMLDivElement>(null);
  const cardRotatorRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ── 3D Mouse Parallax Tilt ──────────────────────────────────────────
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isAnimating) return;
    const root = cardRootRef.current;
    const rotator = cardRotatorRef.current;
    if (!root || !rotator) return;

    const rect = root.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -14;
    const rotY = ((x - centerX) / centerX) * 14;

    rotator.style.transform = `rotateX(${rotX}deg) rotateY(${rotY + (isFlipped ? 180 : 0)}deg) translateZ(10px)`;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isAnimating) return;
    const rotator = cardRotatorRef.current;
    if (!rotator) return;

    animate(rotator, {
      rotateX: 0,
      rotateY: isFlipped ? 180 : 0,
      translateZ: 0,
      duration: 650,
      ease: "outElastic(1, 0.5)",
    });
  };

  // ── Crazy 3D Fold & Spin Sequence ("Card band ho, rotate ho") ───────
  const trigger3DFoldAndSpin = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (isAnimating) return;
    setIsAnimating(true);

    const rotator = cardRotatorRef.current;
    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    const seal = sealRef.current;
    const flash = flashRef.current;
    const shine = shineRef.current;

    if (!rotator || !leftDoor || !rightDoor) {
      setIsAnimating(false);
      return;
    }

    // Phase 1: Doors fold shut ("Card band ho")
    animate(leftDoor, {
      rotateY: ["-95deg", "0deg"],
      duration: 380,
      ease: "outCubic",
    });

    animate(rightDoor, {
      rotateY: ["95deg", "0deg"],
      duration: 380,
      ease: "outCubic",
    });

    if (seal) {
      animate(seal, {
        scale: [0, 1.2, 1],
        opacity: [0, 1],
        delay: 240,
        duration: 260,
        ease: "outBack",
      });
    }

    // Phase 2: Card elevates & rotates 360° ("Rotate ho")
    setTimeout(() => {
      // 3D spin + lift
      animate(rotator, {
        translateZ: [0, 90, 0],
        rotateY: [isFlipped ? 180 : 0, isFlipped ? 540 : 360],
        rotateX: [0, 14, 0],
        duration: 900,
        ease: "inOutBack",
      });

      // Glare shine streak passes across surface
      if (shine) {
        animate(shine, {
          translateX: ["-120%", "220%"],
          opacity: [0, 0.7, 0],
          duration: 750,
          delay: 150,
          ease: "easeOutQuad",
        });
      }
    }, 420);

    // Phase 3: Shutter Flash & Doors re-open ("Maza aa jaaye waisa")
    setTimeout(() => {
      // Shutter flash
      if (flash) {
        animate(flash, {
          opacity: [0, 0.95, 0],
          duration: 320,
          ease: "outQuad",
        });
      }

      // Hide seal
      if (seal) {
        animate(seal, {
          scale: 0,
          opacity: 0,
          duration: 200,
          ease: "inQuad",
        });
      }

      // Doors swing back open
      animate(leftDoor, {
        rotateY: "-95deg",
        duration: 480,
        ease: "outElastic(1, 0.45)",
      });

      animate(rightDoor, {
        rotateY: "95deg",
        duration: 480,
        ease: "outElastic(1, 0.45)",
      });

      setTimeout(() => {
        setIsAnimating(false);
      }, 550);
    }, 1350);
  };

  // Flip toggle between front (photo) and back (studio darkroom archive)
  const toggleFlip = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (isAnimating) return;
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);

    const rotator = cardRotatorRef.current;
    if (rotator) {
      animate(rotator, {
        rotateY: nextFlipped ? 180 : 0,
        translateZ: [0, 45, 0],
        duration: 750,
        ease: "outElastic(1, 0.55)",
      });
    }
  };

  return (
    <div
      ref={cardRootRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative select-none ${className}`}
      style={{ perspective: "1200px" }}
      data-gallery-card
    >
      {/* 3D Rotator Container */}
      <div
        ref={cardRotatorRef}
        className="relative w-full h-full will-change-transform rounded-lg"
        style={{
          transformStyle: "preserve-3d",
          transition: isAnimating ? "none" : "box-shadow 0.3s ease",
        }}
      >
        {/* ──────────────────────────────────────────────────────────── */}
        {/* FRONT FACE: The Photograph + 3D Folding Shutter Doors         */}
        {/* ──────────────────────────────────────────────────────────── */}
        <div
          className="relative w-full h-full rounded-lg bg-card border border-border/80 shadow-2xl overflow-hidden flex flex-col p-2"
          style={{
            backfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Top Vintage Film Strip Header */}
          <div className="flex items-center justify-between pb-1 px-1 text-[8px] font-mono tracking-widest text-muted-foreground border-b border-border/60">
            <span className="flex items-center gap-1">
              <Camera className="size-2.5 text-gold" />
              {frameNumber}
            </span>
            <span className="text-gold font-semibold">• 35MM CINEMA</span>
          </div>

          {/* Photo Canvas Area */}
          <div className={`relative w-full ${aspect} mt-1.5 rounded overflow-hidden bg-black/40`}>
            <img
              src={src}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />

            {/* Specular glare sweep during 3D spin */}
            <div
              ref={shineRef}
              className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 will-change-transform"
              style={{ width: "60%" }}
            />

            {/* Camera Flash Burst */}
            <div
              ref={flashRef}
              className="pointer-events-none absolute inset-0 bg-white opacity-0 z-30"
            />

            {/* ── 3D FOLDING SHUTTER DOORS ("Card band ho") ──────── */}
            {/* Left Door */}
            <div
              ref={leftDoorRef}
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 border-r border-gold/40 z-20 flex flex-col items-end justify-center pr-3 shadow-2xl"
              style={{
                transformOrigin: "left center",
                transform: "rotateY(-95deg)",
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="border border-gold/40 rounded p-1.5 bg-black/60 text-right">
                <span className="font-display text-[9px] uppercase tracking-widest text-gold block">
                  UTSAV
                </span>
                <span className="font-mono text-[7px] tracking-wider text-muted-foreground block">
                  EST. 1994
                </span>
              </div>
            </div>

            {/* Right Door */}
            <div
              ref={rightDoorRef}
              className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-neutral-950 via-neutral-900 to-neutral-800 border-l border-gold/40 z-20 flex flex-col items-start justify-center pl-3 shadow-2xl"
              style={{
                transformOrigin: "right center",
                transform: "rotateY(95deg)",
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="border border-gold/40 rounded p-1.5 bg-black/60 text-left">
                <span className="font-display text-[9px] uppercase tracking-widest text-gold block">
                  STUDIO
                </span>
                <span className="font-mono text-[7px] tracking-wider text-muted-foreground block">
                  MIRA ROAD
                </span>
              </div>
            </div>

            {/* Center Golden Seal that locks when shut */}
            <div
              ref={sealRef}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 size-12 rounded-full border-2 border-gold bg-black/90 shadow-[0_0_20px_rgba(212,163,89,0.7)] flex flex-col items-center justify-center text-center scale-0"
            >
              <Aperture className="size-4 text-gold animate-spin" style={{ animationDuration: "6s" }} />
              <span className="font-mono text-[6px] tracking-widest text-gold uppercase mt-0.5">
                SEALED
              </span>
            </div>

            {/* Interactive "3D FOLD & SPIN" Button */}
            {showBadge && (
              <button
                type="button"
                onClick={trigger3DFoldAndSpin}
                className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 hover:bg-gold hover:text-background text-gold border border-gold/60 backdrop-blur-md shadow-lg transition-all duration-300 transform active:scale-95 text-[9px] font-mono tracking-wider"
                title="Click for 3D Fold & Spin Animation"
              >
                <RotateCw className={`size-3 ${isAnimating ? "animate-spin" : ""}`} />
                <span>3D FOLD</span>
              </button>
            )}

            {/* Flip to Back Button */}
            <button
              type="button"
              onClick={toggleFlip}
              className="absolute top-2 right-2 z-10 flex items-center justify-center size-6 rounded-full bg-black/70 hover:bg-gold hover:text-black text-gold/80 border border-gold/40 backdrop-blur-md transition-colors"
              title="Flip to Studio Specs"
            >
              <Sparkles className="size-3" />
            </button>
          </div>

          {/* Card Footer */}
          <div className="pt-1.5 px-1 flex justify-between items-center text-[10px]">
            <span className="font-display text-foreground truncate font-medium">
              {title}
            </span>
            <span className="font-mono text-[9px] text-gold/80 shrink-0 ml-1">
              {category}
            </span>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* BACK FACE: Vintage Darkroom Studio Print Archive              */}
        {/* ──────────────────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 w-full h-full rounded-lg bg-neutral-950 border-2 border-gold/60 shadow-2xl p-3 flex flex-col justify-between overflow-hidden"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Subtle gold foil grid pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(212,163,89,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,163,89,0.3) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          {/* Top Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-gold/30 pb-2">
            <div>
              <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-gold block">
                UTSAV STUDIO ARCHIVE
              </span>
              <span className="font-display text-xs text-foreground/90 font-light">
                Vintage Proof Sheet
              </span>
            </div>
            <button
              type="button"
              onClick={toggleFlip}
              className="px-2 py-0.5 rounded text-[8px] font-mono text-gold border border-gold/40 hover:bg-gold hover:text-black transition-colors"
            >
              ← PHOTO
            </button>
          </div>

          {/* Middle Specs & Seal */}
          <div className="relative z-10 my-auto space-y-2 py-2">
            <div className="flex items-center justify-center my-1">
              <div className="size-16 rounded-full border border-dashed border-gold/70 flex flex-col items-center justify-center p-2 text-center bg-gold/5 shadow-[0_0_15px_rgba(212,163,89,0.2)]">
                <Aperture className="size-5 text-gold mb-0.5" />
                <span className="font-mono text-[6px] tracking-widest text-gold uppercase">
                  MASTER PROOF
                </span>
                <span className="font-mono text-[5px] text-muted-foreground">1994-2024</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[8px] font-mono">
              <div className="p-1 rounded bg-white/5 border border-white/10">
                <span className="text-muted-foreground block text-[7px]">LENS</span>
                <span className="text-foreground">50mm f/1.2 Prime</span>
              </div>
              <div className="p-1 rounded bg-white/5 border border-white/10">
                <span className="text-muted-foreground block text-[7px]">SHUTTER</span>
                <span className="text-foreground">1/250s at ISO 100</span>
              </div>
              <div className="p-1 rounded bg-white/5 border border-white/10">
                <span className="text-muted-foreground block text-[7px]">EMULSION</span>
                <span className="text-foreground">Portra 400 Cine</span>
              </div>
              <div className="p-1 rounded bg-white/5 border border-white/10">
                <span className="text-muted-foreground block text-[7px]">LOCATION</span>
                <span className="text-foreground">Mira Road East</span>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="relative z-10 pt-2 border-t border-gold/30 flex items-center justify-between">
            <span className="font-mono text-[7px] text-muted-foreground">
              AUTHENTIC CANDID FILM
            </span>
            <button
              type="button"
              onClick={trigger3DFoldAndSpin}
              className="flex items-center gap-1 text-[8px] font-mono text-gold hover:underline"
            >
              <RotateCw className="size-2.5" />
              <span>3D REVOLVE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
