"use client";

import { useEffect, useMemo, useRef } from "react";

export type DeviceClass = "low" | "mid" | "high";

export type AnimationConfig = {
  deviceClass: DeviceClass;
  easeStandard: "easeOut" | "easeIn" | "linear" | [number, number, number, number];
  easeEmphasized: [number, number, number, number];
  enter: number;
  hover: number;
  tap: number;
  pageTransition: number;
  overlay: number;
  marqueeDuration: number;
};

function detectDeviceClass(): DeviceClass {
  if (typeof window === "undefined") return "mid";

  const navigatorWithDeviceMemory = navigator as Navigator & {
    deviceMemory?: number;
  };

  const navigatorWithConnection = navigator as Navigator & {
    connection?: { effectiveType?: string };
  };

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = navigatorWithDeviceMemory.deviceMemory ?? 4; // in GB (rough)
  const connection = navigatorWithConnection.connection;
  const netType: string | undefined = connection?.effectiveType;

  const slowNet = netType && (netType.includes("2g") || netType.includes("3g"));

  if (cores >= 8 && memory >= 8 && !slowNet) return "high";
  if (cores <= 4 || memory <= 4 || slowNet) return "low";
  return "mid";
}

function buildConfig(dc: DeviceClass): AnimationConfig {
  switch (dc) {
    case "low":
      return {
        deviceClass: dc,
        easeStandard: "easeOut",
        easeEmphasized: [0.33, 1, 0.68, 1],
        enter: 0.4,
        hover: 0.15,
        tap: 0.12,
        pageTransition: 0.25,
        overlay: 0.35,
        marqueeDuration: 36,
      };
    case "high":
      return {
        deviceClass: dc,
        easeStandard: [0.45, 0.05, 0.55, 0.95],
        easeEmphasized: [0.2, 0, 0, 1],
        enter: 0.65,
        hover: 0.22,
        tap: 0.18,
        pageTransition: 0.35,
        overlay: 0.55,
        marqueeDuration: 24,
      };
    default:
      return {
        deviceClass: dc,
        easeStandard: "easeOut",
        easeEmphasized: [0.45, 0.05, 0.55, 0.95],
        enter: 0.55,
        hover: 0.2,
        tap: 0.15,
        pageTransition: 0.3,
        overlay: 0.5,
        marqueeDuration: 30,
      };
  }
}

let cached: AnimationConfig | null = null;

export function getAnimationConfig(): AnimationConfig {
  if (cached) return cached;
  const dc = detectDeviceClass();
  cached = buildConfig(dc);
  return cached;
}

export function useAnimationConfig() {
  const configRef = useRef<AnimationConfig | null>(null);
  if (!configRef.current) {
    configRef.current = getAnimationConfig();
  }

  const cfg = configRef.current;

  // Expose as CSS vars for optional styling hooks
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--anim-enter", String(cfg.enter));
    root.style.setProperty("--anim-hover", String(cfg.hover));
    root.style.setProperty("--anim-tap", String(cfg.tap));
    root.style.setProperty("--anim-page", String(cfg.pageTransition));
    root.style.setProperty("--anim-overlay", String(cfg.overlay));
    root.style.setProperty("--anim-marquee", String(cfg.marqueeDuration));
    root.style.setProperty("--anim-device", cfg.deviceClass);
  }, [cfg]);

  return useMemo(() => cfg, [cfg]);
}

