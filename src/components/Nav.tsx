import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { animate, scrambleText, stagger } from "animejs";
import { navLinks, contact } from "@/lib/media";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const prevOpen = useRef(false);

  // Lock scroll when nav open
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── animejs scramble effect when nav opens ──────────────────────────────
  useEffect(() => {
    if (!navRef.current) return;
    if (open && !prevOpen.current) {
      // Nav just opened — scramble each link text in staggered sequence
      const links = Array.from(
        navRef.current.querySelectorAll<HTMLElement>("[data-nav-link-text]")
      );
      links.forEach((el, i) => {
        const originalText = el.getAttribute("data-original") ?? el.textContent ?? "";
        setTimeout(() => {
          animate(el, {
            innerHTML: scrambleText({
              text: originalText,
              chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
              speed: 0.65,
              revealDelay: 80,
            }),
            duration: 900,
            ease: "linear",
          });
        }, 280 + i * 90);
      });
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <header
        className={`absolute inset-x-0 top-0 z-[110] transition-all duration-500 ease-out ${
          scrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border/50 py-3 md:py-3.5 shadow-xl"
            : "bg-transparent py-5 md:py-6"
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-12">
          {/* Left: Company Logo */}
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 transition-opacity duration-300 hover:opacity-90"
            aria-label="Utsav Morjaria Photography — home"
          >
            <img
              src="/utsav-logo.png"
              alt="Utsav Morjaria Photography"
              className="h-13 md:h-16 w-auto object-contain filter drop-shadow-[0_0_14px_rgba(212,163,89,0.45)] transition-transform duration-500 group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.35em] text-gold font-mono font-medium">EST. 1994</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/80 font-light">Mira Road East</span>
            </div>
          </Link>

          {/* Right: Contact + Menu */}
          <div className="flex items-center gap-6 md:gap-10">
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="hidden sm:inline-block text-xs uppercase tracking-[0.35em] text-foreground/80 transition-colors duration-300 hover:text-foreground"
            >
              Contact
            </Link>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="group flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-foreground mix-blend-difference"
            >
              <span className="hidden md:inline">{open ? "Close" : "Menu"}</span>
              <span className="relative flex h-8 w-8 flex-col items-end justify-center gap-[6px]">
                <span
                  className={`h-[2px] bg-foreground transition-all duration-300 ${
                    open ? "w-6 translate-y-[4px] rotate-45" : "w-6 group-hover:w-4"
                  }`}
                />
                <span
                  className={`h-[2px] bg-foreground transition-all duration-300 ${
                    open ? "w-6 -translate-y-[4px] -rotate-45" : "w-4 group-hover:w-6"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <nav
        ref={navRef}
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
                transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
                transitionDelay: open ? `${220 + i * 65}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(110%)",
              }}
            >
              <Link
                to={link.to}
                onClick={() => setOpen(false)}
                className="group relative inline-block font-display text-4xl font-light text-foreground transition-colors duration-300 hover:text-foreground/70 md:text-7xl"
              >
                {/* The actual text element that gets scrambled */}
                <span
                  data-nav-link-text
                  data-original={link.label}
                >
                  {link.label}
                </span>
                {/* Underline swipe on hover */}
                <span className="absolute bottom-0 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Mira Road East, Mumbai · Est. 1994</p>
          <a
            href={contact.phoneHref}
            className="tracking-wider transition-colors duration-300 hover:text-foreground"
          >
            {contact.phoneDisplay}
          </a>
        </div>
      </nav>
    </>
  );
}
