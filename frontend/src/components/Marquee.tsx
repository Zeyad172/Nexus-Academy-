import { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  direction?: "left" | "right";
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}

const Marquee = ({
  children,
  direction = "left",
  speed = 40,
  pauseOnHover = true,
  className = "",
}: MarqueeProps) => {
  return (
    <div className={`overflow-hidden flex group ${className}`}>
      <div
        className={`flex min-w-full shrink-0 items-center justify-around gap-4 py-4 ${
          direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        {children} {/* Duplicate for seamless loop */}
      </div>
      <div
        aria-hidden="true"
        className={`flex min-w-full shrink-0 items-center justify-around gap-4 py-4 ${
          direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        {children} {/* Duplicate for seamless loop */}
      </div>
    </div>
  );
};

export default Marquee;
