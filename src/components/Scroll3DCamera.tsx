"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Camera, Orbit, Sparkles, RefreshCw, EyeOff, Eye } from "lucide-react";
import heroImage from "@/assets/hero.jpg";

/**
 * Scroll3DCamera
 * ───────────────
 * Cinematic Storytelling 3D Camera:
 *
 * 1. HERO (p: 0.0 -> 0.08):
 *    Camera aims forward toward the scene / couple.
 *    Focus reticle locks. Shutter clicks down and studio flash burst fires (*SNAP!*).
 *
 * 2. THE 180° FLIP (p: 0.08 -> 0.22):
 *    Camera spins 180° around Y to face its back toward the viewer.
 *    The back illuminated LCD display screen turns on, showcasing the newly clicked photo
 *    with live cinema HUD telemetry (ISO 100, 1/250s, f/1.4, 4K CINE LOG, battery, audio VU).
 *
 * 3. ZOOM INTO FULLSCREEN (p: 0.22 -> 0.38):
 *    Camera moves forward toward the viewer, smoothly expanding the LCD monitor
 *    until it fills 100% of the screen. Bezels slide off-viewport.
 *
 * 4. PHOTO SHOWCASE INSIDE VIEWFINDER (p: 0.38 -> 0.90):
 *    The photo reel and 3D wheel are displayed INSIDE this camera viewfinder screen!
 *
 * 5. COMPANION DOCK (p > 0.90):
 *    Camera smoothly glides into the bottom-right corner as a sleek, non-intrusive 3D companion.
 */

type CameraModelKey = "steampunk" | "antique";

export function Scroll3DCamera() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [activeModel, setActiveModel] = useState<CameraModelKey>("steampunk");
  const [isDocked, setIsDocked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [flashTrigger, setFlashTrigger] = useState(false);
  const [hudPhase, setHudPhase] = useState<"aim" | "flip" | "zoom" | "inside" | "docked">("aim");

  const stateRef = useRef({
    heroP: 0,
    targetHeroP: 0,
    globalScrollP: 0,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    isDragging: false,
    orbitX: 0,
    orbitY: 0,
    lastX: 0,
    lastY: 0,
    hasFlashed: false,
  });

  const masterPivotRef = useRef<THREE.Group | null>(null);
  const modelsCacheRef = useRef<Record<string, THREE.Group>>({});
  const lcdTextureRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mount = mountRef.current;
    if (!mount) return;

    // ── Three.js Scene Setup ──────────────────────────────────────────
    const scene = new THREE.Scene();

    let width = window.innerWidth;
    let height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    // ── Studio PBR Environment Reflections ────────────────────────────
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    // ── Cinematic 3-Point Studio Lighting ─────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 3.4);
    keyLight.position.set(7, 9, 8);
    keyLight.castShadow = true;
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
    masterPivotRef.current = masterPivot;

    // ── Build High-Tech LCD Monitor on the Back of Camera ─────────────
    const screenWidth = 1.35;
    const screenHeight = 0.88;

    const lcdGroup = new THREE.Group();
    // Position on back chassis, proud of bolt heads
    lcdGroup.position.set(0.0, -0.05, -1.04);
    lcdGroup.rotation.y = Math.PI;
    lcdGroup.visible = false; // Hidden when facing forward in hero
    masterPivot.add(lcdGroup);

    // Beveled Screen Bezel (Dark Titanium)
    const bezelGeom = new THREE.BoxGeometry(screenWidth + 0.08, screenHeight + 0.08, 0.02);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x111113,
      metalness: 0.9,
      roughness: 0.25,
    });
    const bezelMesh = new THREE.Mesh(bezelGeom, bezelMat);
    bezelMesh.position.z = -0.01;
    lcdGroup.add(bezelMesh);

    // Offscreen Canvas for Dynamic LCD Display Texture
    const lcdCanvas = document.createElement("canvas");
    lcdCanvas.width = 1024;
    lcdCanvas.height = 720;
    const lcdCtx = lcdCanvas.getContext("2d")!;

    const lcdTexture = new THREE.CanvasTexture(lcdCanvas);
    lcdTexture.colorSpace = THREE.SRGBColorSpace;
    lcdTextureRef.current = lcdTexture;

    // Load preview photo
    const previewImg = new Image();
    previewImg.crossOrigin = "anonymous";
    previewImg.src = heroImage;
    let imgLoaded = false;
    previewImg.onload = () => {
      imgLoaded = true;
      renderLcdScreen();
    };

    const renderLcdScreen = () => {
      const w = lcdCanvas.width;
      const h = lcdCanvas.height;

      // Draw photo or luxury background
      if (imgLoaded) {
        lcdCtx.drawImage(previewImg, 0, 0, w, h);
      } else {
        const grad = lcdCtx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, "#1c1917");
        grad.addColorStop(1, "#0c0a09");
        lcdCtx.fillStyle = grad;
        lcdCtx.fillRect(0, 0, w, h);
      }

      // Subtle cinema contrast tint
      lcdCtx.fillStyle = "rgba(0, 0, 0, 0.35)";
      lcdCtx.fillRect(0, 0, w, h);

      // Top Status Bar
      lcdCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
      lcdCtx.fillRect(0, 0, w, 58);

      // Red Record Dot
      lcdCtx.fillStyle = "#ef4444";
      lcdCtx.beginPath();
      lcdCtx.arc(36, 29, 8, 0, Math.PI * 2);
      lcdCtx.fill();

      lcdCtx.fillStyle = "#ffffff";
      lcdCtx.font = "bold 18px monospace";
      lcdCtx.fillText("REC  00:19:94:24", 56, 36);

      lcdCtx.fillStyle = "#d4a359";
      lcdCtx.font = "bold 16px monospace";
      lcdCtx.fillText("4K CINE LOG · 24FPS", w / 2 - 110, 36);

      // Battery & RAW on top right
      lcdCtx.fillStyle = "#34d399";
      lcdCtx.fillText("98% 🔋  [RAW+LOG]", w - 210, 36);

      // Center Rule-of-Thirds Grid Lines
      lcdCtx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      lcdCtx.lineWidth = 1;
      lcdCtx.beginPath();
      lcdCtx.moveTo(w / 3, 58);
      lcdCtx.lineTo(w / 3, h - 58);
      lcdCtx.moveTo((w * 2) / 3, 58);
      lcdCtx.lineTo((w * 2) / 3, h - 58);
      lcdCtx.moveTo(0, h / 3);
      lcdCtx.lineTo(w, h / 3);
      lcdCtx.moveTo(0, (h * 2) / 3);
      lcdCtx.lineTo(w, (h * 2) / 3);
      lcdCtx.stroke();

      // Golden Center Autofocus Reticle [ + ]
      lcdCtx.strokeStyle = "#d4a359";
      lcdCtx.lineWidth = 2.5;
      const cx = w / 2;
      const cy = h / 2;
      const rSize = 38;
      lcdCtx.strokeRect(cx - rSize, cy - rSize, rSize * 2, rSize * 2);
      lcdCtx.beginPath();
      lcdCtx.moveTo(cx - 10, cy);
      lcdCtx.lineTo(cx + 10, cy);
      lcdCtx.moveTo(cx, cy - 10);
      lcdCtx.lineTo(cx, cy + 10);
      lcdCtx.stroke();

      // Bottom Metadata Bar
      lcdCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
      lcdCtx.fillRect(0, h - 58, w, 58);

      lcdCtx.fillStyle = "#ffffff";
      lcdCtx.font = "17px monospace";
      lcdCtx.fillText("1/250s", 36, h - 22);
      lcdCtx.fillText("f/1.4", 160, h - 22);

      lcdCtx.fillStyle = "#d4a359";
      lcdCtx.fillText("ISO 100", 280, h - 22);

      lcdCtx.fillStyle = "#94a3b8";
      lcdCtx.fillText("35MM PRIME · UTSAV", w / 2 - 95, h - 22);

      lcdCtx.fillStyle = "#facc15";
      lcdCtx.fillText("AF-C · EYE-TRACK", w - 210, h - 22);

      lcdTexture.needsUpdate = true;
    };

    renderLcdScreen();

    // Screen Mesh with self-illuminated material
    const screenGeom = new THREE.PlaneGeometry(screenWidth, screenHeight);
    const screenMat = new THREE.MeshBasicMaterial({
      map: lcdTexture,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(screenGeom, screenMat);
    screenMesh.position.z = 0.02;
    screenMesh.renderOrder = 999;
    lcdGroup.add(screenMesh);

    // ── GLTF & Draco Loader ───────────────────────────────────────────
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/gltf/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const loadModel = (url: string, key: string, targetSize = 2.4) => {
      if (modelsCacheRef.current[key]) {
        // Remove existing model children (keep lcdGroup)
        masterPivot.children = masterPivot.children.filter((c) => c === lcdGroup);
        masterPivot.add(modelsCacheRef.current[key]);
        setIsLoaded(true);
        return;
      }

      gltfLoader.load(
        url,
        (gltf) => {
          const raw = gltf.scene;

          const box = new THREE.Box3().setFromObject(raw);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          raw.position.sub(center);

          const maxDim = Math.max(size.x, size.y, size.z);
          const baseScale = targetSize / maxDim;
          raw.scale.setScalar(baseScale);

          raw.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              if (mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.envMapIntensity = 1.7;
                mat.transparent = true;
                mat.needsUpdate = true;
              }
            }
          });

          const wrapper = new THREE.Group();
          wrapper.add(raw);
          modelsCacheRef.current[key] = wrapper;

          masterPivot.children = masterPivot.children.filter((c) => c === lcdGroup);
          masterPivot.add(wrapper);
          setIsLoaded(true);
        },
        undefined,
        (err) => {
          console.warn(`[Scroll3DCamera] Failed to load ${url}:`, err);
        },
      );
    };

    const modelUrl =
      activeModel === "steampunk"
        ? "/assets/models/steampunk_camera.glb"
        : "/assets/models/antique_camera.glb";
    loadModel(modelUrl, activeModel, activeModel === "steampunk" ? 2.3 : 2.5);

    // ── Track Scroll with Precision across Hero & Reel Experience ─────
    const onScroll = () => {
      const heroSection = document.querySelector<HTMLElement>("[data-hero-experience]");
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const total = heroSection.offsetHeight - window.innerHeight;
        const p = Math.max(0, Math.min(1, -rect.top / (total || 1)));
        stateRef.current.targetHeroP = p;
      }

      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      stateRef.current.globalScrollP = Math.min(1, Math.max(0, scrollY / maxScroll));
    };

    const onMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      stateRef.current.targetMouseX = normX;
      stateRef.current.targetMouseY = normY;

      if (stateRef.current.isDragging) {
        const dx = e.clientX - stateRef.current.lastX;
        const dy = e.clientY - stateRef.current.lastY;
        stateRef.current.lastX = e.clientX;
        stateRef.current.lastY = e.clientY;
        stateRef.current.orbitY += dx * 0.008;
        stateRef.current.orbitX += dy * 0.008;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!isInteractive) return;
      stateRef.current.isDragging = true;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastY = e.clientY;
    };

    const onMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    onScroll();

    // ── 60fps Physics, Animation & Camera Choreography ────────────────
    let animId: number;
    let clock = 0;

    const tick = () => {
      clock += 0.015;
      const s = stateRef.current;

      // Smooth lerp
      s.heroP += (s.targetHeroP - s.heroP) * 0.085;
      s.mouseX += (s.targetMouseX - s.mouseX) * 0.05;
      s.mouseY += (s.targetMouseY - s.mouseY) * 0.05;

      const p = s.heroP;

      // Subtle breathing motion
      const breathY = Math.sin(clock * 1.4) * 0.03;
      const breathRot = Math.cos(clock * 1.1) * 0.012;

      // Trigger photo flash burst around p = 0.04 -> 0.06
      if (p >= 0.04 && p <= 0.08 && !s.hasFlashed) {
        s.hasFlashed = true;
        setFlashTrigger(true);
        setTimeout(() => setFlashTrigger(false), 240);
      } else if (p < 0.02) {
        s.hasFlashed = false;
      }

      if (!isInteractive) {
        if (p <= 0.05) {
          // Phase A: Aiming at scene below the main headline, locking focus
          setHudPhase("aim");
          lcdGroup.visible = false; // Never show LCD from the front in hero!
          masterPivot.position.set(0.0 + s.mouseX * 0.12, -1.38 - s.mouseY * 0.1 + breathY, 1.05);
          masterPivot.rotation.set(0.02 - s.mouseY * 0.05 + breathRot, -0.12 + s.mouseX * 0.08, 0);
          masterPivot.scale.setScalar(0.65);
          mount.style.opacity = "1";
          mount.style.pointerEvents = "none";

          // Ensure chassis is fully visible
          if (modelsCacheRef.current[activeModel]) {
            modelsCacheRef.current[activeModel].traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (mat) mat.opacity = 1;
              }
            });
          }
        } else if (p > 0.05 && p <= 0.14) {
          // Phase B: Flip 180° on Y & elevate to center — Ooltah Ghumna! Display reveals photo!
          setHudPhase("flip");
          const factor = (p - 0.05) / 0.09;
          const eased = (1 - Math.cos(factor * Math.PI)) / 2;

          // Reveal LCD once rotating towards viewer
          lcdGroup.visible = factor > 0.12;

          const rotY = -0.12 + eased * (Math.PI + 0.12); // -0.12 to 180° (Math.PI)
          const posY = -1.38 + eased * 1.38; // Elevates from -1.38 to 0.0 center
          const posZ = 1.05 + eased * 0.65; // 1.05 to 1.70
          const scale = 0.65 + eased * 0.40; // 0.65 to 1.05

          masterPivot.position.set(0.0 + s.mouseX * 0.12, posY - s.mouseY * 0.08 + breathY, posZ);
          masterPivot.rotation.set(0.02 - s.mouseY * 0.04, rotY + s.mouseX * 0.06, 0);
          masterPivot.scale.setScalar(scale);
          mount.style.opacity = "1";
          mount.style.pointerEvents = "none";

          if (modelsCacheRef.current[activeModel]) {
            modelsCacheRef.current[activeModel].traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (mat) mat.opacity = 1;
              }
            });
          }
        } else if (p > 0.14 && p <= 0.30) {
          // Phase C: CAMERA MOVES FORWARD, LCD EXPANDS TO FULL SCREEN!
          setHudPhase("zoom");
          lcdGroup.visible = true;

          const factor = Math.min(1, Math.max(0, (p - 0.14) / 0.12));
          // Pure sine ease-in-out for buttery-smooth motion with zero sudden jerk
          const eased = (1 - Math.cos(factor * Math.PI)) / 2;

          // Moves forward (posZ: 1.70 -> 2.95) and scales up (1.05 -> 2.60)
          // The LCD screen expands until it covers 100% of the viewport!
          const posZ = 1.70 + eased * 1.25;
          const scale = 1.05 + eased * 1.55;

          masterPivot.position.set(0.0, 0.0, posZ);
          masterPivot.rotation.set(0.0, Math.PI, 0);
          masterPivot.scale.setScalar(scale);

          // Dissolve camera chassis softly so only the clean LCD screen expands to the edges
          if (modelsCacheRef.current[activeModel]) {
            const chassisFade = Math.max(0, 1 - eased * 1.5);
            modelsCacheRef.current[activeModel].traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (mat) mat.opacity = chassisFade;
              }
            });
          }

          // At p >= 0.26, the LCD screen borders reach viewport edges.
          // Smooth 1:1 equal-power crossfade to 2D Viewfinder overlay between 0.26 and 0.30
          if (p >= 0.26) {
            const crossfade = Math.max(0, 1 - (p - 0.26) / 0.04);
            mount.style.opacity = String(crossfade);
          } else {
            mount.style.opacity = "1";
          }
          mount.style.pointerEvents = "none";
        } else {
          // Phase D & Beyond: Inside the Viewfinder & Rest of the Website!
          // Camera display is now 100% full screen — all photos display inside it!
          setHudPhase("inside");
          lcdGroup.visible = false;
          mount.style.opacity = "0";
          mount.style.pointerEvents = "none";
        }
      } else {
        // Interactive Orbit Mode (activated via DRAG 3D button)
        lcdGroup.visible = true;
        masterPivot.rotation.set(s.orbitX, s.orbitY, 0);
        masterPivot.position.set(0, breathY, 0.4);
        masterPivot.scale.setScalar(0.95);
        mount.style.opacity = "1";
        mount.style.pointerEvents = "auto";
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      pmremGenerator.dispose();
      dracoLoader.dispose();
      lcdTexture.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [activeModel, isInteractive, isDocked]);

  const triggerShutterFlash = () => {
    setFlashTrigger(true);
    setTimeout(() => setFlashTrigger(false), 240);
  };

  return (
    <>
      {/* ── Fixed Fullscreen 3D Canvas Stage ────────────────────────── */}
      <div
        ref={mountRef}
        aria-hidden
        className={`fixed inset-0 z-[35] overflow-hidden pointer-events-none transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${
          isInteractive
            ? "!pointer-events-auto cursor-grab active:cursor-grabbing bg-black/20 backdrop-blur-[2px]"
            : ""
        }`}
      />

      {/* ── Camera Flash Burst FX (Fires on Shutter Snap) ───────────── */}
      {flashTrigger && (
        <div className="fixed inset-0 z-[9999] pointer-events-none bg-white animate-out fade-out duration-300" />
      )}

      {/* ── Floating 3D Camera Telemetry & Controller HUD ───────────── */}
      <div
        className={`fixed bottom-6 left-6 z-[80] hidden sm:flex items-center gap-2 select-none transition-all duration-500 ${
          hudPhase === "inside" && !isInteractive
            ? "opacity-0 pointer-events-none translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/85 border border-gold/30 text-gold shadow-2xl backdrop-blur-md font-mono text-[10px] tracking-widest">
          {/* Status LED & Phase Label */}
          <span className="flex items-center gap-1.5 font-semibold">
            <span
              className={`size-1.5 rounded-full animate-pulse shadow-[0_0_8px_#34d399] ${
                hudPhase === "aim"
                  ? "bg-amber-400"
                  : hudPhase === "flip" || hudPhase === "zoom"
                    ? "bg-red-500"
                    : "bg-emerald-400"
              }`}
            />
            <Camera className="size-3.5 text-gold" />
            <span className="uppercase">
              {hudPhase === "aim"
                ? "3D CAM: AIM"
                : hudPhase === "flip"
                  ? "3D CAM: FLIP"
                  : hudPhase === "zoom"
                    ? "3D CAM: ZOOM"
                    : hudPhase === "inside"
                      ? "VIEWFINDER LIVE"
                      : "3D CAM: DOCKED"}
            </span>
          </span>

          <span className="w-px h-3 bg-white/15" />

          {/* Model Switcher Button */}
          <button
            type="button"
            onClick={() => setActiveModel((m) => (m === "steampunk" ? "antique" : "steampunk"))}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors uppercase"
            title="Switch 3D Camera Model"
          >
            <RefreshCw className="size-2.5 text-gold" />
            <span>{activeModel === "steampunk" ? "CINE" : "FIELD"}</span>
          </button>

          <span className="w-px h-3 bg-white/15" />

          {/* Shutter Click Button */}
          <button
            type="button"
            onClick={triggerShutterFlash}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-amber-300 hover:text-amber-100 hover:bg-amber-400/20 transition-colors"
            title="Trigger Camera Flash"
          >
            <Sparkles className="size-2.5" />
            <span>SNAP</span>
          </button>

          <span className="w-px h-3 bg-white/15" />

          {/* 3D Orbit Drag Toggle */}
          <button
            type="button"
            onClick={() => setIsInteractive((v) => !v)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
              isInteractive
                ? "bg-gold text-black font-bold shadow-[0_0_10px_rgba(212,163,89,0.5)]"
                : "text-gold/90 hover:text-white hover:bg-white/10"
            }`}
            title="Toggle 360° Mouse Orbit"
          >
            <Orbit className="size-3" />
            <span>{isInteractive ? "ORBIT ON" : "DRAG 3D"}</span>
          </button>

          {/* Dock / Minimize Button */}
          <button
            type="button"
            onClick={() => setIsDocked((v) => !v)}
            className="p-1 rounded text-white/50 hover:text-white transition-colors"
            title={isDocked ? "Restore full 3D scroll" : "Dock to bottom corner"}
          >
            {isDocked ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
          </button>
        </div>
      </div>
    </>
  );
}
