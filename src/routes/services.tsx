import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { AnimatedTitle, ImageReveal, ParallaxImage, Reveal } from "@/components/motion";
import { contact, serviceGroups } from "@/lib/media";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Utsav Studio, Mira Road East" },
      {
        name: "description",
        content:
          "Wedding photography, cinematic films, maternity and kids portraits, photo editing, custom frames and album creation — Utsav Studio, Mira Road East.",
      },
      { property: "og:title", content: "Services — Utsav Studio" },
      {
        property: "og:description",
        content: "Weddings, portraits, films and hand-finished keepsakes from Mira Road East.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 pb-[8vh] pt-40 md:px-10 md:pt-52">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.5em] text-gold">Services</p>
        </Reveal>
        <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight text-foreground md:text-8xl">
          <AnimatedTitle text="Every occasion," />
          <br />
          <span className="italic text-gold">
            <AnimatedTitle text="every emotion." delay={0.2} />
          </span>
        </h1>
        <Reveal delay={0.2}>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Four crafts, one studio. Tell us the occasion — we'll bring the right team, the right
            light and the patience to wait for the real moment.
          </p>
        </Reveal>
      </section>

      {serviceGroups.map((g, i) => (
        <section
          key={g.no}
          className={`mx-auto grid max-w-7xl items-center gap-12 px-6 py-[10vh] md:grid-cols-2 md:px-10 ${
            i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
          }`}
        >
          <ImageReveal>
            <ParallaxImage
              src={g.image}
              alt={`${g.title} by Utsav Studio`}
              className="h-[60vh] md:h-[72vh]"
              speed={9}
            />
          </ImageReveal>
          <div>
            <Reveal>
              <p className="font-display text-6xl text-gold/40 md:text-7xl">{g.no}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-2 font-display text-4xl tracking-tight text-foreground md:text-5xl">
                {g.title}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                {g.blurb}
              </p>
            </Reveal>
            <ul className="mt-8 flex flex-col">
              {g.items.map((item, j) => (
                <Reveal key={item} delay={0.12 + j * 0.05}>
                  <li className="group flex items-center gap-4 border-t border-border py-4 text-foreground transition-colors last:border-b">
                    <Check className="size-4 shrink-0 text-gold" aria-hidden />
                    <span className="text-base transition-transform duration-300 group-hover:translate-x-2 md:text-lg">
                      {item}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* Booking note */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-[10vh] md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <Reveal>
              <p className="text-xs uppercase tracking-[0.5em] text-gold">Visit the studio</p>
              <p className="mt-4 font-display text-3xl tracking-tight text-foreground md:text-4xl">
                Walk-ins welcome · Tue–Sun, 11 AM – 9:30 PM
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Closed on Mondays · {contact.addressLines.join(" ")}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground transition-transform duration-300 hover:scale-[1.04] glow-gold"
            >
              Get a quote
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
