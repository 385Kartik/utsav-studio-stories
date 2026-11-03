"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Camera, Orbit, Eye, Sparkles } from "lucide-react";

/**
 * Scroll3DCamera
 * ───────────────
 * A photorealistic 3D Vintage Rangefinder Camera that moves, rotates,
 * and frames dynamically as the user scrolls down the website.
 *
 * • Scroll-driven 3D spline trajectory (Hero -> Services -> Gallery -> Stats -> CTA)
 * • Front lens aperture iris dynamically stops down on scroll
 * • Mouse parallax micro-tilt
 * • Interactive 3D Orbit mode toggle
 * • 60fps buttery smooth lerping
 */

export function Scroll3DCamera() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

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
    flashOpacity: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mount = mountRef.current;
    if (!mount) return;

    // ── Three.js Scene Setup ──────────────────────────────────────────
    const scene = new THREE.Scene();

    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Camera Master Pivot
    const cameraMaster = new THREE.Group();
    scene.add(cameraMaster);

    // ── Cinematic 3-Point Lighting ────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Key Light (Warm Tungsten Gold)
    const keyLight = new THREE.DirectionalLight(0xffecd1, 2.8);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    // Rim / Back Light (Deep Amber Accent)
    const rimLight = new THREE.DirectionalLight(0xd4a359, 3.2);
    rimLight.position.set(-10, -6, -8);
    scene.add(rimLight);

    // Fill Light (Subtle Cinema Teal)
    const fillLight = new THREE.DirectionalLight(0x70b8ff, 1.2);
    fillLight.position.set(-8, 8, 6);
    scene.add(fillLight);

    // ── Materials ─────────────────────────────────────────────────────
    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a359, // Gold / brass
      metalness: 0.9,
      roughness: 0.22,
    });

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Dark charcoal leatherette
      metalness: 0.3,
      roughness: 0.65,
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7,
      metalness: 0.95,
      roughness: 0.15,
    });

    const lensGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 1.2,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      ior: 1.52,
    });

    const darkMetal = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.8,
      roughness: 0.35,
    });

    const redAccent = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.6,
      roughness: 0.3,
    });

    // ── Build 3D Rangefinder Camera Geometry ──────────────────────────
    // 1. Main Body Chassis
    const bodyGeom = new THREE.BoxGeometry(4.0, 2.5, 1.35);
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMaterial);
    bodyMesh.position.set(0, 0, -0.4);
    cameraMaster.add(bodyMesh);

    // Top Plate Deck (Brushed Brass)
    const topPlateGeom = new THREE.BoxGeometry(4.04, 0.45, 1.38);
    const topPlateMesh = new THREE.Mesh(topPlateGeom, brassMaterial);
    topPlateMesh.position.set(0, 1.32, -0.4);
    cameraMaster.add(topPlateMesh);

    // Bottom Base Plate
    const basePlateGeom = new THREE.BoxGeometry(4.04, 0.25, 1.38);
    const basePlateMesh = new THREE.Mesh(basePlateGeom, brassMaterial);
    basePlateMesh.position.set(0, -1.3, -0.4);
    cameraMaster.add(basePlateMesh);

    // Viewfinder Prism Housing (Top Left)
    const vfGeom = new THREE.BoxGeometry(1.2, 0.55, 0.9);
    const vfMesh = new THREE.Mesh(vfGeom, brassMaterial);
    vfMesh.position.set(-1.1, 1.7, -0.45);
    cameraMaster.add(vfMesh);

    // Viewfinder Front Glass Window
    const vfGlassGeom = new THREE.BoxGeometry(0.5, 0.35, 0.05);
    const vfGlass = new THREE.Mesh(vfGlassGeom, lensGlassMaterial);
    vfGlass.position.set(-1.1, 1.7, 0.02);
    cameraMaster.add(vfGlass);

    // Rangefinder Round Window
    const rfWindow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.1, 24),
      lensGlassMaterial,
    );
    rfWindow.rotation.x = Math.PI / 2;
    rfWindow.position.set(0.1, 1.7, 0.02);
    cameraMaster.add(rfWindow);

    // Shutter Speed Dial (Top Right)
    const dialGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 32);
    const dialMesh = new THREE.Mesh(dialGeom, darkMetal);
    dialMesh.position.set(1.15, 1.65, -0.45);
    cameraMaster.add(dialMesh);

    // Shutter Release Button
    const shutterBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.45, 24),
      chromeMaterial,
    );
    shutterBtn.position.set(1.68, 1.62, -0.35);
    cameraMaster.add(shutterBtn);

    // Red Studio Badge on Front
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 32), redAccent);
    badge.rotation.x = Math.PI / 2;
    badge.position.set(-1.45, 0.65, 0.3);
    cameraMaster.add(badge);

    // ── 2. The 3D Lens Barrel (Protruding Forward) ───────────────────
    const lensGroup = new THREE.Group();
    lensGroup.position.set(0.25, -0.05, 0.25);
    cameraMaster.add(lensGroup);

    // Lens Mount Collar (Flange)
    const mountRing = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.45, 0.35, 48),
      chromeMaterial,
    );
    mountRing.rotation.x = Math.PI / 2;
    mountRing.position.z = 0.15;
    lensGroup.add(mountRing);

    // Aperture Selection Ring
    const apRing = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.45, 48),
      brassMaterial,
    );
    apRing.rotation.x = Math.PI / 2;
    apRing.position.z = 0.55;
    lensGroup.add(apRing);

    // Knurled Focus Helicoid Barrel
    const focusBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(1.32, 1.32, 0.85, 48),
      darkMetal,
    );
    focusBarrel.rotation.x = Math.PI / 2;
    focusBarrel.position.z = 1.15;
    lensGroup.add(focusBarrel);

    // 24 Knurled vertical grip bars around the focus barrel
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.06), brassMaterial);
      bar.position.set(Math.cos(angle) * 1.33, Math.sin(angle) * 1.33, 1.15);
      bar.rotation.z = angle;
      lensGroup.add(bar);
    }

    // Front Filter Ring & Engraved Hood
    const frontBezel = new THREE.Mesh(
      new THREE.CylinderGeometry(1.38, 1.32, 0.45, 48),
      brassMaterial,
    );
    frontBezel.rotation.x = Math.PI / 2;
    frontBezel.position.z = 1.75;
    lensGroup.add(frontBezel);

    // Front Curved Aspherical Glass Element
    const lensGlassGeom = new THREE.SphereGeometry(1.28, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.32);
    const frontGlass = new THREE.Mesh(lensGlassGeom, lensGlassMaterial);
    frontGlass.position.z = 1.62;
    frontGlass.scale.set(1, 1, 0.5);
    lensGroup.add(frontGlass);

    // Internal Aperture Iris Blades (Expand/Contract on scroll!)
    const apertureBladesGroup = new THREE.Group();
    apertureBladesGroup.position.z = 0.9;
    lensGroup.add(apertureBladesGroup);

    const blades: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.02), darkMetal);
      blade.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.45, 0);
      blade.rotation.z = angle + 0.3;
      apertureBladesGroup.add(blade);
      blades.push(blade);
    }

    // ── Scroll Tracking & 3D Waypoints ────────────────────────────────
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
        stateRef.current.orbitY += dx * 0.01;
        stateRef.current.orbitX += dy * 0.01;
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

    // Initial scroll sync
    onScroll();

    // ── 3D Waypoints along the scroll journey ─────────────────────────
    const waypoints = [
      // 0.00: Hero — Front facing, floating proudly, breathing
      { p: 0.0, pos: [0.0, -0.2, 0.2], rot: [0.12, -0.22, 0.05], scale: 1.15, iris: 1.0 },

      // 0.20: Dial & Frequency — Banks slightly right, revealing dials
      { p: 0.2, pos: [1.8, 0.1, -0.2], rot: [0.22, 0.65, -0.08], scale: 1.05, iris: 0.8 },

      // 0.40: Services — Banks over to the right side, showing side profile & lens
      { p: 0.4, pos: [2.5, -0.3, -0.6], rot: [0.35, -1.15, 0.18], scale: 0.95, iris: 0.65 },

      // 0.65: Selected Work Gallery — Sweeps across to the left, dynamic angle
      { p: 0.65, pos: [-2.6, 0.2, -0.4], rot: [-0.18, 1.35, -0.12], scale: 0.92, iris: 0.5 },

      // 0.82: Optical System — Dramatic macro zoom into the front lens element!
      { p: 0.82, pos: [0.0, 0.0, 1.2], rot: [-0.05, -0.15, 0.35], scale: 1.45, iris: 0.3 },

      // 1.00: CTA Band — Snaps directly forward into focus, ready for the shoot
      { p: 1.0, pos: [0.0, -0.4, 0.5], rot: [0.08, 0.02, 0.0], scale: 1.2, iris: 1.0 },
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

      // Smooth cosine easing
      const eased = (1 - Math.cos(factor * Math.PI)) / 2;

      const posX = THREE.MathUtils.lerp(w1.pos[0], w2.pos[0], eased);
      const posY = THREE.MathUtils.lerp(w1.pos[1], w2.pos[1], eased);
      const posZ = THREE.MathUtils.lerp(w1.pos[2], w2.pos[2], eased);

      const rotX = THREE.MathUtils.lerp(w1.rot[0], w2.rot[0], eased);
      const rotY = THREE.MathUtils.lerp(w1.rot[1], w2.rot[1], eased);
      const rotZ = THREE.MathUtils.lerp(w1.rot[2], w2.rot[2], eased);

      const scale = THREE.MathUtils.lerp(w1.scale, w2.scale, eased);
      const iris = THREE.MathUtils.lerp(w1.iris, w2.iris, eased);

      return { posX, posY, posZ, rotX, rotY, rotZ, scale, iris };
    };

    // ── 60fps Physics & Render Loop ───────────────────────────────────
    let animId: number;
    let clock = 0;

    const tick = () => {
      clock += 0.015;
      const s = stateRef.current;

      // Smooth lerp scroll progress
      s.scrollProgress += (s.targetProgress - s.scrollProgress) * 0.085;

      // Smooth lerp mouse parallax
      s.mouseX += (s.targetMouseX - s.mouseX) * 0.06;
      s.mouseY += (s.targetMouseY - s.mouseY) * 0.06;

      const cur = interpolateTrajectory(s.scrollProgress);

      // Subtle breathing floating motion
      const breathY = Math.sin(clock * 1.5) * 0.06;
      const breathRot = Math.cos(clock * 1.2) * 0.02;

      if (!isInteractive) {
        cameraMaster.position.set(
          cur.posX + s.mouseX * 0.35,
          cur.posY - s.mouseY * 0.25 + breathY,
          cur.posZ,
        );

        cameraMaster.rotation.set(
          cur.rotX - s.mouseY * 0.18 + breathRot,
          cur.rotY + s.mouseX * 0.25,
          cur.rotZ,
        );

        cameraMaster.scale.setScalar(cur.scale);
      } else {
        // Interactive Orbit Mode
        cameraMaster.rotation.set(s.orbitX, s.orbitY, 0);
        cameraMaster.position.set(0, breathY, 0.4);
      }

      // Rotate aperture blades on scroll
      blades.forEach((b, i) => {
        const baseAngle = (i / 8) * Math.PI * 2;
        b.rotation.z = baseAngle + (1 - cur.iris) * 0.8;
      });

      // Shutter release button subtle animation
      shutterBtn.position.y = 1.62 - (s.scrollProgress > 0.95 ? 0.08 : 0);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [isInteractive]);

  return (
    <>
      {/* ── Fixed Fullscreen 3D Canvas Stage ────────────────────────── */}
      <div
        ref={mountRef}
        aria-hidden
        className={`fixed inset-0 z-[15] overflow-hidden ${
          isInteractive ? "pointer-events-auto cursor-grab active:cursor-grabbing" : "pointer-events-none"
        }`}
      />

      {/* ── Floating 3D Camera Telemetry & Controller Widget ────────── */}
      <div className="fixed bottom-6 left-6 z-[80] hidden sm:flex items-center gap-3 select-none">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/85 border border-gold/40 text-gold shadow-2xl backdrop-blur-md font-mono text-[10px] tracking-widest">
          <span className="flex items-center gap-1.5 font-semibold">
            <Camera className="size-3.5 text-gold animate-pulse" />
            <span>3D CAM SCROLL</span>
          </span>
          <span className="w-px h-3 bg-gold/30" />
          <span className="text-foreground/80">{scrollPercent}% TRAVEL</span>
          <span className="w-px h-3 bg-gold/30" />
          <button
            type="button"
            onClick={() => setIsInteractive((v) => !v)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              isInteractive ? "bg-gold text-black font-bold" : "hover:text-white text-gold/80"
            }`}
            title="Toggle 3D Orbit Control"
          >
            <Orbit className="size-3" />
            <span>{isInteractive ? "ORBIT ON" : "DRAG 3D"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
