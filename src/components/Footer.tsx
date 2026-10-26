import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import { Marquee, Magnetic } from "@/components/motion";
import { contact, navLinks } from "@/lib/media";

export function Footer() {
  return (
    <footer className="grain-surface relative border-t border-border bg-card">
      <Marquee
        items={["Let's create something beautiful", "Book your dates", "Utsav Studio", "Est. 1994"]}
        duration={36}
        className="border-b border-border py-6 font-display text-4xl text-foreground/90 md:py-8 md:text-6xl"
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10 md:py-20">
        <div>
          <p className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
            Utsav <span className="italic text-gold">Studio</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A photography &amp; cinematography studio in Mira Road East, capturing weddings,
            portraits and family stories since 1994.
          </p>
          <Magnetic className="mt-8 inline-block">
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground transition-transform duration-300 hover:scale-[1.03] glow-gold"
            >
              <MessageCircle className="size-4" aria-hidden />
              WhatsApp us
            </a>
          </Magnetic>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Visit</p>
          <address className="mt-4 text-sm not-italic leading-relaxed text-muted-foreground">
            {contact.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <p className="mt-4 text-sm text-muted-foreground">
            Tue – Sun · 11:00 AM – 9:30 PM
            <span className="mt-1 block text-muted-foreground/70">Monday · Closed</span>
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Explore</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            {[
              { Icon: Instagram, label: "Instagram", href: "https://instagram.com" },
              { Icon: Facebook, label: "Facebook", href: "https://facebook.com" },
              { Icon: Youtube, label: "YouTube", href: "https://youtube.com" },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-gold hover:text-gold"
              >
                <Icon className="size-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border px-6 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
        <span>© {new Date().getFullYear()} Utsav Studio · All rights reserved</span>
        <span>Established 1994 · Mira Road East, Maharashtra</span>
      </div>
    </footer>
  );
}
