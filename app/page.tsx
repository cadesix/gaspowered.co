'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | undefined>(undefined);
  const animationStartTime = useRef<number>(Date.now());
  const letterRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const letterRandomness = useRef<Map<number, { strength: number; angleOffset: number; duration: number; idleDelay: number; idleDuration: number; idleAmplitude: number; idlePhase: number }>>(new Map());

  const text = "Gas is a consumer software company based in New York";
  const words = text.split(' ');

  // Generate consistent randomness for each letter
  const getLetterRandomness = useCallback((idx: number) => {
    if (!letterRandomness.current.has(idx)) {
      letterRandomness.current.set(idx, {
        strength: 0.7 + Math.random() * 0.6, // Random multiplier between 0.7-1.3
        angleOffset: (Math.random() - 0.5) * 0.6, // Random angle offset in radians
        duration: 0.6 + Math.random() * 0.4, // Random duration between 0.6s-1.0s
        idleDelay: Math.random() * 3000, // Stagger idle animations (ms)
        idleDuration: 3000 + Math.random() * 2000, // Random idle animation duration 3-5s (ms)
        idleAmplitude: 0.5 + Math.random() * 0.5, // Idle movement amplitude 0.5-1px
        idlePhase: Math.random() * Math.PI * 2, // Random starting phase
      });
    }
    return letterRandomness.current.get(idx)!;
  }, []);

  const calculateIdleOffset = useCallback((idx: number, currentTime: number) => {
    const randomness = getLetterRandomness(idx);
    const elapsed = currentTime - animationStartTime.current - randomness.idleDelay;

    if (elapsed < 0) return { x: 0, y: 0 };

    const progress = (elapsed % randomness.idleDuration) / randomness.idleDuration;
    const angle = progress * Math.PI * 2 + randomness.idlePhase;

    const idleX = Math.cos(angle) * randomness.idleAmplitude;
    const idleY = Math.sin(angle * 1.3) * randomness.idleAmplitude; // Different frequency for y

    return { x: idleX, y: idleY };
  }, [getLetterRandomness]);

  const calculateMouseOffset = useCallback((rect: DOMRect, mouseX: number, mouseY: number, idx: number) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const maxDistance = 200; // radius of effect (increased)
    const maxOffset = 60; // maximum pixels to move (increased for exaggeration)

    if (distance < maxDistance && distance > 0) {
      const randomness = getLetterRandomness(idx);

      // Use a stronger exponential force curve for more dramatic effect
      const normalizedDistance = distance / maxDistance;
      const force = Math.pow(1 - normalizedDistance, 2); // quadratic falloff

      // Calculate base angle away from cursor
      const angle = Math.atan2(-deltaY, -deltaX);

      // Add random angle offset for variation
      const randomAngle = angle + randomness.angleOffset;

      // Apply random strength multiplier
      const randomForce = force * maxOffset * randomness.strength;

      const offsetX = Math.cos(randomAngle) * randomForce;
      const offsetY = Math.sin(randomAngle) * randomForce;

      return { x: offsetX, y: offsetY };
    }

    return { x: 0, y: 0 };
  }, [getLetterRandomness]);

  const updateLetters = useCallback(() => {
    const { x, y } = mousePos.current;
    const currentTime = Date.now();

    letterRefs.current.forEach((element, idx) => {
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const mouseOffset = calculateMouseOffset(rect, x, y, idx);
      const idleOffset = calculateIdleOffset(idx, currentTime);

      // Combine both offsets - mouse takes priority, idle adds subtle movement
      const totalX = mouseOffset.x + idleOffset.x;
      const totalY = mouseOffset.y + idleOffset.y;

      element.style.transform = `translate(${totalX}px, ${totalY}px)`;
    });

    // Continue animation loop for idle animation
    rafId.current = requestAnimationFrame(updateLetters);
  }, [calculateMouseOffset, calculateIdleOffset]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Start the continuous animation loop
    rafId.current = requestAnimationFrame(updateLetters);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [updateLetters]);

  return (
    <div ref={containerRef} className="flex min-h-screen items-center justify-center bg-white px-4">
      <p className="font-serif text-black text-xl text-center max-w-5xl leading-relaxed">
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
            {word.split('').map((char, charIdx) => {
              const idx = wordIdx * 100 + charIdx;
              const randomness = getLetterRandomness(idx);

              return (
                <span
                  key={charIdx}
                  ref={(el) => {
                    if (el) {
                      letterRefs.current.set(idx, el);
                    } else {
                      letterRefs.current.delete(idx);
                    }
                  }}
                  className="inline-block"
                  style={{
                    transition: `transform ${randomness.duration}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        ))}
      </p>
    </div>
  );
}
