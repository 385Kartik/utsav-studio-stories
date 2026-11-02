import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { Marquee } from "@/components/motion";
import { OutlineAnchor } from "@/components/buttons";
import { contact, navLinks } from "@/lib/media";

export function Footer() {
  return (
    <footer className="grain-surface relative border-t border-border bg-card">
      <Marquee
        items={["Utsav Studio", "Est. 1994", "Mira Road East", "Photography & Films"]}
        duration={38}
        separator="·"
        className="border-b border-border py-6 font-display text-4xl font-light text-foreground/80 md:py-8 md:text-6xl"
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10 md:py-20">
        <div>
          <img src="/utsav-logo.png" alt="Utsav Morjaria Photography" className="h-16 w-auto object-contain md:h-20" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A photography &amp; cinematography studio in Mira Road East, capturing weddings,
            portraits and family stories since 1994.
          </p>
          <div className="mt-8">
            <OutlineAnchor href={contact.whatsapp}>
              <span className="normal-case tracking-[0.3em]">WhatsApp</span>
            </OutlineAnchor>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">Visit</p>
          <address className="mt-5 text-sm not-italic leading-relaxed text-muted-foreground">
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
          <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">Explore</p>
          <ul className="mt-5 flex flex-col gap-2.5 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex gap-3">
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
                className="flex size-10 items-center justify-center border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground hover:text-foreground"
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
