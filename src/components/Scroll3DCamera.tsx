"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Camera, Orbit, Sparkles, RefreshCw, EyeOff, Eye } from "lucide-react";

/**
 * Scroll3DCamera
 * ───────────────
 * A photorealistic, high-fidelity 3D Studio Camera that moves, rotates,
 * and frames dynamically as the user scrolls across Utsav Studio.
 *
 * • Loads real PBR 3D models (Steampunk Cine & Vintage Field Camera)
 * • Studio ACES Filmic tone mapping + RoomEnvironment HDRI reflections
 * • Non-blocking scroll waypoints tucked into layout negative spaces
 * • 60fps cosine-eased trajectory lerping + mouse parallax micro-tilt
 * • Interactive 3D Orbit mode (drag to spin 360°)
 * • Model switching & Flash burst trigger
 */

type CameraModelKey = "steampunk" | "antique";

interface Waypoint {
  p: number;
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
}

export function Scroll3DCamera() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeModel, setActiveModel] = useState<CameraModelKey>("steampunk");
  const [isDocked, setIsDocked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [flashTrigger, setFlashTrigger] = useState(false);

  const stateRef = useRef({
    scrollProgress: 0,
    targetProgress: 0,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    isDragging: false,
    orbitX: 0,
    orbitY: 0,
    lastX: 0,
    lastY: 0,
  });

  const modelPivotRef = useRef<THREE.Group | null>(null);
  const modelsCacheRef = useRef<Record<string, THREE.Group>>({});

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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // ── Studio PBR Environment Reflections ────────────────────────────
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    // ── Cinematic 3-Point Lighting ────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    // Key Light (Warm 3200K Studio Tungsten)
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 3.2);
    keyLight.position.set(7, 9, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Rim Light (Teal/Silver Backlight)
    const rimLight = new THREE.DirectionalLight(0x7ac4ff, 2.0);
    rimLight.position.set(-8, -4, -6);
    scene.add(rimLight);

    // Warm Gold Fill Light
    const fillLight = new THREE.DirectionalLight(0xd4a359, 2.4);
    fillLight.position.set(-5, 6, 4);
    scene.add(fillLight);

    // ── Master Camera Pivot ───────────────────────────────────────────
    const masterPivot = new THREE.Group();
    scene.add(masterPivot);
    modelPivotRef.current = masterPivot;

    // ── GLTF & Draco Loader Setup ─────────────────────────────────────
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/gltf/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // Helper: Load & Center GLB Model
    const loadModel = (url: string, key: string, targetSize = 2.4) => {
      if (modelsCacheRef.current[key]) {
        // Swap to cached model
        while (masterPivot.children.length > 0) {
          masterPivot.remove(masterPivot.children[0]);
        }
        masterPivot.add(modelsCacheRef.current[key]);
        setIsLoaded(true);
        return;
      }

      gltfLoader.load(
        url,
        (gltf) => {
          const raw = gltf.scene;

          // Compute bounding box and center pivot
          const box = new THREE.Box3().setFromObject(raw);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          raw.position.sub(center);

          // Normalize scale so it fits perfectly
          const maxDim = Math.max(size.x, size.y, size.z);
          const baseScale = targetSize / maxDim;
          raw.scale.setScalar(baseScale);

          // Enhance materials for photorealism
          raw.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              if (mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.envMapIntensity = 1.7;
                mat.needsUpdate = true;
              }
            }
          });

          const wrapper = new THREE.Group();
          wrapper.add(raw);
          modelsCacheRef.current[key] = wrapper;

          // Add to pivot
          while (masterPivot.children.length > 0) {
            masterPivot.remove(masterPivot.children[0]);
          }
          masterPivot.add(wrapper);
          setIsLoaded(true);
        },
        undefined,
        (err) => {
          console.warn(`[Scroll3DCamera] Failed to load ${url}:`, err);
        },
      );
    };

    // Load active model
    const modelUrl =
      activeModel === "steampunk"
        ? "/assets/models/steampunk_camera.glb"
        : "/assets/models/antique_camera.glb";
    loadModel(modelUrl, activeModel, activeModel === "steampunk" ? 2.3 : 2.5);

    // ── Scroll & Mouse Tracking ───────────────────────────────────────
    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, scrollY / maxScroll));
      stateRef.current.targetProgress = p;
      setScrollPercent(Math.round(p * 100));
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

    // ── 3D Waypoints (Tasteful, Non-Blocking, Refined in Margins) ────
    // Camera is positioned in margins / negative space, NEVER covering headings or photo grids!
    const waypoints: Waypoint[] = [
      // 0.00: Hero — Floating proudly in upper-right margin, tilted 3/4
      { p: 0.0, pos: [3.3, -0.1, 0.2], rot: [-0.05, -0.6, 0.05], scale: 0.64 },

      // 0.18: Curved Reel — Right margin, clean of reel cards
      { p: 0.18, pos: [3.2, -0.3, 0.0], rot: [0.1, -0.75, 0.05], scale: 0.62 },

      // 0.35: Harmonics Radar Dial — Docks gracefully to the right of the dial
      { p: 0.35, pos: [3.4, 0.0, -0.2], rot: [0.2, -0.85, 0.1], scale: 0.68 },

      // 0.52: Services Scroller — Right margin beside service groups
      { p: 0.52, pos: [3.3, 0.15, -0.2], rot: [-0.1, -0.5, 0.05], scale: 0.66 },

      // 0.72: Selected Work Gallery — Docks in bottom-right corner, 100% clear of all 36 photo cards
      { p: 0.72, pos: [3.3, -1.75, 0.4], rot: [0.1, -0.4, 0.02], scale: 0.46 },

      // 0.88: Medium-Format Optics / Stats — Right side framing
      { p: 0.88, pos: [3.4, -0.2, 0.1], rot: [0.08, -0.5, 0.08], scale: 0.68 },

      // 1.00: CTA Band — Centered below the main CTA headline in hero pose
      { p: 1.0, pos: [0.0, -0.65, 0.6], rot: [0.05, 0.0, 0.0], scale: 0.82 },
    ];

    const interpolateTrajectory = (p: number) => {
      let idx = 0;
      for (let i = 0; i < waypoints.length - 1; i++) {
        if (p >= waypoints[i].p && p <= waypoints[i + 1].p) {
          idx = i;
          break;
        }
      }

      const w1 = waypoints[idx];
      const w2 = waypoints[idx + 1] || w1;
      const span = Math.max(0.001, w2.p - w1.p);
      const factor = (p - w1.p) / span;

      // Cosine ease
      const eased = (1 - Math.cos(factor * Math.PI)) / 2;

      const posX = THREE.MathUtils.lerp(w1.pos[0], w2.pos[0], eased);
      const posY = THREE.MathUtils.lerp(w1.pos[1], w2.pos[1], eased);
      const posZ = THREE.MathUtils.lerp(w1.pos[2], w2.pos[2], eased);

      const rotX = THREE.MathUtils.lerp(w1.rot[0], w2.rot[0], eased);
      const rotY = THREE.MathUtils.lerp(w1.rot[1], w2.rot[1], eased);
      const rotZ = THREE.MathUtils.lerp(w1.rot[2], w2.rot[2], eased);

      const scale = THREE.MathUtils.lerp(w1.scale, w2.scale, eased);

      return { posX, posY, posZ, rotX, rotY, rotZ, scale };
    };

    // ── 60fps Physics & Render Loop ───────────────────────────────────
    let animId: number;
    let clock = 0;

    const tick = () => {
      clock += 0.015;
      const s = stateRef.current;

      // Smooth scroll progress lerp
      s.scrollProgress += (s.targetProgress - s.scrollProgress) * 0.075;

      // Smooth mouse parallax lerp
      s.mouseX += (s.targetMouseX - s.mouseX) * 0.05;
      s.mouseY += (s.targetMouseY - s.mouseY) * 0.05;

      const cur = interpolateTrajectory(s.scrollProgress);

      // Subtle breathing motion
      const breathY = Math.sin(clock * 1.4) * 0.04;
      const breathRot = Math.cos(clock * 1.1) * 0.015;

      if (!isInteractive) {
        if (isDocked) {
          // Docked in bottom-right corner as a mini companion
          masterPivot.position.set(3.2, -1.8, 0.5);
          masterPivot.rotation.set(0.1, clock * 0.4, 0);
          masterPivot.scale.setScalar(0.42);
        } else {
          masterPivot.position.set(
            cur.posX + s.mouseX * 0.25,
            cur.posY - s.mouseY * 0.2 + breathY,
            cur.posZ,
          );

          masterPivot.rotation.set(
            cur.rotX - s.mouseY * 0.12 + breathRot,
            cur.rotY + s.mouseX * 0.2,
            cur.rotZ,
          );

          masterPivot.scale.setScalar(cur.scale);
        }
      } else {
        // Interactive Orbit Mode
        masterPivot.rotation.set(s.orbitX, s.orbitY, 0);
        masterPivot.position.set(0, breathY, 0.3);
        masterPivot.scale.setScalar(1.0);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // ── Resize Observer ───────────────────────────────────────────────
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
        className={`fixed inset-0 z-[35] overflow-hidden transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${
          isInteractive
            ? "pointer-events-auto cursor-grab active:cursor-grabbing bg-black/20 backdrop-blur-[2px]"
            : "pointer-events-none"
        }`}
      />

      {/* ── Camera Flash Burst FX ───────────────────────────────────── */}
      {flashTrigger && (
        <div className="fixed inset-0 z-[9999] pointer-events-none bg-white animate-out fade-out duration-300" />
      )}

      {/* ── Floating 3D Camera Telemetry & Controller HUD ───────────── */}
      <div className="fixed bottom-6 left-6 z-[80] hidden sm:flex items-center gap-2 select-none">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/85 border border-gold/30 text-gold shadow-2xl backdrop-blur-md font-mono text-[10px] tracking-widest">
          {/* Status LED & Label */}
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <Camera className="size-3.5 text-gold" />
            <span>3D CAM</span>
          </span>

          <span className="w-px h-3 bg-white/15" />

          {/* Travel Percent */}
          <span className="text-foreground/80 tabular-nums">{scrollPercent}% TRAVEL</span>

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
