"use client";

import { motion, useSpring } from "motion/react";
import { useRef, type ComponentProps } from "react";

type MagneticButtonProps = ComponentProps<typeof motion.button> & {
  /** Cursor distance (px) from center within which the pull activates. */
  range?: number;
  /** Fraction of cursor offset the button travels toward. */
  strength?: number;
};

export function MagneticButton({
  range = 32,
  strength = 0.3,
  className,
  children,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const springConfig = { stiffness: 200, damping: 18, mass: 0.4 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  function handleMouseMove(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);

    if (distance < range) {
      x.set((event.clientX - centerX) * strength);
      y.set((event.clientY - centerY) * strength);
    } else {
      x.set(0);
      y.set(0);
    }
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.92 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
