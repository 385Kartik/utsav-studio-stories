import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AnimatedTitle, ImageReveal, ParallaxImage, Reveal } from "@/components/motion";
import { Eyebrow, OutlineButton } from "@/components/buttons";
import { AnimeTiltCard } from "@/components/AnimeTiltCard";
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

const anchors = [
  { id: "weddings-events", no: "01", label: "Weddings & Events" },
  { id: "portraits-family", no: "02", label: "Portraits & Family" },
  { id: "cinematic-films", no: "03", label: "Cinematic Films" },
  { id: "keepsakes-finishing", no: "04", label: "Keepsakes" },
];

const process = [
  {
    no: "01",
    t: "Share your date",
    d: "Call or WhatsApp us with your occasion and dates — we'll confirm availability right away.",
  },
  {
    no: "02",
    t: "Plan the coverage",
    d: "We suggest the right team, hours and style for your occasion at the studio, over a visit or a call.",
  },
  {
    no: "03",
    t: "The shoot",
    d: "Our team covers every ritual and moment — candid where it matters, traditional where it counts.",
  },
  {
    no: "04",
    t: "Hand-finished delivery",
    d: "Editing, retouching, album design and films are completed in-house and delivered as promised.",
  },
];

function Services() {
  return (
    <main className="theme-light min-h-screen bg-background text-foreground">
      {/* Hero + service index */}
      <section className="mx-auto max-w-6xl px-6 pb-[6vh] pt-40 md:px-10 md:pt-52">
        <Reveal>
          <Eyebrow>Services</Eyebrow>
        </Reveal>
        <h1 className="mt-6 font-display text-5xl font-light leading-[1.02] tracking-tight text-foreground md:text-8xl">
          <AnimatedTitle text="Every occasion," />
          <br />
          <span className="italic text-foreground/85">
            <AnimatedTitle text="every emotion." delay={0.2} />
          </span>
        </h1>
        <Reveal delay={0.2}>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Four crafts, one studio. Tell us the occasion — we'll bring the right team, the right
            light and the patience to wait for the real moment.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <nav aria-label="Jump to a service" className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            {anchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="group flex items-baseline gap-3 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
              >
                <span className="text-[10px] tracking-[0.3em] font-mono text-gold">{a.no}</span>
                <span className="font-display text-lg tracking-tight text-foreground">
                  {a.label}
                </span>
              </a>
            ))}
          </nav>
        </Reveal>
      </section>

      {serviceGroups.map((g, i) => (
        <section
          key={g.no}
          id={anchors[i]?.id}
          className="mx-auto grid max-w-7xl scroll-mt-28 items-center gap-12 px-6 py-[10vh] md:grid-cols-2 md:px-10"
        >
          <ImageReveal className={i % 2 === 1 ? "md:order-2" : ""}>
            <ParallaxImage
              src={g.image}
              alt={`${g.title} by Utsav Studio`}
              className="h-[60vh] md:h-[72vh]"
              speed={9}
            />
          </ImageReveal>
          <div>
            <Reveal>
              <p className="font-display text-6xl font-light text-foreground/15 md:text-7xl">
                {g.no}
              </p>
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
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2">
              {g.items.map((item, j) => (
                <Reveal key={item.label} delay={0.12 + j * 0.05}>
                  <li className="border-t border-border py-4 text-foreground sm:odd:border-r sm:odd:pr-6 sm:even:pl-6 sm:[&:nth-last-child(-n+2)]:border-b">
                    <Link
                      to="/portfolio"
                      search={{ category: item.category }}
                      className="group flex items-center justify-between text-sm leading-snug transition-colors hover:text-gold md:text-base"
                    >
                      <span className="flex items-center gap-3">
                        <Check className="size-4 shrink-0 text-muted-foreground group-hover:text-gold" aria-hidden />
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          {item.label}
                        </span>
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider opacity-0 transition-opacity group-hover:opacity-100 text-gold ml-2">
                        View →
                      </span>
                    </Link>
                  </li>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <OutlineButton to="/contact">
                  Enquire for this
                </OutlineButton>
                <Link
                  to="/portfolio"
                  search={{ category: g.category }}
                  className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-gold transition-colors underline-offset-4 hover:underline py-2 font-mono"
                >
                  View {g.title} Frames →
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      {/* How booking works */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-6 py-[12vh] md:px-10">
          <Reveal>
            <Eyebrow>How booking works</Eyebrow>
          </Reveal>
          <h2 className="mt-5 max-w-2xl font-display text-4xl font-light tracking-tight text-foreground md:text-5xl">
            From enquiry to heirloom, in four steps
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <Reveal key={p.no} delay={i * 0.08} className="flex flex-col">
                <AnimeTiltCard
                  maxTilt={5}
                  scale={1.02}
                  hasShutterFlash={false}
                  className="p-6 rounded-md border border-border/70 bg-card/40 backdrop-blur-xs transition-colors hover:border-gold/60 flex flex-col gap-3 h-full"
                >
                  <span className="font-display text-4xl font-light text-foreground/25">{p.no}</span>
                  <h3 className="font-display text-xl tracking-tight text-foreground">{p.t}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.d}</p>
                </AnimeTiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Booking note */}
      <section>
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-[10vh] md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <Reveal>
              <Eyebrow>Visit the studio</Eyebrow>
              <p className="mt-4 font-display text-3xl font-light tracking-tight text-foreground md:text-4xl">
                Walk-ins welcome · Tue–Sun, 11 AM – 9:30 PM
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Closed on Mondays · {contact.addressLines.join(" ")}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <OutlineButton to="/contact">Get a quote</OutlineButton>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
