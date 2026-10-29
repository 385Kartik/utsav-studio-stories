import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Aperture, Camera, Film } from "lucide-react";
import { AnimatedTitle, ImageReveal, ParallaxImage, Reveal } from "@/components/motion";
import { Eyebrow } from "@/components/buttons";
import { media } from "@/lib/media";
import { CtaBand } from "./index";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Utsav Studio, Mira Road East" },
      {
        name: "description",
        content:
          "The story of Utsav Studio — a Mira Road East photography and cinematography studio led by Utsav Morjaria, serving families since 1994.",
      },
      { property: "og:title", content: "About Utsav Studio — A Legacy in Light Since 1994" },
      {
        property: "og:description",
        content: "Three decades of weddings, portraits and cinematic films from Mira Road East.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <main>
      {/* Intro */}
      <section className="mx-auto max-w-6xl px-6 pb-[10vh] pt-40 md:px-10 md:pt-52">
        <Reveal>
          <Eyebrow>About the studio</Eyebrow>
        </Reveal>
        <h1 className="mt-6 font-display text-5xl font-light leading-[1.02] tracking-tight text-foreground md:text-8xl">
          <AnimatedTitle text="A legacy in light," />
          <br />
          <span className="italic text-foreground/85">
            <AnimatedTitle text="since 1994." delay={0.2} />
          </span>
        </h1>
        <Reveal delay={0.2}>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            What began in 1994 as a small neighbourhood photo studio in Shanti Nagar is today one
            of Mira Road's most trusted names in photography and cinematography — with a 4.6+ star
            rating earned across local platforms, one honest frame at a time.
          </p>
        </Reveal>
      </section>

      {/* Story + parallax image */}
      <section className="mx-auto grid max-w-7xl gap-14 px-6 pb-[14vh] md:grid-cols-2 md:px-10">
        <ImageReveal className="relative">
          <ParallaxImage
            src={media.family}
            alt="A multi-generation family portrait by Utsav Studio"
            className="h-[70vh]"
            speed={9}
          />
        </ImageReveal>
        <div className="flex flex-col justify-center">
          <Reveal>
            <h2 className="font-display text-3xl tracking-tight text-foreground md:text-5xl">
              Three generations of families, one album at a time
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground">
              Couples who once came for their own weddings now bring their children for birthdays
              and their parents for portraits. That kind of trust is built slowly — with patient
              sessions, fair advice, and delivery dates we actually keep.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Led by <span className="text-foreground">Utsav Morjaria</span>, the studio blends
              old-school studio discipline with modern candid and cinematic craft — traditional
              rituals covered respectfully, real emotions chased relentlessly.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                { n: "1994", l: "Founded" },
                { n: "4.6★", l: "Rated locally" },
                { n: "6 days", l: "Open every week*" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-3xl font-light text-foreground md:text-4xl">{s.n}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground/70">*Closed on Mondays.</p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-[12vh] md:grid-cols-3 md:px-10">
          {[
            {
              Icon: Camera,
              t: "Candid & Traditional",
              d: "Both schools, one team — posed group perfection and unposed, unscripted emotion.",
            },
            {
              Icon: Film,
              t: "Cinematic Films",
              d: "Wedding videos cut like short films: real vows, real voices, real light.",
            },
            {
              Icon: Aperture,
              t: "Finished by Hand",
              d: "Editing, custom frames and album design completed in-house, down to the last page.",
            },
          ].map((v, i) => (
            <Reveal key={v.t} delay={i * 0.1} className="flex flex-col gap-4">
              <v.Icon className="size-6 text-muted-foreground" aria-hidden />
              <h3 className="font-display text-2xl tracking-tight text-foreground">{v.t}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{v.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <section className="mx-auto max-w-4xl px-6 py-[16vh] text-center">
        <Reveal>
          <p className="font-display text-3xl italic leading-snug tracking-tight text-foreground md:text-5xl">
            "A photograph is the only thing that gets more valuable with every year that passes."
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Utsav Morjaria · Founder
          </p>
        </Reveal>
      </section>

      {/* Founder visual band */}
      <section className="relative h-[70vh] overflow-hidden">
        <ParallaxImage
          src={media.cinema}
          alt="Utsav Studio filming a couple on set"
          className="absolute inset-0"
          speed={12}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
        <div className="absolute bottom-12 left-6 md:left-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
              On set, always
            </p>
            <p className="mt-3 max-w-md font-display text-3xl font-light tracking-tight text-foreground md:text-5xl">
              Every film is directed, lit and edited by the studio itself.
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand />

      <div className="mx-auto max-w-7xl px-6 pb-16 text-center md:px-10">
        <Link
          to="/services"
          className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-500 hover:text-foreground"
        >
          See what we offer
          <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
        </Link>
      </div>
    </main>
  );
}
