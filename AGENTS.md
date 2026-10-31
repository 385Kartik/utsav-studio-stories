<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture decisions
- Motion runs client-side only: GSAP + ScrollTrigger and Lenis are instantiated inside `useEffect` in `src/components/motion.tsx` and `src/components/Preloader.tsx` — never call them at module scope, routes are SSR'd on workerd.
- `gsap/ScrollTrigger` may only be imported inside `src/components/motion.tsx`; other modules use `ensureGsap()` / `refreshScrollTriggers()` from it. Direct imports elsewhere (or `ScrollTrigger.create` in route files) resolve to `undefined` in production chunking and blank-screen the page — use browser APIs (e.g. IntersectionObserver) or helpers instead.
- Design tokens (dark cinematic, amber `--gold`) live in `src/styles.css`; components must use semantic classes (`bg-gold`, `text-foreground`…), no hardcoded colors.

## Design direction (user-approved, Mistral-inspired)
- Split theme system: dark cinematic showcase (Home, Portfolio, Footer, Nav overlay, CtaBand) vs light editorial information pages (Services, About, Contact) via the `.theme-light` wrapper class in `src/styles.css`; `.theme-dark` restores the dark palette inside a light page. Nav relies on `mix-blend-difference` so it adapts to both.
- Editorial and restrained: eyebrows are muted cream caps (`Eyebrow` from `src/components/buttons.tsx`); gold appears only as a small accent (WhatsApp icon, star, active service number), never in headings, buttons, icons lists or full-row hover fills.
- Buttons are bordered rectangles with letter-spaced caps and the offset echo border — use `OutlineButton` / `OutlineAnchor` from `src/components/buttons.tsx`. No pill buttons, no `glow-gold`, no scale-hover.
- Headlines are light-weight Fraunces serif, often with an italic second line in `text-foreground/85`; reveal animations are straight masked slides (no word rotation).
