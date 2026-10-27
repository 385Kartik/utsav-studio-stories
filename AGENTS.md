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
- Design tokens (dark cinematic, amber `--gold`) live in `src/styles.css`; components must use semantic classes (`bg-gold`, `text-foreground`…), no hardcoded colors.
