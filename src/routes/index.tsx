import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AnimatedTitle,
  Counter,
  HorizontalScroll,
  ParallaxImage,
  Reveal,
  ensureGsap,
} from "@/components/motion";
import { Eyebrow, OutlineButton } from "@/components/buttons";
import { galleryItems, media, serviceGroups } from "@/lib/media";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Utsav Studio — Wedding Photography & Cinematography in Mira Road East",
      },
      {
        name: "description",
        content:
          "Candid wedding photography, cinematic films, maternity, baby and family portraits from Utsav Studio, Shanti Nagar, Mira Road East. Studio since 1994. Call +91 98193 91538.",
      },
      { property: "og:title", content: "Utsav Studio — Wedding Photography & Cinematography" },
      {
        property: "og:description",
        content: "Candid weddings, cinematic films and family portraits from Mira Road East since 1994.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <Statement />
      <FramesGallery />
      <ServicesScroller />
      <ImageWordMarquee />
      <StatsBand />
      <CtaBand />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Hero — full-bleed frame, staged reveal, slow scroll drift           */
/* ------------------------------------------------------------------ */
function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 2.35 });
      tl.from("[data-hero-img]", { scale: 1.22, duration: 3.4, ease: "power2.out" }, 0).from(
        "[data-hero-item]",
        { y: 34, opacity: 0, duration: 1.1, stagger: 0.16, ease: "power3.out" },
        0.4,
      );

      gsap.to("[data-hero-content]", {
        yPercent: 16,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-img]", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          data-hero-img
          src={media.hero}
          alt="A candid wedding moment photographed by Utsav Studio"
          className="h-full w-full object-cover will-change-transform"
          width={1920}
          height={1088}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background" />
      </div>

      <div
        data-hero-content
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p data-hero-item className="mb-7 text-[11px] uppercase tracking-[0.6em] text-foreground/80">
          Mira Road East · Est. 1994
        </p>
        <h1 className="font-display text-[14vw] font-light leading-[0.98] tracking-tight text-foreground md:text-[9.5vw]">
          <AnimatedTitle text="Utsav Studio" delay={2.55} />
        </h1>
        <span data-hero-item className="mt-8 h-px w-16 bg-foreground/40" aria-hidden />
        <p
          data-hero-item
          className="mt-8 text-xs uppercase tracking-[0.5em] text-muted-foreground"
        >
          Photography &amp; Cinematography
        </p>
      </div>

      <div
        data-hero-item
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-muted-foreground"
      >
        <span className="text-[10px] uppercase tracking-[0.45em]">Scroll</span>
        <span className="scroll-hint h-6 w-px bg-foreground/50" aria-hidden />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Statement — quiet, centered, editorial                              */
/* ------------------------------------------------------------------ */
function Statement() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-[16vh] text-center md:py-[20vh]">
      <Reveal>
        <Eyebrow>About our studio</Eyebrow>
      </Reveal>
      <h2 className="mt-8 font-display text-4xl font-light leading-[1.12] tracking-tight text-foreground md:text-6xl">
        <AnimatedTitle text="Three decades of turning fleeting moments into family heirlooms." />
      </h2>
      <Reveal delay={0.15}>
        <p className="mx-auto mt-10 max-w-xl text-base leading-relaxed text-muted-foreground">
          From the Mandap to the maternity room, Utsav Studio has been the quiet witness to Mira
          Road's biggest days — photographing them candidly, filming them cinematically, and
          finishing every frame by hand.
        </p>
      </Reveal>
      <Reveal delay={0.25}>
        <OutlineButton to="/about" className="mt-14">
          Explore the studio
        </OutlineButton>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pinned horizontal gallery — kept as-is, captions refined            */
/* ------------------------------------------------------------------ */
function FramesGallery() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 pb-12 md:px-10">
        <Reveal>
          <Eyebrow>Selected frames</Eyebrow>
        </Reveal>
        <h2 className="mt-5 font-display text-4xl font-light tracking-tight text-foreground md:text-6xl">
          <AnimatedTitle text="Stories we've told lately" />
        </h2>
      </div>
      <HorizontalScroll>
        {galleryItems.map((item, i) => (
          <figure key={item.title} className="group relative w-[74vw] shrink-0 md:w-[30vw]">
            <div className="overflow-hidden">
              <img
                src={item.src}
                alt={`${item.title} — ${item.category} photography by Utsav Studio`}
                loading="lazy"
                width={1088}
                height={1360}
                className="h-[58vh] w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04] md:h-[66vh]"
              />
            </div>
            <figcaption className="mt-5 text-center">
              <span className="block font-display text-xl text-foreground md:text-2xl">
                {item.title}
              </span>
              <span className="mt-2 block text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                {item.category} · {String(i + 1).padStart(2, "0")}
              </span>
            </figcaption>
          </figure>
        ))}
        <Link
          to="/portfolio"
          className="group flex w-[60vw] shrink-0 flex-col items-center justify-center gap-5 text-center md:w-[22vw]"
        >
          <span className="font-display text-3xl font-light text-foreground transition-colors duration-500 group-hover:text-foreground/70 md:text-4xl">
            View the full
            <br />
            portfolio
          </span>
          <ArrowUpRight
            className="size-6 text-muted-foreground transition-transform duration-500 group-hover:rotate-45"
            aria-hidden
          />
        </Link>
      </HorizontalScroll>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Services — scroll-driven list, image swaps beside it (sticky)       */
/* ------------------------------------------------------------------ */
function ServicesScroller() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-service-row]").forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self: ScrollTrigger) => {
            if (self.isActive) setActive(i);
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 py-[14vh] md:px-10">
      <div className="mb-16 max-w-2xl">
        <Reveal>
          <Eyebrow>What we do</Eyebrow>
        </Reveal>
        <h2 className="mt-5 font-display text-4xl font-light tracking-tight text-foreground md:text-6xl">
          <AnimatedTitle text="Our services" />
        </h2>
      </div>

      <div className="grid gap-14 md:grid-cols-[1.1fr_1fr] md:gap-20">
        {/* List */}
        <div className="border-t border-border">
          {serviceGroups.map((g, i) => (
            <Link
              key={g.no}
              data-service-row
              to="/services"
              className={`block border-b border-border py-9 transition-all duration-700 md:py-12 ${
                active === i ? "opacity-100" : "opacity-35 md:opacity-30"
              }`}
            >
              <span className="flex items-baseline gap-5">
                <span className="text-[10px] tracking-[0.35em] text-muted-foreground">{g.no}</span>
                <span className="font-display text-3xl font-light tracking-tight text-foreground transition-transform duration-700 md:text-5xl">
                  {g.title}
                </span>
              </span>
              <span className="mt-3 block pl-[calc(2ch+1.25rem)] text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {g.items.join(" · ")}
              </span>
            </Link>
          ))}
        </div>

        {/* Sticky swapping image (desktop) */}
        <div className="relative hidden md:block">
          <div className="sticky top-[18vh] aspect-[4/5] overflow-hidden">
            {serviceGroups.map((g, i) => (
              <img
                key={g.no}
                src={g.image}
                alt={`${g.title} by Utsav Studio`}
                loading={i === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-[900ms] ease-out ${
                  active === i ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Image + word marquee — images alternating with serif words          */
/* ------------------------------------------------------------------ */
function ImageWordMarquee() {
  const seq = [
    { word: "Weddings", img: media.wedding },
    { word: "Films", img: media.cinema },
    { word: "Portraits", img: media.family },
    { word: "Maternity", img: media.maternity },
    { word: "Kids", img: media.kids },
    { word: "Birthdays", img: media.birthday },
  ];

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {seq.map((s, i) => (
        <div key={i} className="flex items-center">
          <span className="px-8 font-display text-4xl font-light tracking-tight text-foreground md:px-12 md:text-6xl">
            {s.word}
          </span>
          <span className="h-16 w-28 shrink-0 overflow-hidden md:h-20 md:w-36">
            <img
              src={s.img}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
              width={288}
              height={160}
            />
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden border-y border-border py-10" aria-hidden>
      <div className="marquee-track" style={{ "--marquee-duration": "44s" } as CSSProperties}>
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stats band — counters over a full-bleed frame                       */
/* ------------------------------------------------------------------ */
function StatsBand() {
  return (
    <section className="relative overflow-hidden">
      <ParallaxImage
        src={media.cinema}
        alt=""
        className="absolute inset-0"
        imgClassName="opacity-30"
        speed={10}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/30 to-background" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-[18vh] text-center sm:grid-cols-3">
        {[
          { value: <Counter to={30} suffix="+" />, label: "Years of craft" },
          { value: <Counter to={4.6} decimals={1} suffix=" ★" />, label: "Rated across platforms" },
          { value: <span className="font-display">1994</span>, label: "Studio established" },
        ].map((s, i) => (
          <Reveal key={i} delay={i * 0.12} className="flex flex-col gap-3">
            <span className="font-display text-5xl font-light text-foreground md:text-6xl">
              {s.value}
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              {s.label}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA                                                                 */
/* ------------------------------------------------------------------ */
export function CtaBand() {
  return (
    <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden px-6 py-24 text-center">
      <ParallaxImage
        src={media.hero}
        alt=""
        eager={false}
        className="absolute inset-0"
        imgClassName="opacity-25"
        speed={10}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/30 to-background" />
      <div className="relative z-10 flex flex-col items-center gap-10">
        <Eyebrow>Book your date</Eyebrow>
        <h2 className="max-w-3xl font-display text-4xl font-light leading-[1.1] tracking-tight text-foreground md:text-6xl">
          <AnimatedTitle text="Your story deserves the perfect frame." />
        </h2>
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-12">
          <OutlineButton to="/contact">Book a shoot</OutlineButton>
          <a
            href="tel:+919819391538"
            className="text-sm uppercase tracking-[0.35em] text-muted-foreground underline-offset-8 transition-colors duration-500 hover:text-foreground hover:underline"
          >
            +91 98193 91538
          </a>
        </div>
      </div>
    </section>
  );
}
