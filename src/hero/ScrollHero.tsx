import { useEffect, useRef, useState, useCallback } from 'react';
import './ScrollHero.css';

interface FrameCache {
  [key: number]: HTMLImageElement | null;
}

const TOTAL_FRAMES = 120;
const PRELOAD_DISTANCE = 5; // preload 5 frames ahead/behind
const INITIAL_PRELOAD = 10; // preload first 10 frames on load

export function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCache = useRef<FrameCache>({});
  const [isVisible, setIsVisible] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(1);
  // Bumped whenever an async image load completes. frameCache/loadedFramesRef
  // are refs (mutating them doesn't trigger a re-render), so without this the
  // draw effect below — which only depends on currentFrame — never re-runs
  // once a frame finishes loading after the initial (placeholder) paint.
  const [loadVersion, setLoadVersion] = useState(0);
  const animationFrameRef = useRef<number>(0);
  const loadedFramesRef = useRef<Set<number>>(new Set());

  // Preload frames progressively
  const preloadFrames = useCallback((frameNumbers: number[]) => {
    frameNumbers.forEach((frameNum) => {
      if (loadedFramesRef.current.has(frameNum)) return;
      if (frameNum < 1 || frameNum > TOTAL_FRAMES) return;

      const frameStr = String(frameNum).padStart(4, '0');
      const img = new Image();
      img.src = `/hero-frames/frame-${frameStr}.jpg`;
      img.onload = () => {
        frameCache.current[frameNum] = img;
        loadedFramesRef.current.add(frameNum);
        setLoadVersion((v) => v + 1);
      };
      img.onerror = () => {
        console.warn(`Failed to load frame ${frameNum}`);
      };
    });
  }, []);

  // Handle scroll to update frame
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const containerTop = container.offsetTop;
    const containerBottom = containerTop + container.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    // Only update frames if we're within the hero section
    if (scrollTop < containerTop || scrollTop > containerBottom) {
      return;
    }

    // Calculate progress within the hero section (0..1)
    const scrollWithinContainer = scrollTop - containerTop;
    const maxScroll = container.scrollHeight - viewportHeight;
    const progress = Math.max(0, Math.min(1, scrollWithinContainer / maxScroll));

    // Map to frame number (1-120)
    const frameNum = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(progress * (TOTAL_FRAMES - 1)) + 1));
    setCurrentFrame(frameNum);

    // Preload nearby frames
    const nearbyFrames: number[] = [];
    for (let i = frameNum - PRELOAD_DISTANCE; i <= frameNum + PRELOAD_DISTANCE; i++) {
      if (i >= 1 && i <= TOTAL_FRAMES) {
        nearbyFrames.push(i);
      }
    }
    preloadFrames(nearbyFrames);
  }, [preloadFrames]);

  // Draw frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cachedImage = frameCache.current[currentFrame];
    if (cachedImage) {
      ctx.drawImage(cachedImage, 0, 0);
    } else {
      // Draw placeholder if frame not loaded yet
      ctx.fillStyle = '#04070d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentFrame, loadVersion]);

  // Setup IntersectionObserver to pause rendering when off-screen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Setup scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Animation loop: only run when visible
  useEffect(() => {
    if (!isVisible) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const tick = () => {
      // Just keep the loop alive, actual rendering happens via canvas update effect
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible]);

  // Initial preload of first N frames
  useEffect(() => {
    const initialFrames = Array.from({ length: INITIAL_PRELOAD }, (_, i) => i + 1);
    preloadFrames(initialFrames);
  }, [preloadFrames]);

  return (
    <div className="hero-section" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="hero-canvas"
        width={1280}
        height={720}
      />
      {import.meta.env.DEV && (
        <div className="hero-debug">
          Frame: {currentFrame} / {TOTAL_FRAMES} | Loaded: {loadedFramesRef.current.size}
        </div>
      )}
    </div>
  );
}
