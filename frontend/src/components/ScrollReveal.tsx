import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AnimationType = 
  | "fade-in" 
  | "slide-up" 
  | "slide-down" 
  | "slide-left" 
  | "slide-right" 
  | "zoom-in" 
  | "zoom-out";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number; // in milliseconds
  duration?: number; // in milliseconds
  className?: string;
  once?: boolean;
  threshold?: number;
  distance?: string; // for slide animations
}

const ScrollReveal = ({
  children,
  animation = "fade-in",
  delay = 0,
  duration = 700,
  className = "",
  once = true,
  threshold = 0.1,
  distance = "20px",
}: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [once, threshold]);

  const getAnimationClass = () => {
    if (!isVisible) return "opacity-0";
    
    switch (animation) {
      case "fade-in": return "animate-in fade-in";
      case "slide-up": return "animate-in fade-in slide-in-from-bottom-5";
      case "slide-down": return "animate-in fade-in slide-in-from-top-5";
      case "slide-left": return "animate-in fade-in slide-in-from-right-5";
      case "slide-right": return "animate-in fade-in slide-in-from-left-5";
      case "zoom-in": return "animate-in fade-in zoom-in-95";
      case "zoom-out": return "animate-in fade-in zoom-in-105";
      default: return "animate-in fade-in";
    }
  };

  return (
    <div
      ref={ref}
      className={cn(getAnimationClass(), className)}
      style={{ 
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
