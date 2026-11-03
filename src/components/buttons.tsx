import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AnimeMagneticButton } from "@/components/AnimeMagneticButton";

/* Letter-spaced caps eyebrow — muted cream, gold reserved for rare accents */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] uppercase tracking-[0.55em] text-muted-foreground ${className ?? ""}`}>
      {children}
    </p>
  );
}

/* Bordered rectangular editorial button with offset echo border */
export function OutlineButton({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimeMagneticButton distance={0.25} className="inline-block">
      <Link
        to={to}
        className={`btn-echo group inline-flex items-center gap-4 border border-foreground/40 px-10 py-4 text-[11px] uppercase tracking-[0.4em] text-foreground transition-colors duration-500 hover:border-foreground hover:bg-foreground hover:text-background ${className ?? ""}`}
      >
        {children}
        <ArrowUpRight
          className="size-4 transition-transform duration-500 group-hover:rotate-45"
          aria-hidden
        />
      </Link>
    </AnimeMagneticButton>
  );
}

/* Same treatment for external anchors (phone, WhatsApp) */
export function OutlineAnchor({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimeMagneticButton distance={0.25} className="inline-block">
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className={`btn-echo group inline-flex items-center gap-4 border border-foreground/40 px-10 py-4 text-[11px] uppercase tracking-[0.4em] text-foreground transition-colors duration-500 hover:border-foreground hover:bg-foreground hover:text-background ${className ?? ""}`}
      >
        {children}
        <ArrowUpRight
          className="size-4 transition-transform duration-500 group-hover:rotate-45"
          aria-hidden
        />
      </a>
    </AnimeMagneticButton>
  );
}
