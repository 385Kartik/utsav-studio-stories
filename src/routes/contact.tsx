import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { AnimatedTitle, Magnetic, Reveal } from "@/components/motion";
import { contact } from "@/lib/media";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Utsav Studio, Mira Road East" },
      {
        name: "description",
        content:
          "Visit Utsav Studio at Shanti Nagar, Mira Road East. Open Tue–Sun, 11 AM–9:30 PM. Call or WhatsApp +91 98193 91538 to book your date.",
      },
      { property: "og:title", content: "Contact Utsav Studio — Book Your Date" },
      {
        property: "og:description",
        content: "Shanti Nagar, Mira Road East · Tue–Sun 11 AM–9:30 PM · +91 98193 91538.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(contact.mapsQuery)}&output=embed`;

  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 pb-[8vh] pt-40 md:px-10 md:pt-52">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.5em] text-gold">Contact</p>
        </Reveal>
        <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight text-foreground md:text-8xl">
          <AnimatedTitle text="Let's plan" />
          <br />
          <span className="italic text-gold">
            <AnimatedTitle text="your shoot." delay={0.2} />
          </span>
        </h1>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-6 pb-[10vh] md:grid-cols-[1fr_1.2fr] md:px-10">
        {/* Info column */}
        <div className="flex flex-col gap-10">
          <Reveal>
            <div className="flex gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <h2 className="text-xs uppercase tracking-[0.35em] text-gold">Studio address</h2>
                <address className="mt-3 text-base not-italic leading-relaxed text-foreground">
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <a
                  href={contact.mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-gold hover:underline"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <h2 className="text-xs uppercase tracking-[0.35em] text-gold">Call / WhatsApp</h2>
                <a
                  href={contact.phoneHref}
                  className="mt-3 block font-display text-3xl tracking-tight text-foreground transition-colors hover:text-gold md:text-4xl"
                >
                  {contact.phoneDisplay}
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex gap-4">
              <Clock className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <h2 className="text-xs uppercase tracking-[0.35em] text-gold">Studio hours</h2>
                <dl className="mt-3 text-base">
                  <div className="flex justify-between gap-8 border-b border-border py-2">
                    <dt className="text-muted-foreground">Tuesday – Sunday</dt>
                    <dd className="text-foreground">11:00 AM – 9:30 PM</dd>
                  </div>
                  <div className="flex justify-between gap-8 border-b border-border py-2">
                    <dt className="text-muted-foreground">Monday</dt>
                    <dd className="text-muted-foreground/70">Closed</dd>
                  </div>
                </dl>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <Magnetic className="inline-block">
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground transition-transform duration-300 hover:scale-[1.04] glow-gold"
              >
                <MessageCircle className="size-4" aria-hidden />
                Chat on WhatsApp
              </a>
            </Magnetic>
          </Reveal>
        </div>

        {/* Map */}
        <Reveal delay={0.1} className="min-h-[420px]">
          <div className="relative h-full min-h-[420px] overflow-hidden border border-border">
            <iframe
              title="Map to Utsav Studio, Shanti Nagar, Mira Road East"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full grayscale-[35%] contrast-[1.05]"
              allowFullScreen
            />
            <span className="pointer-events-none absolute inset-0 border border-gold/20" aria-hidden />
          </div>
        </Reveal>
      </section>

      {/* Big number band */}
      <section className="border-t border-border py-[8vh] text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground">
            Dates fill fast in wedding season
          </p>
          <a
            href={contact.phoneHref}
            className="mt-6 inline-block font-display text-[11vw] leading-none tracking-tight text-foreground transition-colors hover:text-gold md:text-[7vw]"
          >
            {contact.phoneDisplay}
          </a>
        </Reveal>
      </section>
    </main>
  );
}
