// Animation utilities for consistent motion design
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

export const staggerContainerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// Card hover animations
export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { 
    y: -5, 
    scale: 1.02,
    transition: { 
      type: 'spring', 
      stiffness: 400, 
      damping: 17 
    }
  }
};

export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Button animations
export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.3 }
  }
};

// Modal animations
export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: [0.16, 1, 0.3, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

// Toast animations
export const toastSlideIn = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.16, 1, 0.3, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    x: 100,
    transition: { duration: 0.3 }
  }
};

// List item animations
export const listItem = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

// Image zoom on hover
export const imageZoom = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

// Skeleton pulse animation (CSS-based, for reference)
export const skeletonPulse = {
  background: 'linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-pulse 1.5s ease-in-out infinite'
};

// Tab underline animation
export const tabUnderline = {
  rest: { scaleX: 0 },
  active: { 
    scaleX: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};

// Accordion animations
export const accordionContent = {
  hidden: { 
    height: 0, 
    opacity: 0,
    transition: { duration: 0.3 }
  },
  visible: { 
    height: 'auto', 
    opacity: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};

// Dropdown menu animations
export const dropdownMenu = {
  hidden: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};

// Loading spinner animation
export const spinnerRotate = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear'
  }
};

// Error shake animation
export const shake = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.5 }
};

// Success checkmark animation
export const checkmark = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.16, 1, 0.3, 1] 
    }
  }
};

// Number count-up animation helper
export const countUp = (duration: number = 2) => ({
  transition: { duration, ease: [0.16, 1, 0.3, 1] }
});

// Viewport animation settings
export const viewportOnce = {
  once: true,
  margin: '-100px'
};

export const viewportAlways = {
  margin: '-50px'
};
