"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface TouchEffectProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  activeScale?: number;
}

export function TouchEffect({ children, activeScale = 0.97, ...props }: TouchEffectProps) {
  return (
    <motion.div
      whileTap={{ scale: activeScale }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
