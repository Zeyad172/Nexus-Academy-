import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className={`animate-reveal w-full pb-8 -mb-8 ${className}`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
