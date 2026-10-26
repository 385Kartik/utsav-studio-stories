import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ArrowUpRight, ChevronDown, Star } from "lucide-react";
import { gsap } from "gsap";
import {
  AnimatedTitle,
  Counter,
  HorizontalScroll,
  Marquee,
  ParallaxImage,
  Reveal,
  Magnetic,
  ensureGsap,
} from "@/components/motion";
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
      <Marquee
        items={[
          "Weddings",
          "Candid",
          "Cinematic Films",
          "Pre-Wedding",
          "Maternity",
          "Baby & Kids",
          "Birthdays",
          "Albums & Frames",
        ]}
        duration={30}
        className="border-y border-border py-5 text-sm uppercase tracking-[0.35em] text-muted-foreground md:text-base"
      />
      <Statement />
      <FramesGallery />
      <ServicesPreview />
      <CtaBand />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Hero — full-bleed frame with slow zoom, parallax and staged reveal  */
/* ------------------------------------------------------------------ */
function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ensureGsap();
    const el = ref.current!;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 2.35 });
      tl.from("[data-hero-img]", { scale: 1.28, duration: 3.2, ease: "power2.out" }, 0)
        .from("[data-hero-item]", { y: 40, opacity: 0, duration: 1, stagger: 0.14, ease: "power3.out" }, 0.4);

      gsap.to("[data-hero-content]", {
        yPercent: 18,
        opacity: 0.15,
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
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/25 to-background" />
      </div>

      <div
        data-hero-content
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p data-hero-item className="mb-6 text-xs uppercase tracking-[0.55em] text-gold md:text-sm">
          Mira Road East · Est. 1994
        </p>
        <h1 className="font-display text-[15vw] leading-[0.95] tracking-tight text-foreground md:text-[10vw]">
          <AnimatedTitle text="Utsav Studio" delay={2.55} />
        </h1>
        <p
          data-hero-item
          className="mt-6 text-xs uppercase tracking-[0.5em] text-muted-foreground md:mt-8 md:text-sm"
        >
          Photography &amp; Cinematography
        </p>
      </div>

      <div
        data-hero-item
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <ChevronDown className="size-4 animate-bounce" aria-hidden />
      </div>

      <RotatingBadge />
    </section>
  );
}

function RotatingBadge() {
  return (
    <div data-hero-item className="absolute bottom-10 right-8 z-10 hidden size-28 md:block lg:size-32">
      <svg viewBox="0 0 100 100" className="spin-slow size-full">
        <defs>
          <path id="badge-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-foreground text-[8.2px] uppercase tracking-[3px]">
          <textPath href="#badge-circle">est 1994 · 30 years of stories ·</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <Star className="size-5 fill-gold text-gold" aria-hidden />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Statement + stats                                                   */
/* ------------------------------------------------------------------ */
function Statement() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-[16vh] text-center md:py-[20vh]">
      <Reveal>
        <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">Since 1994</p>
      </Reveal>
      <h2 className="font-display text-4xl leading-[1.15] tracking-tight text-foreground md:text-6xl">
        <AnimatedTitle text="Three decades of turning fleeting moments into family heirlooms." />
      </h2>
      <Reveal delay={0.15}>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          From the Mandap to the maternity room, Utsav Studio has been the quiet witness to
          Mira Road's biggest days — photographing them candidly, filming them cinematically,
          and finishing every frame by hand.
        </p>
      </Reveal>

      <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-10 sm:grid-cols-3">
        {[
          { value: <Counter to={30} suffix="+" />, label: "Years of craft" },
          { value: <Counter to={4.6} decimals={1} suffix=" ★" />, label: "Rating across platforms" },
          { value: <span className="font-display">1994</span>, label: "Studio established" },
        ].map((s, i) => (
          <Reveal key={i} delay={i * 0.1} className="flex flex-col gap-2">
            <span className="font-display text-5xl text-gold md:text-6xl">{s.value}</span>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{s.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pinned horizontal gallery                                           */
/* ------------------------------------------------------------------ */
function FramesGallery() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 pb-10 md:px-10">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.5em] text-gold">Selected frames</p>
        </Reveal>
        <h2 className="mt-4 font-display text-4xl tracking-tight text-foreground md:text-6xl">
          <AnimatedTitle text="Stories we've told lately" />
        </h2>
      </div>
      <HorizontalScroll>
        {galleryItems.map((item, i) => (
          <figure key={item.title} className="group relative w-[74vw] shrink-0 md:w-[32vw]">
            <div className="overflow-hidden">
              <img
                src={item.src}
                alt={`${item.title} — ${item.category} photography by Utsav Studio`}
                loading="lazy"
                width={1088}
                height={1360}
                className="h-[58vh] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 md:h-[68vh]"
              />
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between">
              <span className="font-display text-xl text-foreground md:text-2xl">{item.title}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {item.category} · {String(i + 1).padStart(2, "0")}
              </span>
            </figcaption>
          </figure>
        ))}
        <Link
          to="/portfolio"
          className="group flex w-[60vw] shrink-0 flex-col items-center justify-center gap-4 text-center md:w-[24vw]"
        >
          <span className="font-display text-4xl text-foreground transition-colors group-hover:text-gold md:text-5xl">
            View the full portfolio
          </span>
          <ArrowUpRight className="size-8 text-gold transition-transform duration-500 group-hover:rotate-45" aria-hidden />
        </Link>
      </HorizontalScroll>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Services preview rows                                               */
/* ------------------------------------------------------------------ */
function ServicesPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-[14vh] md:px-10">
      <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.5em] text-gold">What we do</p>
          </Reveal>
          <h2 className="mt-4 font-display text-4xl tracking-tight text-foreground md:text-6xl">
            <AnimatedTitle text="Crafted for every celebration" />
          </h2>
        </div>
        <Reveal delay={0.1}>
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-gold"
          >
            All services
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
          </Link>
        </Reveal>
      </div>

      <div className="border-t border-border">
        {serviceGroups.map((g, i) => (
          <Reveal key={g.no} delay={i * 0.05}>
            <Link
              to="/services"
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border py-7 transition-colors duration-500 hover:bg-gold md:gap-8 md:py-9"
            >
              <span className="pl-2 text-xs tracking-[0.3em] text-muted-foreground transition-colors group-hover:text-primary-foreground/70 md:pl-6">
                {g.no}
              </span>
              <span>
                <span className="block font-display text-2xl tracking-tight text-foreground transition-colors group-hover:text-primary-foreground md:text-4xl">
                  {g.title}
                </span>
                <span className="mt-1 block max-w-xl text-sm text-muted-foreground transition-colors group-hover:text-primary-foreground/70">
                  {g.blurb}
                </span>
              </span>
              <ArrowUpRight
                className="mr-2 size-6 text-muted-foreground transition-all duration-500 group-hover:rotate-45 group-hover:text-primary-foreground md:mr-6 md:size-8"
                aria-hidden
              />
            </Link>
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
    <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden px-6 py-24 text-center">
      <ParallaxImage
        src={media.hero}
        alt=""
        eager={false}
        className="absolute inset-0"
        imgClassName="opacity-40"
        speed={10}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <p className="text-xs uppercase tracking-[0.5em] text-gold">Book your date</p>
        <h2 className="max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl">
          <AnimatedTitle text="Your story deserves the perfect frame." />
        </h2>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Magnetic>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground transition-transform duration-300 hover:scale-[1.04] glow-gold"
            >
              Book a shoot
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Magnetic>
          <Magnetic>
            <a
              href="tel:+919819391538"
              className="rounded-full border border-border px-8 py-4 font-display text-lg text-foreground transition-colors duration-300 hover:border-gold hover:text-gold"
            >
              +91 98193 91538
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
