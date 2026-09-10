import { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedBufferGeometry, InstancedBufferAttribute, Points, PointsMaterial } from "three";
import { useAppStore } from "../store/useAppStore";

interface Particle {
  position: [number, number, number];
  velocity: [number, number, number];
  lifetime: number;
  maxLifetime: number;
  color: [number, number, number];
}

/**
 * Lightweight confetti/fireworks burst effect triggered on goal scoring.
 * Uses InstancedBufferGeometry for particles (max 120 per burst).
 * OPTIMIZED: Caps particles, properly disposes resources, quality-gated to medium/high.
 * Lifecycle: disposes geometry/material when quality changes or component unmounts.
 */
export function Confetti() {
  const quality = useAppStore((s) => s.quality);
  const prevScoreRef = useRef<{ left: number; right: number }>({ left: 0, right: 0 });
  
  const pointsRef = useRef<Points>(null);
  const particlesRef = useRef<Particle[]>([]);
  const geometryRef = useRef<InstancedBufferGeometry | null>(null);
  const materialRef = useRef<PointsMaterial | null>(null);
  
  const { geometry, material } = useMemo(() => {
    // Clean up old resources if quality changed
    if (geometryRef.current) {
      geometryRef.current.dispose();
      geometryRef.current = null;
    }
    if (materialRef.current) {
      materialRef.current.dispose();
      materialRef.current = null;
    }
    particlesRef.current = [];

    // Skip on low quality
    if (quality === "low") {
      return { geometry: null, material: null };
    }

    // Create instanced geometry for particles (max 120 particles per burst)
    const geo = new InstancedBufferGeometry();
    
    // Base position and color buffer (dummy, will be overwritten)
    const positions = new Float32Array([0, 0, 0]);
    geo.setAttribute("position", new InstancedBufferAttribute(positions, 3, false));
    
    // Instance attributes (updated each frame)
    const maxParticles = 120;
    const instancePositions = new Float32Array(maxParticles * 3);
    const instanceColors = new Float32Array(maxParticles * 3);
    
    geo.setAttribute("aInstancePosition", new InstancedBufferAttribute(instancePositions, 3, true));
    geo.setAttribute("aInstanceColor", new InstancedBufferAttribute(instanceColors, 3, true));
    
    // Create material with instanced rendering
    const mat = new PointsMaterial({
      size: 0.3,
      sizeAttenuation: true,
      transparent: true,
    });

    geometryRef.current = geo;
    materialRef.current = mat;

    return { geometry: geo, material: mat };
  }, [quality]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
        geometryRef.current = null;
      }
      if (materialRef.current) {
        materialRef.current.dispose();
        materialRef.current = null;
      }
      particlesRef.current = [];
    };
  }, []);

  // Burst confetti on goal
  useEffect(() => {
    const leftGoals = useAppStore.getState().leftGoals;
    const rightGoals = useAppStore.getState().rightGoals;
    
    const prevLeft = prevScoreRef.current.left;
    const prevRight = prevScoreRef.current.right;
    
    if (leftGoals > prevLeft || rightGoals > prevRight) {
      burstConfetti();
      prevScoreRef.current = { left: leftGoals, right: rightGoals };
    }
  });

  const burstConfetti = () => {
    if (quality === "low" || !geometry) return;
    
    // Create 80-120 particles, but enforce max cap to prevent unbounded growth
    const newParticleCount = Math.min(80 + Math.random() * 40, 120 - particlesRef.current.length);
    if (newParticleCount <= 0) return; // Already at max
    
    const confettiColors = [
      [1, 0, 0],      // Red
      [0, 1, 0],      // Green
      [0, 0, 1],      // Blue
      [1, 1, 0],      // Yellow
      [1, 0, 1],      // Magenta
      [0, 1, 1],      // Cyan
      [1, 0.5, 0],    // Orange
      [1, 1, 1],      // White
    ];

    for (let i = 0; i < newParticleCount; i++) {
      // Burst origin: above crowd, center, with some random spread
      const originX = (Math.random() - 0.5) * 10;
      const originY = 45;
      const originZ = (Math.random() - 0.5) * 40;

      // Random velocity in all directions (mostly upward)
      const speed = 15 + Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.3) * Math.PI * 0.5;

      const velocity: [number, number, number] = [
        Math.cos(angle) * Math.cos(elevation) * speed,
        Math.abs(Math.sin(elevation) * speed) + 5,
        Math.sin(angle) * Math.cos(elevation) * speed,
      ];

      // Random color
      const colorChoice = confettiColors[Math.floor(Math.random() * confettiColors.length)];

      particlesRef.current.push({
        position: [originX, originY, originZ],
        velocity,
        lifetime: 0,
        maxLifetime: 2 + Math.random() * 1.5,
        color: colorChoice as [number, number, number],
      });
    }
  };

  // Update particles each frame
  useFrame(() => {
    if (quality === "low" || !geometry || !pointsRef.current) return;

    const deltaTime = 1 / 60; // Assume 60fps
    const gravity = 9.8;
    const particles = particlesRef.current;

    // Update particle positions and physics
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.lifetime += deltaTime;

      // Skip dead particles (don't update, but keep in array for now)
      if (p.lifetime >= p.maxLifetime) {
        continue;
      }

      // Apply gravity to velocity
      p.velocity[1] -= gravity * deltaTime;

      // Update position
      p.position[0] += p.velocity[0] * deltaTime;
      p.position[1] += p.velocity[1] * deltaTime;
      p.position[2] += p.velocity[2] * deltaTime;
    }

    // Remove dead particles (optimize array size)
    const deadCount = particles.filter((p) => p.lifetime >= p.maxLifetime).length;
    if (deadCount > 0) {
      particlesRef.current = particles.filter((p) => p.lifetime < p.maxLifetime);
    }

    // Update instanced attributes (only for live particles)
    const positionAttribute = geometry.getAttribute("aInstancePosition") as InstancedBufferAttribute;
    const colorAttribute = geometry.getAttribute("aInstanceColor") as InstancedBufferAttribute;

    const posArray = positionAttribute.array as Float32Array;
    const colorArray = colorAttribute.array as Float32Array;

    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];
      posArray[i * 3] = p.position[0];
      posArray[i * 3 + 1] = p.position[1];
      posArray[i * 3 + 2] = p.position[2];

      colorArray[i * 3] = p.color[0];
      colorArray[i * 3 + 1] = p.color[1];
      colorArray[i * 3 + 2] = p.color[2];
    }

    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;

    // Update points count to match active particle count
    (geometry as InstancedBufferGeometry).instanceCount = particlesRef.current.length;
  });

  if (quality === "low" || !geometry || !material) {
    return null;
  }

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}
