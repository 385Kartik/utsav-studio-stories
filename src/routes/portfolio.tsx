import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { animate, stagger } from "animejs";
import { AnimatedTitle, Reveal } from "@/components/motion";
import { galleryItems } from "@/lib/media";
import { AnimeTiltCard } from "@/components/AnimeTiltCard";

interface PortfolioSearch {
  category?: string;
}

export const Route = createFileRoute("/portfolio")({
  validateSearch: (search: Record<string, unknown>): PortfolioSearch => {
    return {
      category: typeof search.category === "string" ? search.category : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Portfolio — Devoraaa Studio, Mira Road East" },
      {
        name: "description",
        content:
          "Selected wedding, pre-wedding, maternity, kids, birthday and cinematic film frames from Devoraaa Studio, Mira Road East.",
      },
      { property: "og:title", content: "Portfolio — Selected Frames by Devoraaa Studio" },
      {
        property: "og:description",
        content: "Weddings, portraits and cinematic films — selected frames from the studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

const filters = ["All", "Wedding", "Pre-Wedding", "Portraits", "Films"] as const;

function normalizeCategory(cat?: string): (typeof filters)[number] {
  if (!cat) return "All";
  const lower = cat.toLowerCase();
  if (lower.includes("pre")) return "Pre-Wedding";
  if (lower.includes("wed") || lower.includes("shaadi") || lower.includes("vow")) return "Wedding";
  if (
    lower.includes("portrait") ||
    lower.includes("matern") ||
    lower.includes("kid") ||
    lower.includes("birth") ||
    lower.includes("fam") ||
    lower.includes("baby")
  ) {
    return "Portraits";
  }
  if (lower.includes("film") || lower.includes("cine") || lower.includes("video")) return "Films";
  return "All";
}

const aspectCycle = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[3/4]"];

function Portfolio() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filter, setFilter] = useState<(typeof filters)[number]>(() =>
    normalizeCategory(search.category),
  );
  const [lightbox, setLightbox] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lightboxImgRef = useRef<HTMLImageElement>(null);

  // Sync state if URL search param changes
  useEffect(() => {
    if (search.category) {
      setFilter(normalizeCategory(search.category));
    }
  }, [search.category]);

  const handleFilterChange = (f: (typeof filters)[number]) => {
    setFilter(f);
    navigate({
      search: { category: f === "All" ? undefined : f },
      replace: true,
    });
  };

  const items =
    filter === "All" ? galleryItems : galleryItems.filter((g) => g.category === filter);

  // Anime.js Staggered Wave animation when filter changes
  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.children;
      if (cards.length > 0) {
        animate(cards, {
          opacity: [0, 1],
          translateY: [35, 0],
          scale: [0.95, 1],
          delay: stagger(45),
          duration: 520,
          ease: "outQuad",
        });
      }
    }
  }, [filter]);

  // Anime.js Lightbox Zoom on open or index change
  useEffect(() => {
    if (lightbox !== null && lightboxImgRef.current) {
      animate(lightboxImgRef.current, {
        scale: [0.92, 1],
        opacity: [0, 1],
        duration: 360,
        ease: "outQuad",
      });
    }
  }, [lightbox]);

  useEffect(() => {
    if (lightbox === null) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((v) => (v === null ? v : (v + 1) % items.length));
      if (e.key === "ArrowLeft")
        setLightbox((v) => (v === null ? v : (v - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox === null, items.length]);

  const current = lightbox === null ? null : items[lightbox];

  return (
    <main className="relative overflow-hidden">

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-[6vh] pt-40 md:px-10 md:pt-52">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.5em] text-gold font-mono">Portfolio Archive</p>
        </Reveal>
        <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight text-foreground md:text-8xl">
          <AnimatedTitle text="Selected frames" />
        </h1>
        <Reveal delay={0.15}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A curated cut of our 30-year journey — weddings, pre-weddings, portraits, and film stills.
            Click any frame to view in full resolution.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                aria-pressed={filter === f}
                className={`rounded-full border px-5 py-2 text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
                  filter === f
                    ? "border-gold bg-gold text-primary-foreground font-medium shadow-[0_0_15px_rgba(212,163,89,0.3)]"
                    : "border-border text-muted-foreground hover:border-gold hover:text-gold"
                }`}
              >
                {f}
              </button>
            ))}
            <span className="ml-2 text-xs uppercase tracking-[0.2em] text-muted-foreground/70 font-mono">
              ({items.length} frames)
            </span>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-[12vh] md:px-10">
        <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div key={`${item.title}-${i}`} className="group will-change-transform">
              <AnimeTiltCard
                onClick={() => setLightbox(i)}
                maxTilt={6}
                scale={1.025}
                hasShutterFlash={true}
              >
                <figure
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${item.title} larger`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setLightbox(i);
                  }}
                  className="cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-gold"
                  data-cursor
                >
                  <div className={`overflow-hidden rounded-sm bg-muted/20 ${aspectCycle[i % aspectCycle.length]}`}>
                    <img
                      src={item.src}
                      alt={`${item.title} — ${item.category} photography by Devoraaa Studio`}
                      loading="lazy"
                      width={1088}
                      height={1360}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="flex items-baseline justify-between border-b border-border py-4">
                    <div>
                      <span className="font-display text-xl text-foreground block">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-xs text-muted-foreground/80 mt-0.5 block">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                    <span className="text-xs uppercase tracking-[0.25em] text-gold font-mono shrink-0 ml-4">
                      {item.category}
                    </span>
                  </figcaption>
                </figure>
              </AnimeTiltCard>
            </div>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold"
          >
            Plan your shoot with us
            <ArrowUpRight
              className="size-4 transition-transform duration-500 group-hover:rotate-45"
              aria-hidden
            />
          </Link>
        </Reveal>
      </section>

      {/* Lightbox */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          className="fixed inset-0 z-[125] flex flex-col bg-background/95 backdrop-blur-md"
          onClick={() => setLightbox(null)}
        >
          <div className="flex items-center justify-between px-6 py-5 md:px-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-mono">
              {current.category} · {String((lightbox ?? 0) + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </span>
            <button
              aria-label="Close image"
              onClick={() => setLightbox(null)}
              className="flex size-10 items-center justify-center border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground hover:text-foreground"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-6 md:px-24">
            <img
              ref={lightboxImgRef}
              key={current.src}
              src={current.src}
              alt={current.title}
              className="max-h-full max-w-full object-contain rounded shadow-2xl"
            />
          </div>

          <div className="flex items-center justify-between px-6 py-5 md:px-10">
            <div>
              <span className="font-display text-xl font-light text-foreground md:text-2xl block">
                {current.title}
              </span>
              {current.subtitle && (
                <span className="text-xs text-muted-foreground mt-0.5 block font-mono">
                  {current.subtitle} · {current.year ?? "2025"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                aria-label="Previous image"
                onClick={() =>
                  setLightbox((v) => (v === null ? v : (v - 1 + items.length) % items.length))
                }
                className="flex size-10 items-center justify-center border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                aria-label="Next image"
                onClick={() => setLightbox((v) => (v === null ? v : (v + 1) % items.length))}
                className="flex size-10 items-center justify-center border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground hover:text-foreground"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
