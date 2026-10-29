import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { AnimatedTitle, ImageReveal, Reveal } from "@/components/motion";
import { galleryItems } from "@/lib/media";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Utsav Studio, Mira Road East" },
      {
        name: "description",
        content:
          "Selected wedding, pre-wedding, maternity, kids, birthday and cinematic film frames from Utsav Studio, Mira Road East.",
      },
      { property: "og:title", content: "Portfolio — Selected Frames by Utsav Studio" },
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

const aspectCycle = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[3/4]"];

function Portfolio() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const items =
    filter === "All" ? galleryItems : galleryItems.filter((g) => g.category === filter);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 pb-[6vh] pt-40 md:px-10 md:pt-52">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.55em] text-muted-foreground">Portfolio</p>
        </Reveal>
        <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight text-foreground md:text-8xl">
          <AnimatedTitle text="Selected frames" />
        </h1>
        <Reveal delay={0.15}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A small cut of recent work — weddings, pre-weddings, portraits and film stills.
            The full archive is best viewed at the studio, over chai.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap gap-3">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-full border px-5 py-2 text-xs uppercase tracking-[0.25em] transition-all duration-300 ${
                  filter === f
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-[12vh] md:px-10">
        <div key={filter} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <ImageReveal key={item.title} delay={(i % 3) * 0.08} className="group">
              <figure className="cursor-pointer" data-cursor>
                <div className={`overflow-hidden ${aspectCycle[i % aspectCycle.length]}`}>
                  <img
                    src={item.src}
                    alt={`${item.title} — ${item.category} photography by Utsav Studio`}
                    loading="lazy"
                    width={1088}
                    height={1360}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <figcaption className="flex items-baseline justify-between border-b border-border py-4">
                  <span className="font-display text-xl text-foreground">{item.title}</span>
                  <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {item.category}
                  </span>
                </figcaption>
              </figure>
            </ImageReveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-500 hover:text-foreground"
          >
            Plan your shoot with us
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
