import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { useAppStore } from "../store/useAppStore";

export function SubscribeCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const quality = useAppStore((s) => s.quality);

  // Show on mount for quality > "low". Since there's no longer a one-time cinema
  // to gate on, just show it from the start (still reasonable to skip on low quality).
  const shouldShow = quality !== "low";

  useLayoutEffect(() => {
    if (!shouldShow || !ref.current) return;

    const ctx = gsap.context(() => {
      // Fade in and scale from 0.8 to 1 with slight overshoot
      gsap.from(".subscribe-cta-panel", {
        opacity: 0,
        scale: 0.8,
        y: 20,
        duration: 0.8,
        ease: "back.out(1.7)", // Overshoot effect
      });
    }, ref);

    return () => {
      ctx.revert();
    };
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div ref={ref} className="subscribe-cta-container">
      <div className="subscribe-cta-panel">
        <div className="subscribe-content">
          <h3>Join the broadcast</h3>
          <p>MATCHDAY TV</p>
          <a href="#" className="subscribe-button">
            Subscribe Now
          </a>
        </div>
      </div>
    </div>
  );
}
