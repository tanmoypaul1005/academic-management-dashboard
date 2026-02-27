'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedSection({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.9,
  className = '',
}: AnimatedSectionProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const fromVars: gsap.TweenVars = {
      fadeIn:    { opacity: 0, y: 0 },
      slideUp:   { opacity: 0, y: 14 },
      slideLeft: { opacity: 0, x: -16 },
      slideRight:{ opacity: 0, x: 16 },
      scale:     { opacity: 0, scale: 0.97 },
    }[animation];

    // Set initial state synchronously before first paint so there's no flash
    gsap.set(element, fromVars);

    gsap.to(element, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      delay,
      ease: 'sine.out',
      force3D: true,
      clearProps: 'will-change',
    });
  }, [animation, delay, duration]);

  return (
    <div ref={elementRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
