import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { animate } from "animejs";
import { selectedWorkItems, galleryItems, type GalleryItem } from "@/lib/media";
import { OutlineButton } from "@/components/buttons";
import { AnimeTiltCard } from "@/components/AnimeTiltCard";
import { Crazy3DCard } from "@/components/Crazy3DCard";

export function SelectedWorkGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const transitionLineRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const col3Ref = useRef<HTMLDivElement>(null);
  const col4Ref = useRef<HTMLDivElement>(null);
  const lightboxImgRef = useRef<HTMLImageElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bgText = bgTextRef.current;
    const transLine = transitionLineRef.current;
    if (!section) return;

    let rafId: number;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 1. Transition bridge scroll motion
      const transDistance = windowHeight * 0.7;
      const transScrolled = windowHeight - rect.top;
      const transProgress = Math.min(1, Math.max(0, transScrolled / transDistance));

      if (transLine) {
        transLine.style.transform = `scaleX(${0.15 + transProgress * 0.85})`;
        transLine.style.opacity = String(0.2 + transProgress * 0.8);
      }

      // 2. Background "Selected Work" title parallax & gradual fade
      if (bgText) {
        const fadeStart = windowHeight * 0.2;
        const scrolledIntoPhotos = Math.max(0, -rect.top + fadeStart);
        const fadeDistance = windowHeight * 0.8;
        const fadeProgress = Math.min(1, scrolledIntoPhotos / fadeDistance);

        const opacity = Math.max(0, 0.28 * (1 - fadeProgress));
        const driftY = fadeProgress * -80;
        const scale = 1 - fadeProgress * 0.05;

        bgText.style.opacity = String(opacity);
        bgText.style.transform = `translate3d(0, ${driftY}px, 0) scale(${scale})`;
      }

      // 3. Staggered multi-speed column parallax for fluid continuous scroll motion
      const scrollOffset = rect.top;
      if (window.innerWidth >= 768) {
        if (col1Ref.current) col1Ref.current.style.transform = `translate3d(0, ${scrollOffset * -0.025}px, 0)`;
        if (col2Ref.current) col2Ref.current.style.transform = `translate3d(0, ${scrollOffset * 0.03}px, 0)`;
        if (col3Ref.current) col3Ref.current.style.transform = `translate3d(0, ${scrollOffset * -0.04}px, 0)`;
        if (col4Ref.current) col4Ref.current.style.transform = `translate3d(0, ${scrollOffset * 0.02}px, 0)`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Animate lightbox image zoom-in with Anime.js on change
  useEffect(() => {
    if (lightbox !== null && lightboxImgRef.current) {
      animate(lightboxImgRef.current, {
        scale: [0.92, 1],
        opacity: [0, 1],
        duration: 380,
        ease: "outQuad",
      });
    }
  }, [lightbox]);

  const current = lightbox !== null ? selectedWorkItems[lightbox] : null;

  const col1 = selectedWorkItems.filter((_, i) => i % 4 === 0);
  const col2 = selectedWorkItems.filter((_, i) => i % 4 === 1);
  const col3 = selectedWorkItems.filter((_, i) => i % 4 === 2);
  const col4 = selectedWorkItems.filter((_, i) => i % 4 === 3);

  const renderCard = (item: GalleryItem, globalIdx: number, aspect: string) => {
    if (globalIdx === 0 || globalIdx === 3) {
      return (
        <div key={globalIdx} className="group relative flex flex-col mb-5 md:mb-7">
          <Crazy3DCard
            src={item.src}
            title={item.title}
            category={item.category}
            frameNumber={`ARCHIVE #${String(globalIdx + 1).padStart(2, "0")}`}
            aspect={aspect}
            onClick={() => setLightbox(globalIdx)}
            showBadge={true}
          />
          <div className="mt-2 px-1 flex items-baseline justify-between text-[11px]">
            <span className="font-display text-foreground/90 truncate">{item.title}</span>
            <span className="text-[9px] uppercase tracking-wider font-mono text-gold shrink-0 ml-2">
              ✦ 3D FOLD &amp; REVOLVE
            </span>
          </div>
        </div>
      );
    }

    return (
      <div key={globalIdx} className="group relative flex flex-col mb-5 md:mb-7">
      <AnimeTiltCard
        onClick={() => setLightbox(globalIdx)}
        className="rounded-md"
        maxTilt={8}
        scale={1.03}
        hasShutterFlash={true}
      >
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setLightbox(globalIdx);
          }}
          className={`relative w-full overflow-hidden rounded-md bg-card/70 border border-border/70 shadow-xl cursor-pointer ${aspect}`}
        >
          <img
            src={item.src}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-1 rounded bg-background/90 text-gold border border-border/80">
              {item.category}
            </span>
          </div>

          <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="font-display text-sm text-foreground truncate">{item.title}</p>
            {item.subtitle && (
              <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
            )}
          </div>
        </div>
      </AnimeTiltCard>

      <div className="mt-2 px-1 flex items-baseline justify-between text-[11px]">
        <span className="font-display text-foreground/90 truncate">{item.title}</span>
        <Link
          to="/portfolio"
          search={{ category: item.category }}
          className="text-[9px] uppercase tracking-wider font-mono text-muted-foreground/75 hover:text-gold transition-colors shrink-0 ml-2"
        >
          {item.category} →
        </Link>
      </div>
    </div>
  );
};

  return (
    <section
      ref={sectionRef}
      className="relative bg-background pt-8 pb-16 md:pt-12 md:pb-24 border-t border-border/40 overflow-hidden"
    >

      {/* ------------------------------------------------------------ */}
      {/* Scroll Motion Line: Archive Showcase                          */}
      {/* ------------------------------------------------------------ */}
      <div className="mx-auto max-w-7xl px-6 mb-4">
        <div className="relative flex items-center justify-center">
          <div
            ref={transitionLineRef}
            className="h-[1px] w-full max-w-2xl bg-gradient-to-r from-transparent via-gold/60 to-transparent transition-transform duration-75 origin-center will-change-transform"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Fading Background Text: "Selected Work"                      */}
      {/* ------------------------------------------------------------ */}
      <div className="pointer-events-none sticky top-20 z-0 flex justify-center overflow-hidden py-4 select-none">
        <div
          ref={bgTextRef}
          className="font-display text-[14vw] md:text-[11vw] font-bold uppercase tracking-tight text-foreground/25 whitespace-nowrap will-change-transform transition-transform duration-75"
        >
          Selected Work
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Section Header Controls                                      */}
      {/* ------------------------------------------------------------ */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.4em] font-mono text-gold">
            Archive Highlights
          </span>
          <h2 className="mt-1 font-display text-3xl md:text-5xl font-light text-foreground tracking-tight">
            Curated Frames Collection
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground font-mono">
            36 FRAMES · 30 YEARS ARCHIVE
          </span>
          <OutlineButton to="/portfolio">
            Explore All
          </OutlineButton>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Multi-Column Masonry Grid with 4 Differently Paced Speeds     */}
      {/* ------------------------------------------------------------ */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Column 1 - Moderate upward float */}
          <div ref={col1Ref} className="will-change-transform">
            {col1.map((item, i) => {
              const globalIdx = i * 4;
              const aspects = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]"];
              return renderCard(item, globalIdx, aspects[i % aspects.length]);
            })}
          </div>

          {/* Column 2 - Downward lag */}
          <div ref={col2Ref} className="will-change-transform pt-6 md:pt-14">
            {col2.map((item, i) => {
              const globalIdx = i * 4 + 1;
              const aspects = ["aspect-[4/5]", "aspect-[3/4]", "aspect-square"];
              return renderCard(item, globalIdx, aspects[i % aspects.length]);
            })}
          </div>

          {/* Column 3 - Fast upward float */}
          <div ref={col3Ref} className="will-change-transform pt-2 md:pt-6">
            {col3.map((item, i) => {
              const globalIdx = i * 4 + 2;
              const aspects = ["aspect-square", "aspect-[3/4]", "aspect-[4/5]"];
              return renderCard(item, globalIdx, aspects[i % aspects.length]);
            })}
          </div>

          {/* Column 4 - Moderate downward lag */}
          <div ref={col4Ref} className="will-change-transform pt-8 md:pt-20">
            {col4.map((item, i) => {
              const globalIdx = i * 4 + 3;
              const aspects = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square"];
              return renderCard(item, globalIdx, aspects[i % aspects.length]);
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Bottom CTA to Full Portfolio                                 */}
      {/* ------------------------------------------------------------ */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 mt-16 md:mt-24 text-center">
        <OutlineButton to="/portfolio">
          View all categories in full archive
        </OutlineButton>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Lightbox Modal with Lens Iris Appearance                     */}
      {/* ------------------------------------------------------------ */}
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
              {String(selectedWorkItems.length).padStart(2, "0")}
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
                  {current.subtitle} · {current.year}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <Link
                to="/portfolio"
                search={{ category: current.category }}
                className="text-xs uppercase tracking-wider text-gold hover:underline mr-2 font-mono hidden sm:inline"
              >
                View all {current.category}
              </Link>
              <button
                aria-label="Previous image"
                onClick={() =>
                  setLightbox((v) =>
                    v === null ? v : (v - 1 + selectedWorkItems.length) % selectedWorkItems.length,
                  )
                }
                className="flex size-10 items-center justify-center border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                aria-label="Next image"
                onClick={() =>
                  setLightbox((v) => (v === null ? v : (v + 1) % selectedWorkItems.length))
                }
                className="flex size-10 items-center justify-center border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground hover:text-foreground"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
