import { SiteHeader } from "@/components/site-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { homepageIntroCopy } from "@/scene/homeCopy";

// The homepage is a flat page on the same background, tokens, and theme as
// the blog. The WebGL sun scene is parked in the dev-only lab (scene/lab)
// until a future pass earns it back; scene/homeCopy.ts stays the single owner
// of the intro copy because the lab's text layer renders it too.
export default function HomePage() {
  return (
    <>
      <SiteHeader variant="overlay" />
      <ThemeToggle />
      <main className="grid min-h-svh place-items-center px-[clamp(1.25rem,4vw,4rem)]">
        {/* Type matches the retired scene intro's promoted settings
            (scene/siteVisualConfig.ts): 1.02rem / 1.55 on a 35rem measure. */}
        <section
          aria-label="About Ben Everman"
          className="max-w-[35rem] text-[1.02rem] leading-[1.55] font-light text-fg/90 [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-[0.18em]"
        >
          <p className="mb-[1.15rem] font-normal">{homepageIntroCopy.name}</p>
          <p className="mt-[0.9rem]">{homepageIntroCopy.work}</p>
          <p className="mt-[0.9rem]">{homepageIntroCopy.projects}</p>
          <p className="mt-[0.9rem]">{homepageIntroCopy.atlanta}</p>
          <p className="mt-[0.9rem]">
            {homepageIntroCopy.experimentsPrefix}{" "}
            <a href="https://www.bencorp.dev/" rel="noreferrer" target="_blank">
              {homepageIntroCopy.bencorpLabel}
            </a>
            , {homepageIntroCopy.experimentsMiddle}{" "}
            <a href="https://www.github.com/beverm2391" rel="noreferrer" target="_blank">
              {homepageIntroCopy.githubLabel}
            </a>
            ; {homepageIntroCopy.experimentsSuffix}{" "}
            <a href="https://www.x.com/beneverman" rel="noreferrer" target="_blank">
              {homepageIntroCopy.xLabel}
            </a>
            .
          </p>
        </section>
      </main>
    </>
  );
}
