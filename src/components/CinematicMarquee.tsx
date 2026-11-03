import { useRef } from "react";

const MARQUEE_ITEMS = [
  "CANDID WEDDINGS",
  "CINEMATIC FILMS",
  "PRE-WEDDING STORIES",
  "MATERNITY & BABIES",
  "FAMILY PORTRAITS",
  "ESTABLISHED 1994",
  "MIRA ROAD EAST",
  "HAND-FINISHED ALBUMS",
];

export function CinematicMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden border-y border-border/50 bg-card/60 py-4.5 backdrop-blur-md select-none my-6 z-20"
    >
      <div className="marquee-track flex gap-8 whitespace-nowrap" style={{ ["--marquee-duration" as string]: "32s" }}>
        {Array.from({ length: 2 }).map((_, repeatIdx) => (
          <div key={repeatIdx} className="flex items-center gap-8 text-xs font-mono tracking-[0.35em] text-foreground/80 shrink-0">
            {MARQUEE_ITEMS.map((item, idx) => (
              <span key={idx} className="flex items-center gap-8">
                <span className="hover:text-gold transition-colors duration-300 font-medium">
                  {item}
                </span>
                <span className="text-gold/70 text-sm">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
