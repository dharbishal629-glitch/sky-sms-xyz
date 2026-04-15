import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

type RevealVariant = "up" | "left" | "right" | "scale";

const variantClass: Record<RevealVariant, string> = {
  up: "reveal",
  left: "reveal-left",
  right: "reveal-right",
  scale: "reveal-scale",
};

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function Reveal({ children, variant = "up", delay = 0, className = "", as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${variantClass[variant]} ${inView ? "in-view" : ""} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
