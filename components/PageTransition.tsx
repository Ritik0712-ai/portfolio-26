'use client';

import { motion, MotionProps } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const transitionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={transitionVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 4, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}
