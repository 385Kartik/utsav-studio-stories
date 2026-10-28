import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { navLinks, contact } from "@/lib/media";

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[110] mix-blend-difference">
        <div className="flex items-center justify-between px-5 py-5 md:px-10">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="font-display text-2xl font-light leading-none tracking-tight text-foreground md:text-3xl"
          >
            Utsav Studio
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="group flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-foreground"
          >
            <span className="hidden sm:inline">{open ? "Close" : "Menu"}</span>
            <span className="relative flex h-8 w-10 flex-col items-end justify-center gap-[7px]">
              <span
                className={`h-[2px] bg-foreground transition-all duration-300 ${
                  open ? "w-8 translate-y-[4.5px] rotate-45" : "w-8 group-hover:w-5"
                }`}
              />
              <span
                className={`h-[2px] bg-foreground transition-all duration-300 ${
                  open ? "w-8 -translate-y-[4.5px] -rotate-45" : "w-5 group-hover:w-8"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      <nav
        aria-label="Main navigation"
        className="grain-surface fixed inset-0 z-[105] flex flex-col justify-between bg-background px-6 pb-8 pt-28 md:px-14"
        style={{
          clipPath: open
            ? "circle(160% at calc(100% - 3.5rem) 3rem)"
            : "circle(0% at calc(100% - 3.5rem) 3rem)",
          transition: "clip-path 0.9s cubic-bezier(0.77, 0, 0.18, 1)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <ul className="flex flex-col gap-2 md:gap-4">
          {navLinks.map((link, i) => (
            <li
              key={link.to}
              className="overflow-hidden"
              style={{
                transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                transitionDelay: open ? `${250 + i * 70}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(110%)",
              }}
            >
              <Link
                to={link.to}
                onClick={() => setOpen(false)}
                activeOptions={{ includeSearch: false }}
                className="group flex items-baseline gap-4 font-display text-5xl tracking-tight text-foreground transition-colors duration-300 hover:text-gold md:text-8xl"
              >
                <span className="w-10 text-sm font-grotesk uppercase tracking-[0.3em] text-muted-foreground md:w-16">
                  0{i + 1}
                </span>
                <span className="transition-transform duration-500 group-hover:translate-x-3">
                  {link.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row md:items-end md:justify-between"
          style={{
            transition: "opacity 0.6s ease",
            transitionDelay: open ? "600ms" : "0ms",
            opacity: open ? 1 : 0,
          }}
        >
          <div className="flex flex-col gap-1">
            <span className="uppercase tracking-[0.3em] text-gold">Studio</span>
            <span>Shanti Nagar, Mira Road East</span>
            <span>Open Tue–Sun · 11:00 AM – 9:30 PM</span>
          </div>
          <a href={contact.phoneHref} className="font-display text-2xl text-foreground md:text-3xl">
            {contact.phoneDisplay}
          </a>
        </div>
      </nav>
    </>
  );
}
