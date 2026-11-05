import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { animate, stagger, scrambleText, createTimeline } from "animejs";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Eyebrow, OutlineButton } from "@/components/buttons";
import { Crazy3DCard } from "@/components/Crazy3DCard";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

let registered = false;
export function ensureGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

/* The only place gsap/ScrollTrigger is imported: other modules call these
 * helpers so the plugin never crosses a chunk boundary as an import binding. */
export function refreshScrollTriggers() {
  ensureGsap();
  ScrollTrigger.refresh();
}


/* ------------------------------------------------------------------ */
/* Smooth scroll (Lenis) wired into the GSAP ticker                    */
/* ------------------------------------------------------------------ */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    ensureGsap();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/* Custom cursor â€” a ring that grows over interactive elements         */
/* ------------------------------------------------------------------ */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    ensureGsap();
    document.documentElement.classList.add("cursor-native-none");
    const el = ref.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const hit = (e.target as HTMLElement).closest("a, button, [data-cursor]");
      el.dataset["active"] = hit ? "true" : "false";
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.classList.remove("cursor-native-none");
    };
  }, []);

  return (
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-[130] hidden [@media(pointer:fine)]:block">
      <div
        data-cursor-ring
        className="flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/80 transition-all duration-300 data-[active=true]:scale-[2.2] data-[active=true]:bg-gold/15 data-[active=true]:backdrop-blur-[2px]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal â€” fades/slides children in when they enter the viewport      */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  className,
  y = 48,
  delay = 0,
  duration = 1.1,
  style,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        y,
        opacity: 0,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [y, delay, duration]);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimatedTitle â€” word-by-word masked reveal for display headlines    */
/* ------------------------------------------------------------------ */
export function AnimatedTitle({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = text.split(" ");
  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll("[data-word-inner]"), {
        yPercent: 115,
        duration: 1.2,
        delay,
        ease: "power4.out",
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [text, delay]);

  return (
    <span ref={ref} className={className} aria-label={text} role="text">
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom"
        >
          <span data-word-inner className="inline-block will-change-transform">
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* ImageReveal â€” shutter-style clip reveal on images                   */
/* ------------------------------------------------------------------ */
export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const ctx = gsap.context(() => {
      gsap.from(el, {
        clipPath: "inset(0 0 100% 0)",
        duration: 1.3,
        delay,
        ease: "power4.inOut",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
      gsap.from(el.firstElementChild, {
        scale: 1.25,
        duration: 1.6,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [delay]);
  return (
    <div ref={ref} className={className} style={{ willChange: "clip-path" }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ParallaxImage â€” image drifts as the page scrolls past it            */
/* ------------------------------------------------------------------ */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  speed = 8,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  speed?: number;
  eager?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    ensureGsap();
    const el = wrap.current!;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        img.current,
        { yPercent: -speed },
        {
          yPercent: speed,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [speed]);
  return (
    <div ref={wrap} className={`relative overflow-hidden ${className ?? ""}`}>
      <img
        ref={img}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        className={`absolute left-0 top-[-10%] h-[120%] w-full object-cover ${imgClassName ?? ""}`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic â€” element gently follows the pointer                       */
/* ------------------------------------------------------------------ */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * strength);
      yTo((e.clientY - r.top - r.height / 2) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [strength]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Counter â€” number counts up when scrolled into view                  */
/* ------------------------------------------------------------------ */
export function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: to,
        duration: 2.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${obj.v.toFixed(decimals)}${suffix}`;
        },
      });
    });
    return () => ctx.revert();
  }, [to, decimals, prefix, suffix]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* HorizontalScroll â€” pins a section and scrolls its track sideways    */
/* ------------------------------------------------------------------ */
export function HorizontalScroll({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsap();
    const section = sectionRef.current!;
    const track = trackRef.current!;
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="h-screen overflow-hidden">
      <div ref={trackRef} className="flex h-full items-center gap-[5vw] px-[6vw] will-change-transform">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee â€” endless CSS-driven ticker (content duplicated inside)     */
/* ------------------------------------------------------------------ */
export function Marquee({
  items,
  className,
  duration = 32,
  reverse = false,
  separator = "Â·",
}: {
  items: string[];
  className?: string;
  duration?: number;
  reverse?: boolean;
  separator?: string;
}) {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span>{item}</span>
          <span className="mx-6 text-gold md:mx-10" aria-hidden>
            {separator}
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden ${className ?? ""}`} aria-hidden>
      <div
        className="marquee-track"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : undefined,
          } as CSSProperties
        }
      >
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CurvedReelScrollExperience â€” Ref 1 Serpentine Wave + Ref 2 3D Reel  */
/* ------------------------------------------------------------------ */
export interface GalleryScrollItem {
  src: string;
  title: string;
  category: string;
}

export function CurvedReelScrollExperience({
  items,
  heroImage,
}: {
  items: GalleryScrollItem[];
  heroImage?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeMountRef = useRef<HTMLDivElement>(null);
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const cameraScreenRef = useRef<HTMLDivElement>(null);
  const capturedPhotoRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const serpentineStageRef = useRef<HTMLDivElement>(null);
  const serpentineTrackRef = useRef<HTMLDivElement>(null);
  const cylinderStageRef = useRef<HTMLDivElement>(null);
  const cylinderWrapperRef = useRef<HTMLDivElement>(null);
  const hudModeRef = useRef<HTMLSpanElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const aimReticleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsap();
    if (typeof window === "undefined" || !containerRef.current) return;

    const container = containerRef.current;
    const threeMount = threeMountRef.current;
    const heroWrap = heroWrapperRef.current;
    const heroBg = heroBgRef.current;
    const heroImg = heroImgRef.current;
    const heroText = heroTextRef.current;
    const cameraScreen = cameraScreenRef.current;
    const capturedPhoto = capturedPhotoRef.current;
    const stmt = statementRef.current;
    const serpStage = serpentineStageRef.current;
    const serpCards = serpentineTrackRef.current
      ? (Array.from(serpentineTrackRef.current.children) as HTMLElement[])
      : [];
    const cylStage = cylinderStageRef.current;
    const cylWrapper = cylinderWrapperRef.current;
    const cylCards = cylWrapper ? (Array.from(cylWrapper.children) as HTMLElement[]) : [];
    const flashEl = flashRef.current;
    const aimReticle = aimReticleRef.current;

    const ribbonCount = serpCards.length;
    const cylinderCount = cylCards.length;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let isMobile = width < 768;

    // ── Three.js Scene Setup ──────────────────────────────────────────
    const scene = new THREE.Scene();

    const threeCamera = new THREE.PerspectiveCamera(36, width / height, 0.01, 100);
    threeCamera.position.set(0, 0, 8.5);
    threeCamera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      precision: "mediump",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = false;

    if (threeMount) {
      threeMount.replaceChildren(renderer.domElement);
    }

    // ── Studio PBR Lighting & Environment ─────────────────────────────
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 3.5);
    keyLight.position.set(7, 9, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7ac4ff, 2.2);
    rimLight.position.set(-8, -4, -6);
    scene.add(rimLight);

    const goldFill = new THREE.DirectionalLight(0xd4a359, 2.4);
    goldFill.position.set(-5, 6, 4);
    scene.add(goldFill);

    // ── Master Camera Pivot ───────────────────────────────────────────
    const masterPivot = new THREE.Group();
    scene.add(masterPivot);

    // Screen Dimensions in 3D Model Units
    const screenW = 1.35;
    const screenH = 0.88;

    const lcdGroup = new THREE.Group();
    lcdGroup.position.set(0.0, -0.05, -1.04);
    lcdGroup.rotation.y = Math.PI;
    masterPivot.add(lcdGroup);

    // Titanium Screen Bezel
    const bezelGeom = new THREE.BoxGeometry(screenW + 0.10, screenH + 0.10, 0.035);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      metalness: 0.90,
      roughness: 0.24,
    });
    const bezelMesh = new THREE.Mesh(bezelGeom, bezelMat);
    bezelMesh.position.z = -0.015;
    lcdGroup.add(bezelMesh);

    // Deep Black Screen Mesh (Physical backing for DOM display)
    const screenGeom = new THREE.PlaneGeometry(screenW, screenH);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const screenMesh = new THREE.Mesh(screenGeom, screenMat);
    screenMesh.position.z = 0.018;
    lcdGroup.add(screenMesh);

    // ── GLTF & Draco Loader ───────────────────────────────────────────
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/gltf/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      "/assets/models/steampunk_camera.glb",
      (gltf) => {
        const raw = gltf.scene;
        const box = new THREE.Box3().setFromObject(raw);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        raw.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        raw.scale.setScalar(2.3 / maxDim);

        raw.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            if (m.material) {
              const mat = m.material as THREE.MeshStandardMaterial;
              mat.envMapIntensity = 1.7;
              mat.needsUpdate = true;
            }
          }
        });

        masterPivot.add(raw);
      },
      undefined,
      (err) => {
        console.warn("[CurvedReelScrollExperience] Failed to load steampunk_camera.glb:", err);
      }
    );

    // ── Screen Projection Math (Zero Allocation at 60fps) ─────────────
    const vCorner1 = new THREE.Vector3();
    const vCorner2 = new THREE.Vector3();
    const vCorner3 = new THREE.Vector3();
    const vCorner4 = new THREE.Vector3();

    const getScreenPixelBounds = () => {
      screenMesh.updateWorldMatrix(true, false);
      const m = screenMesh.matrixWorld;
      const hw = screenW / 2;
      const hh = screenH / 2;

      vCorner1.set(-hw, -hh, 0.01).applyMatrix4(m).project(threeCamera);
      vCorner2.set(hw, -hh, 0.01).applyMatrix4(m).project(threeCamera);
      vCorner3.set(hw, hh, 0.01).applyMatrix4(m).project(threeCamera);
      vCorner4.set(-hw, hh, 0.01).applyMatrix4(m).project(threeCamera);

      const corners = [vCorner1, vCorner2, vCorner3, vCorner4];

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const c of corners) {
        const px = ((c.x + 1) / 2) * width;
        const py = ((-c.y + 1) / 2) * height;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const w = Math.max(0, maxX - minX);
      const h = Math.max(0, maxY - minY);
      return { cx, cy, w, h };
    };

    // Dynamic screen dimensions tracked in real time
    let curScreenW = 600;
    let curScreenH = 400;

    const getSerpentinePoint = (t: number) => {
      const mWidth = curScreenW;
      const mHeight = curScreenH;

      // x: Center coordinate travels smoothly from right to left across camera screen
      // spanX is calibrated with card width for exactly 15% overlap
      const spanX = mWidth * 1.35;
      const x = mWidth * 1.175 - t * spanX;

      // y: Centered vertically in the camera screen with a gentle harmonic wave
      const waveY = Math.sin(t * Math.PI * 1.5) * (isMobile ? mHeight * 0.035 : mHeight * 0.045);
      const y = mHeight * 0.468 + waveY;

      // z: Focal peak in the center so the active card pops forward towards the user
      const centerFactor = Math.sin(Math.max(0, Math.min(1, t)) * Math.PI);
      const z = centerFactor * (isMobile ? 65 : 125) - 20;

      // Subtle dynamic camera rotation
      const angle = Math.cos(t * Math.PI * 1.4) * (isMobile ? -5 : -8);
      const tilt = Math.sin(t * Math.PI * 1.6) * (isMobile ? 3 : 5);

      return { x, y, z, angle, tilt, centerFactor };
    };

    // ── Mouse & Breathing Physics ─────────────────────────────────────
    const mouseState = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    let hasFlashed = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseState.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseState.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ── GSAP Scroll Trigger Timeline ──────────────────────────────────
    const ctx = gsap.context(() => {
      const motionState = { progress: 0 };

      const applyFrame = (p: number) => {
        // 1. Live HUD Telemetry Tag
        if (hudModeRef.current) {
          if (p < 0.28) {
            hudModeRef.current.textContent = "[LAST SHOT · CAPTURE REVIEW]";
          } else if (p >= 0.28 && p < 0.44) {
            hudModeRef.current.textContent = "[STUDIO STATEMENT · REC.709]";
          } else if (p >= 0.44 && p < 0.70) {
            hudModeRef.current.textContent = "[SERPENTINE REEL · 7 FRAMES]";
          } else {
            hudModeRef.current.textContent = "[STORIES CYLINDER · 8 FRAMES]";
          }
        }

        // 2. Hero Background Photo: Gradually darkens as camera approaches until full screen (0.00 -> 0.68)
        if (heroBg) {
          if (p <= 0.68) {
            const darkProgress = Math.min(1, Math.max(0, p / 0.68));
            // Eased gradual darkening: starts gentle, steadily deepens as camera zooms in
            const easedDark = Math.pow(darkProgress, 1.15);
            // Opacity starts at 0.45 and smoothly dims down to 0 at p = 0.68
            const bgOpacity = Math.max(0, 0.45 * (1 - easedDark));
            // Brightness gradually darkens from 1.0 down to 0.15
            const bgBrightness = Math.max(0.12, 1.0 - easedDark * 0.88);
            // Subtle cinematic background blur (depth of field) as camera approaches
            const bgBlur = darkProgress * 8;

            heroBg.style.opacity = String(bgOpacity);
            heroBg.style.filter = `brightness(${bgBrightness}) blur(${bgBlur}px)`;
            heroBg.style.visibility = "visible";

            if (heroImg) {
              heroImg.style.transform = `scale(${1.05 + darkProgress * 0.15}) translateY(${darkProgress * 30}px)`;
            }
          } else {
            heroBg.style.opacity = "0";
            heroBg.style.visibility = "hidden";
          }
        }

        // 3. Hero 3D Typography Page-Fold & Squeeze (0.00 -> 0.16)
        if (heroWrap) {
          if (p <= 0.16) {
            const norm = p / 0.16;
            const squeezeX = 1 - norm * 0.30;
            const squeezeY = 1 + norm * 0.10;
            const rotateX = norm * 42;
            const driftY = norm * -90;
            const opacity = Math.max(0, 1 - norm * 1.35);
            const blur = norm * 6;

            heroWrap.style.transform = `perspective(1200px) translate3d(0, ${driftY}px, ${-norm * 200}px) rotateX(${rotateX}deg) scale(${squeezeX}, ${squeezeY})`;
            heroWrap.style.opacity = String(opacity);
            heroWrap.style.filter = `blur(${blur}px)`;
            heroWrap.style.pointerEvents = opacity > 0.1 ? "auto" : "none";

            if (heroText) {
              heroText.style.letterSpacing = `${-norm * 4}px`;
            }
          } else {
            heroWrap.style.opacity = "0";
            heroWrap.style.pointerEvents = "none";
          }
        }

        // 3. Shutter Flash Burst (around p = 0.038 -> 0.075)
        if (p >= 0.038 && p <= 0.075 && !hasFlashed) {
          hasFlashed = true;
          if (flashEl) {
            flashEl.style.opacity = "0.95";
            setTimeout(() => {
              if (flashEl) flashEl.style.opacity = "0";
            }, 180);
          }
        } else if (p < 0.02) {
          hasFlashed = false;
        }

        // 4. Hero Aim Reticle (visible only when aiming forward)
        if (aimReticle) {
          if (p <= 0.05) {
            aimReticle.style.opacity = String(Math.max(0, 1 - p / 0.05));
          } else {
            aimReticle.style.opacity = "0";
          }
        }

        // 5. 3D Camera Movement & 180° Flip:
        //    "camara ko pass laate reh and camara ki screen pe hi sab chalna chahiye"
        const maxZ = isMobile ? 4.9 : Math.min(5.75, 5.2 + (width / 1440) * 0.55);

        let basePosY = 0;
        let basePosZ = 1.05;
        let baseRotY = 0;
        let baseRotX = 0;
        let baseScale = 0.68;
        let screenOpacity = 0;

        if (p <= 0.06) {
          // Hero state: Camera below headline aiming at scene
          basePosY = -1.35;
          basePosZ = 1.05;
          baseRotY = -0.08;
          baseRotX = 0.02;
          baseScale = 0.68;
          screenOpacity = 0;
        } else if (p > 0.06 && p <= 0.18) {
          // 180° flip & rise to center
          const norm = (p - 0.06) / 0.12;
          const eased = (1 - Math.cos(norm * Math.PI)) / 2;

          basePosY = -1.35 + eased * 1.30; // -1.35 -> -0.05
          basePosZ = 1.05 + eased * 1.05; // 1.05 -> 2.10
          baseRotY = -0.08 + eased * (Math.PI + 0.08); // -> PI
          baseRotX = 0.02 * (1 - eased);
          baseScale = 0.68 + eased * 0.27; // 0.68 -> 0.95

          // Back screen powers on when rotated sufficiently
          if (norm > 0.40) {
            screenOpacity = Math.min(1, (norm - 0.40) / 0.50);
          }
        } else {
          // "CAMARA KO PASS LAATE REH":
          // The camera stays facing the viewer (PI) and zooms forward closer and closer!
          // Zoom finishes 100% by p = 0.68 right as ribbon ends!
          const zoomNorm = Math.min(1, Math.max(0, (p - 0.18) / 0.50));
          const zoomEased = zoomNorm; // steady cinematic forward dolly

          basePosY = -0.05;
          basePosZ = 2.10 + zoomEased * (maxZ - 2.10);
          baseRotY = Math.PI;
          baseRotX = 0;
          baseScale = 0.95 + zoomEased * 0.32;
          screenOpacity = 1;
        }

        // Apply to masterPivot
        masterPivot.position.set(
          mouseState.x * 0.08,
          basePosY - mouseState.y * 0.06,
          basePosZ
        );
        masterPivot.rotation.set(
          baseRotX - mouseState.y * 0.035,
          baseRotY + mouseState.x * 0.04,
          0
        );
        masterPivot.scale.setScalar(baseScale);

        // 6. Camera Screen DOM Container Opacity
        if (cameraScreen) {
          cameraScreen.style.opacity = String(screenOpacity);
          cameraScreen.style.pointerEvents = screenOpacity > 0.5 ? "auto" : "none";
        }

        // 7. Layer A: Captured Wedding Photo Review (0.08 -> 0.30)
        if (capturedPhoto) {
          if (p >= 0.08 && p <= 0.30) {
            let photoOpacity = 1;
            const photoScale = 1.0 + (p - 0.08) * 0.18;
            if (p < 0.13) photoOpacity = (p - 0.08) / 0.05;
            else if (p > 0.25) photoOpacity = 1 - (p - 0.25) / 0.05;

            capturedPhoto.style.opacity = String(Math.max(0, Math.min(1, photoOpacity)));
            capturedPhoto.style.transform = `scale(${photoScale})`;
          } else {
            capturedPhoto.style.opacity = "0";
          }
        }

        // 8. Layer B: Studio Editorial Statement (0.28 -> 0.44)
        if (stmt) {
          if (p >= 0.28 && p <= 0.44) {
            let stmtOpacity = 1;
            if (p < 0.33) stmtOpacity = (p - 0.28) / 0.05;
            else if (p > 0.39) stmtOpacity = 1 - (p - 0.39) / 0.05;

            stmt.style.opacity = String(Math.max(0, stmtOpacity));
            stmt.style.transform = `translate3d(0, ${(0.35 - p) * 32}px, 0)`;
          } else {
            stmt.style.opacity = "0";
          }
        }

        // 9. Layer C: Serpentine Curved Ribbon of Photos (0.44 -> 0.69, 15% overlap)
        if (serpStage) {
          if (p >= 0.44 && p <= 0.69) {
            let ribbonOpacity = 1;
            if (p < 0.49) ribbonOpacity = (p - 0.44) / 0.05;
            else if (p > 0.64) ribbonOpacity = 1 - (p - 0.64) / 0.05;
            serpStage.style.opacity = String(Math.max(0, Math.min(1, ribbonOpacity)));

            const ribbonProgress = (p - 0.44) / 0.24;
            serpCards.forEach((card, idx) => {
              // 15% overlap between adjacent cards: spacing = 0.214
              const spacing = 0.214;
              // 1 wheel scroll step = 1 photo change!
              // Card idx is dead-center (cardT = 0.50) when ribbonProgress = idx / 6
              const cardT = 0.50 + (ribbonProgress - idx / 6) * (6 * spacing);
              const clampedT = Math.max(-0.35, Math.min(1.35, cardT));

              const pt = getSerpentinePoint(clampedT);
              const scale = (isMobile ? 0.95 : 1.05) + pt.centerFactor * 0.18;

              // Smooth fade at the screen edges
              let cardOpacity = 0;
              if (clampedT > 0 && clampedT < 1.0) {
                if (clampedT < 0.12) cardOpacity = clampedT / 0.12;
                else if (clampedT > 0.88) cardOpacity = (1.0 - clampedT) / 0.12;
                else cardOpacity = 1;
              }

              card.style.transform = `translate3d(${pt.x}px, ${pt.y}px, ${pt.z}px) translate(-50%, -50%) rotateZ(${pt.angle}deg) rotateX(${pt.tilt}deg) scale(${scale})`;
              card.style.opacity = String(cardOpacity);
              card.style.zIndex = String(Math.round(pt.z + 300));
            });
          } else {
            serpStage.style.opacity = "0";
          }
        }

        // 10. Layer D: 3D Cylindrical Story Reel (0.70 -> 0.98, full zoom & large photos)
        if (cylStage && cylWrapper) {
          if (p >= 0.70 && p <= 0.98) {
            let reelOpacity = 1;
            if (p < 0.74) reelOpacity = (p - 0.70) / 0.04;
            else if (p > 0.95) reelOpacity = 1 - (p - 0.95) / 0.03;
            cylStage.style.opacity = String(Math.max(0, Math.min(1, reelOpacity)));

            const cylinderCount = cylCards.length || 8;
            // Generous radius so large cards never intersect or collide
            const radius = isMobile ? 220 : Math.min(curScreenW * 0.48, 520);
            const reelNorm = (p - 0.70) / 0.25;
            // Rotate through cards: each wheel notch advances 45° (one full card!)
            const currentRot = reelNorm * 180;

            cylCards.forEach((card, idx) => {
              const baseAngle = (idx / cylinderCount) * 360;
              const cardDeg = baseAngle + currentRot;
              const rad = (cardDeg * Math.PI) / 180;
              const x = Math.sin(rad) * radius;
              const z = Math.cos(rad) * radius;

              card.style.transform = `translate3d(${x}px, 0px, ${z}px) translate(-50%, -50%) rotateY(${cardDeg}deg)`;

              // Only show cards on the front-facing arc (facing the camera)
              // Cards on the back half (z <= 0) smoothly fade out to 0 to prevent ghosting
              if (z > -radius * 0.05) {
                const normZ = Math.max(0, (z + radius * 0.05) / (radius * 1.05));
                const depthAlpha = Math.pow(normZ, 1.15);
                card.style.opacity = String(depthAlpha);
                card.style.visibility = "visible";
                card.style.pointerEvents = depthAlpha > 0.65 ? "auto" : "none";
              } else {
                card.style.opacity = "0";
                card.style.visibility = "hidden";
                card.style.pointerEvents = "none";
              }

              card.style.zIndex = String(Math.round(z + 500));
            });

            cylWrapper.style.transform = `rotateX(${isMobile ? 3 : 6}deg) rotateZ(-1deg)`;
          } else {
            cylStage.style.opacity = "0";
          }
        }
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          snap: {
            snapTo: (value) => {
              // 1. Serpentine Ribbon Stage (0.44 -> 0.69): 1 mouse wheel notch = 1 photo!
              if (value >= 0.43 && value <= 0.69) {
                const ribbonNorm = Math.max(0, Math.min(1, (value - 0.44) / 0.24));
                const step = Math.round(ribbonNorm * 6) / 6;
                return 0.44 + step * 0.24;
              }
              // 2. Cylinder Reel Stage (0.70 -> 0.98): 1 mouse wheel notch = 1 cylinder card!
              if (value >= 0.70 && value <= 0.98) {
                const cylNorm = Math.max(0, Math.min(1, (value - 0.70) / 0.25));
                const step = Math.round(cylNorm * 4) / 4;
                return 0.70 + step * 0.25;
              }
              return value;
            },
            duration: { min: 0.15, max: 0.35 },
            delay: 0.04,
            ease: "power2.out",
          },
          invalidateOnRefresh: true,
          onRefresh: () => {
            width = window.innerWidth;
            height = window.innerHeight;
            isMobile = width < 768;
            threeCamera.aspect = width / height;
            threeCamera.updateProjectionMatrix();
            renderer.setSize(width, height);
            applyFrame(motionState.progress);
          },
        },
      });

      tl.to(motionState, {
        progress: 1,
        ease: "none",
        duration: 1,
        onUpdate: () => {
          applyFrame(motionState.progress);
        },
      });

      // Initial frame setup
      applyFrame(0);

      // Kinetic typography reveals for Hero
      animate("[data-hero-badge]", {
        opacity: [0, 1],
        translateY: [10, 0],
        delay: 1800,
        duration: 700,
        ease: "outExpo",
      });

      const heroScrambleEl = container.querySelector<HTMLElement>("[data-hero-scramble]");
      if (heroScrambleEl) {
        heroScrambleEl.style.opacity = "1";
        animate(heroScrambleEl, {
          innerHTML: scrambleText({
            text: "Utsav Studio",
            chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ#@!%&",
            speed: 0.7,
            revealDelay: 200,
          }),
          delay: 1750,
          duration: 1400,
          ease: "linear",
        });
      }

      animate("[data-hero-line]", {
        scaleX: [0, 1],
        opacity: [0, 1],
        delay: 2600,
        duration: 700,
        ease: "outQuad",
      });

      animate("[data-hero-sub]", {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: 2750,
        duration: 700,
        ease: "outExpo",
      });
    }, container);

    // ── 60fps Animation Loop: Project Screen & Render ─────────────────
    let animId: number;

    const renderLoop = () => {
      // Pause Three.js GPU rendering when scrolled completely out of view
      const rect = container.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > window.innerHeight + 80) {
        animId = requestAnimationFrame(renderLoop);
        return;
      }

      // Smooth mouse lerp
      mouseState.x += (mouseState.targetX - mouseState.x) * 0.05;
      mouseState.y += (mouseState.targetY - mouseState.y) * 0.05;

      // Project 3D Screen to DOM Screen Bounds
      const bounds = getScreenPixelBounds();
      curScreenW = bounds.w;
      curScreenH = bounds.h;

      if (cameraScreen) {
        cameraScreen.style.width = `${bounds.w}px`;
        cameraScreen.style.height = `${bounds.h}px`;
        cameraScreen.style.left = `${bounds.cx}px`;
        cameraScreen.style.top = `${bounds.cy}px`;
        cameraScreen.style.transform = `translate(-50%, -50%)`;
      }

      renderer.render(scene, threeCamera);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    // Resize handler
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      isMobile = width < 768;
      threeCamera.aspect = width / height;
      threeCamera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      ctx.revert();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
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
      dracoLoader.dispose();
      if (threeMount && threeMount.contains(renderer.domElement)) {
        threeMount.removeChild(renderer.domElement);
      }
    };
  }, [items]);

  // Gallery items for ribbon (7 spaced hero cards) and cylinder (8 spacious 3D cards)
  const ribbonCards = Array.from({ length: 7 }).map((_, i) => items[i % items.length]);
  const cylinderCards = Array.from({ length: 8 }).map((_, i) => items[i % items.length]);

  return (
    <section ref={containerRef} data-hero-experience className="relative h-[380vh] md:h-[440vh] bg-background">
      <div
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center select-none"
        style={{ perspective: "1300px" }}
      >
        {/* Subtle cinematic backlight */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gold/5 blur-[140px]" />

        {/* Shutter Flash Burst Overlay */}
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 z-50 bg-white opacity-0 transition-opacity duration-150"
        />

        {/* Hero Golden Aim Reticle */}
        <div
          ref={aimReticleRef}
          className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 z-25 flex flex-col items-center gap-1.5 transition-opacity duration-100"
        >
          <div className="size-10 border border-gold/70 rounded flex items-center justify-center shadow-[0_0_12px_rgba(212,163,89,0.4)]">
            <span className="text-gold text-xs font-mono font-bold">+</span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-gold/80 bg-black/70 px-1.5 py-0.5 rounded border border-gold/30 uppercase">
            AF-AIM · FOCUS
          </span>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CINEMATIC HERO BACKGROUND PHOTO (Behind 3D Camera Stage)     */}
        {/* Dims gradually as the camera zooms in until full screen!      */}
        {/* ------------------------------------------------------------ */}
        {heroImage && (
          <div
            ref={heroBgRef}
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden will-change-transform"
          >
            <img
              ref={heroImgRef}
              src={heroImage}
              alt="A candid wedding moment photographed by Utsav Studio"
              className="w-full h-full object-cover scale-105 opacity-45 mix-blend-luminosity filter contrast-125 will-change-transform"
            />
            {/* Cinematic top and bottom edge vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STAGE 1: Hero Typography View with 3D Page-Fold & Squeeze    */}
        {/* ------------------------------------------------------------ */}
        <div
          ref={heroWrapperRef}
          className="absolute inset-0 z-15 flex flex-col items-center justify-center text-center p-6 will-change-transform pointer-events-none"
          style={{ transformOrigin: "center top", transformStyle: "preserve-3d" }}
        >
          <div ref={heroTextRef} className="relative z-10 flex flex-col items-center transition-all duration-75 will-change-transform pointer-events-auto">
            <p data-hero-badge className="mb-4 text-[11px] uppercase tracking-[0.6em] text-gold font-mono font-medium opacity-0">
              Mira Road East · Est. 1994
            </p>
            <h1 className="font-display text-[14vw] md:text-[9.5vw] font-light leading-[0.96] tracking-tight text-foreground">
              <span
                data-hero-scramble
                className="inline-block will-change-transform"
                style={{ opacity: 0 }}
                aria-label="Utsav Studio"
              >
                Utsav Studio
              </span>
            </h1>
            <span data-hero-line className="mt-6 h-px w-20 bg-gold/60 origin-center will-change-transform opacity-0" aria-hidden />
            <p data-hero-sub className="mt-6 text-xs uppercase tracking-[0.45em] text-muted-foreground font-light will-change-transform opacity-0">
              Photography &amp; Cinematography
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 3D CAMERA STAGE: WebGL Canvas holding the 3D Camera Body     */}
        {/* ------------------------------------------------------------ */}
        <div
          ref={threeMountRef}
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
        />

        {/* ------------------------------------------------------------ */}
        {/* 3D CAMERA SCREEN: Pinned 1:1 onto the Camera's Screen Mesh   */}
        {/* All chapters (Photo, Statement, Ribbon, Cylinder Reel)       */}
        {/* play directly inside the camera screen as it zooms closer!   */}
        {/* ------------------------------------------------------------ */}
        <div
          ref={cameraScreenRef}
          className="absolute z-20 rounded-xl md:rounded-2xl border border-white/10 bg-[#080706] overflow-hidden select-none will-change-transform shadow-[inset_0_0_40px_rgba(0,0,0,0.85)] opacity-0"
          style={{ transformStyle: "preserve-3d", containerType: "inline-size" }}
        >
          {/* ======================================================== */}
          {/* INSIDE CAMERA SCREEN: Captured Wedding Photo Review       */}
          {/* ======================================================== */}
          <div
            ref={capturedPhotoRef}
            className="absolute inset-0 z-10 overflow-hidden pointer-events-none opacity-0 will-change-transform"
          >
            {heroImage && (
              <img
                src={heroImage}
                alt="Captured wedding portrait"
                className="w-full h-full object-cover filter contrast-[1.08] brightness-[0.92]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

            {/* Autofocus Bracket directly locked on the happy couple */}
            <div className="absolute left-[36%] top-[46%] -translate-x-1/2 -translate-y-1/2 w-[clamp(20px,6cqw,52px)] h-[clamp(20px,6cqw,52px)] border-[1.5px] border-gold/90 rounded-[2px] flex items-center justify-center shadow-[0_0_10px_rgba(212,163,89,0.4)]">
              <span className="text-gold text-[clamp(7px,1.6cqw,13px)] font-mono font-bold leading-none">+</span>
              <span className="absolute -top-[2cqw] right-0 text-[clamp(5px,1.1cqw,8.5px)] font-mono tracking-widest text-gold font-bold bg-black/85 px-[0.6cqw] py-[0.2cqw] rounded border border-gold/40 leading-none whitespace-nowrap">
                AF-LOCK
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* INSIDE CAMERA SCREEN: Statement ("Three decades...")     */}
          {/* ======================================================== */}
          <div
            ref={statementRef}
            className="absolute inset-0 z-15 flex flex-col items-center justify-center text-center px-[6cqw] py-[4cqw] opacity-0 pointer-events-none will-change-transform"
          >
            <div className="max-w-[82cqw] mx-auto flex flex-col items-center">
              <span className="text-[clamp(6px,1.35cqw,11px)] uppercase tracking-[0.35em] text-gold/90 font-mono font-medium leading-none">
                About our studio
              </span>
              <h2 className="mt-[1.5cqw] font-display text-[clamp(11px,3.2cqw,28px)] font-light leading-[1.24] tracking-tight text-foreground">
                Three decades of crafting timeless family memories.
              </h2>
              <p className="mt-[1.5cqw] text-[clamp(7px,1.55cqw,13px)] text-muted-foreground font-light max-w-[68cqw] leading-relaxed">
                Every smile, vow, and quiet glance preserved with cinematic soul from Mira Road East since 1994.
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* INSIDE CAMERA SCREEN: Serpentine Curved Ribbon of Photos */}
          {/* ======================================================== */}
          <div
            ref={serpentineStageRef}
            className="pointer-events-none absolute inset-0 z-20 opacity-0 overflow-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div ref={serpentineTrackRef} className="absolute inset-0">
              {ribbonCards.map((item, idx) => (
                <div
                  key={`ribbon-${idx}`}
                  className="absolute left-0 top-0 w-[clamp(155px,34cqw,290px)] p-[clamp(7px,1.4cqw,13px)] rounded-xl md:rounded-2xl bg-[#13110f]/95 border border-gold/30 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-md will-change-transform pointer-events-auto"
                >
                  <div className="flex items-center justify-between pb-[1cqw] px-0.5 text-[clamp(7.5px,1.35cqw,11px)] font-mono tracking-widest text-muted-foreground border-b border-white/10">
                    <span>UTSAV #{String((idx % 7) + 1).padStart(2, "0")}</span>
                    <span className="text-gold font-semibold">• 35MM PRIME</span>
                  </div>
                  <div className="w-full aspect-[4/5] mt-[1.2cqw] rounded-lg overflow-hidden bg-muted/20 relative shadow-inner">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="pt-[1.2cqw] px-0.5 flex justify-between items-center leading-none">
                    <span className="font-display text-[clamp(9.5px,1.75cqw,14.5px)] text-foreground font-light tracking-wide truncate">{item.title}</span>
                    <span className="font-mono text-[clamp(7.5px,1.25cqw,10.5px)] text-gold/90 shrink-0 ml-2 uppercase tracking-wider">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* INSIDE CAMERA SCREEN: Wide 3D Panoramic Cylinder Reel    */}
          {/* ======================================================== */}
          <div
            ref={cylinderStageRef}
            className="pointer-events-none absolute inset-0 z-25 flex flex-col items-center justify-center opacity-0 overflow-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Section Heading inside camera screen */}
            <div className="absolute top-[2.5cqw] z-20 text-center px-[4cqw]">
              <span className="text-[clamp(6px,1.35cqw,11px)] uppercase tracking-[0.35em] text-gold/90 font-mono font-medium leading-none">
                Selected frames
              </span>
              <h3 className="mt-[0.8cqw] font-display text-[clamp(11px,3.1cqw,28px)] font-light tracking-tight text-foreground">
                Stories we've told lately
              </h3>
            </div>

            {/* Cylinder reel */}
            <div
              ref={cylinderWrapperRef}
              className="relative w-[clamp(210px,32cqw,360px)] h-[clamp(290px,44cqw,470px)] mt-[clamp(6px,1.2cqw,16px)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {cylinderCards.map((item, idx) => (
                <div
                  key={`cyl-${idx}`}
                  className="absolute left-1/2 top-1/2 w-[clamp(210px,32cqw,360px)] will-change-transform pointer-events-auto"
                  style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                >
                  <Crazy3DCard
                    src={item.src}
                    title={item.title}
                    category={item.category}
                    frameNumber={`FRAME #${String((idx % 8) + 1).padStart(2, "0")}`}
                    showBadge={idx === 0 || idx === 1}
                    className="w-full"
                    aspect="aspect-[4/5]"
                  />
                </div>
              ))}
            </div>

            {/* Action button inside camera screen */}
            <div className="absolute bottom-[2.5cqw] z-20 pointer-events-auto scale-[clamp(0.72,0.18+0.7cqw,1)] origin-bottom">
              <OutlineButton to="/portfolio">
                View full portfolio
              </OutlineButton>
            </div>
          </div>

          {/* ======================================================== */}
          {/* VIEW FINDER HUD OVERLAY (Framing the Camera Screen)      */}
          {/* ======================================================== */}
          <div className="pointer-events-none absolute inset-0 z-30 select-none flex flex-col justify-between">
            {/* Top Bar with gentle cinema vignette */}
            <div className="w-full bg-gradient-to-b from-black/85 via-black/35 to-transparent px-[3.5cqw] pt-[2.2cqw] pb-[3cqw] flex items-center justify-between text-[clamp(6px,1.5cqw,11px)] font-mono tracking-wider text-gold/90 whitespace-nowrap leading-none select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
              <div className="flex items-center gap-[1.2cqw]">
                <span className="size-[clamp(4px,1cqw,7px)] rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444] shrink-0" />
                <span className="font-bold text-white tracking-widest">REC</span>
                <span className="text-white/80 font-mono">00:19:94:24</span>
                <span className="text-gold/40">·</span>
                <span className="text-gold font-medium">4K CINE LOG</span>
              </div>
              <div className="flex items-center gap-[1.5cqw] text-white/80 font-mono">
                <span>f/1.4</span>
                <span>1/250s</span>
                <span className="text-gold font-bold">ISO 100</span>
                <span className="text-emerald-400">98% 🔋</span>
              </div>
            </div>

            {/* Framing Corner Brackets & Grid Lines */}
            <div className="absolute inset-[3.5cqw] pointer-events-none">
              <div className="absolute top-0 left-0 w-[clamp(8px,2.8cqw,24px)] h-[clamp(8px,2.8cqw,24px)] border-t-[1.5px] border-l-[1.5px] border-gold/70" />
              <div className="absolute top-0 right-0 w-[clamp(8px,2.8cqw,24px)] h-[clamp(8px,2.8cqw,24px)] border-t-[1.5px] border-r-[1.5px] border-gold/70" />
              <div className="absolute bottom-0 left-0 w-[clamp(8px,2.8cqw,24px)] h-[clamp(8px,2.8cqw,24px)] border-b-[1.5px] border-l-[1.5px] border-gold/70" />
              <div className="absolute bottom-0 right-0 w-[clamp(8px,2.8cqw,24px)] h-[clamp(8px,2.8cqw,24px)] border-b-[1.5px] border-r-[1.5px] border-gold/70" />

              {/* Rule-of-Thirds Grid */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-15">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
              </div>
            </div>

            {/* Bottom Bar with gentle cinema vignette */}
            <div className="w-full bg-gradient-to-t from-black/85 via-black/35 to-transparent px-[3.5cqw] pb-[2.2cqw] pt-[3cqw] flex items-center justify-between text-[clamp(5.8px,1.35cqw,10.5px)] font-mono tracking-wider text-gold/90 whitespace-nowrap leading-none select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
              <div className="flex items-center gap-[1.2cqw]">
                <span className="text-white font-semibold">35MM PRIME · UTSAV</span>
                <span className="text-emerald-400 font-mono text-[clamp(5.2px,1.2cqw,9px)]">[AF-C · EYE-TRACK]</span>
              </div>
              <div className="flex items-center gap-[1.2cqw]">
                <span ref={hudModeRef} className="text-gold font-mono text-[clamp(5.2px,1.2cqw,9.5px)]">
                  [LAST SHOT · CAPTURE REVIEW]
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
