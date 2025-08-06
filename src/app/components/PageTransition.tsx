'use client';

import { motion, AnimatePresence, easeInOut } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const slideVariants = {
  initial: {
    x: '100%',
    opacity: 0,
    scale: 0.95,
  },
  in: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  out: {
    x: '-100%',
    opacity: 0,
    scale: 1.05,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: easeInOut, // Use the imported easing function
  duration: 0.8,
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={slideVariants}
        transition={pageTransition}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
