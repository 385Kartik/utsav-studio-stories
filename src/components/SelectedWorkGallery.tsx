import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { selectedWorkItems, galleryItems, type GalleryItem } from "@/lib/media";
import { OutlineButton } from "@/components/buttons";

export function SelectedWorkGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const transitionLineRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const col3Ref = useRef<HTMLDivElement>(null);
  const col4Ref = useRef<HTMLDivElement>(null);
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

  const current = lightbox !== null ? selectedWorkItems[lightbox] : null;

  const col1 = selectedWorkItems.filter((_, i) => i % 4 === 0);
  const col2 = selectedWorkItems.filter((_, i) => i % 4 === 1);
  const col3 = selectedWorkItems.filter((_, i) => i % 4 === 2);
  const col4 = selectedWorkItems.filter((_, i) => i % 4 === 3);

  const renderCard = (item: GalleryItem, globalIdx: number, aspect: string) => (
    <div key={globalIdx} className="group relative flex flex-col mb-5 md:mb-7">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setLightbox(globalIdx)}
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

  return (
    <section
      ref={sectionRef}
      className="relative bg-background pt-8 pb-16 md:pt-12 md:pb-24 border-t border-border/40"
    >
      {/* ------------------------------------------------------------ */}
      {/* Scroll Motion Line: Archive Showcase                          */}
      {/* ------------------------------------------------------------ */}
      <div className="mx-auto max-w-7xl px-6 mb-4">
        <div className="relative flex items-center justify-center">
          <div
            ref={transitionLineRef}
            className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent transition-transform duration-75 will-change-transform"
            style={{ transformOrigin: "center" }}
          />
          <div className="absolute flex items-center gap-2 bg-background px-4 py-1 border border-border/80 rounded-full shadow-md text-[10px] uppercase tracking-[0.35em] text-gold font-mono">
            <span className="size-1.5 rounded-full bg-gold animate-pulse" />
            <span>Archive Showcase</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Background text "Selected Work" with scroll-driven fade out   */}
      {/* ------------------------------------------------------------ */}
      <div className="pointer-events-none sticky top-[24vh] z-0 flex flex-col items-center justify-center text-center px-4 will-change-transform select-none">
        <div ref={bgTextRef} className="flex flex-col items-center justify-center transition-all duration-75">
          <h2 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[11vw] font-light leading-none tracking-tight text-foreground/75">
            Selected Work
          </h2>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Foreground Photos Grid (Staggered Column Parallax Scroll)    */}
      {/* ------------------------------------------------------------ */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-10 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-start">
          <div ref={col1Ref} className="flex flex-col will-change-transform">
            {col1.map((item, idx) =>
              renderCard(item, idx * 4, idx % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"),
            )}
          </div>

          <div ref={col2Ref} className="flex flex-col will-change-transform md:pt-8">
            {col2.map((item, idx) =>
              renderCard(item, idx * 4 + 1, idx % 2 === 0 ? "aspect-[4/5]" : "aspect-[3/4]"),
            )}
          </div>

          <div ref={col3Ref} className="flex flex-col will-change-transform md:pt-4">
            {col3.map((item, idx) =>
              renderCard(item, idx * 4 + 2, idx % 2 === 0 ? "aspect-square" : "aspect-[4/5]"),
            )}
          </div>

          <div ref={col4Ref} className="flex flex-col will-change-transform md:pt-12">
            {col4.map((item, idx) =>
              renderCard(item, idx * 4 + 3, idx % 2 === 0 ? "aspect-[3/4]" : "aspect-square"),
            )}
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <OutlineButton to="/portfolio">
            Explore All Categories ({galleryItems.length}+ Frames)
          </OutlineButton>
        </div>
      </div>

      {/* Lightbox for full-size viewing */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          className="fixed inset-0 z-[120] flex flex-col bg-background/95 backdrop-blur-md"
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
