"use client";

import { Canvas, addEffect, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { isCapture, setExternalDriver, tick } from "@/lib/scroll/driver";
import { bus } from "@/lib/scroll/bus";
import { Scene } from "./Scene";
import { Effects } from "./Effects";
import { QualityContext, type Tier } from "./quality";

function FrameDriver() {
  useEffect(() => {
    setExternalDriver(true);
    const unsub = addEffect((t) => tick(t));
    return () => {
      unsub();
      setExternalDriver(false);
    };
  }, []);
  return null;
}

function Background() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.background = new THREE.Color("#F2F0EB");
  }, [scene]);
  return null;
}

function initialTier(): Tier {
  const q = new URLSearchParams(window.location.search).get("q");
  if (q === "high" || q === "mid" || q === "low") return q;
  if (bus.mobile) return "low";
  return "high";
}

export default function Experience() {
  const [tier, setTier] = useState<Tier>(initialTier);
  const dpr: [number, number] = tier === "high" ? [1, 2] : tier === "mid" ? [1, 1.5] : [1, 1.25];

  return (
    <QualityContext.Provider value={tier}>
      <Canvas
        className="xs-canvas"
        dpr={dpr}
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ fov: 30, near: 0.02, far: 1200, position: [2.4, 1.6, 4.2] }}
        gl={{
          antialias: tier !== "high",
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          stencil: false,
        }}
        onCreated={({ gl, scene }) => {
          if (isCapture()) (window as unknown as { __scene: THREE.Scene }).__scene = scene;
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
        aria-hidden
      >
        <FrameDriver />
        <Background />
        {!isCapture() && (
          <PerformanceMonitor
            flipflops={2}
            onDecline={() => setTier((t) => (t === "high" ? "mid" : "low"))}
          />
        )}
        <Suspense fallback={null}>
          <Scene />
          {tier === "high" && <Effects />}
        </Suspense>
      </Canvas>
    </QualityContext.Provider>
  );
}
