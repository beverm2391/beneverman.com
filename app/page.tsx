import HomeMount from "@/scene/HomeMount";
import { SiteHeader } from "@/components/site-header";
import { HomePageContent } from "@/scene/HomePageContent";
import { HomeSunStatus } from "@/scene/HomeSunStatus";
import { getHomeShellStyle } from "@/scene/homeVisualConfig";
import { activeSiteConfig } from "@/scene/siteScene";
import "@/scene/App.css";

// The shell <main> and page content are server-rendered once and never remount.
// HomeMount mounts the WebGL scene behind them, and the scene fades in as one
// unit when its layers have rendered (useSceneArrival) — until then, and for
// no-JS/no-WebGL visitors, the page is the flat shell background plus content.
// The client scene restyles this shell through useSceneShellStyle when
// responsive presets or debug controls change.
export default function HomePage() {
  const shellStyle = getHomeShellStyle();
  return (
    <>
      {/* Every layer behind the page (html, body, main) carries the same
          color from the first byte, so no stylesheet/paint timing gap can
          ever show a differently-colored band. The client scene overrides
          this when debug controls change the background. */}
      <style>{`html { background: ${String(shellStyle.backgroundColor)}; }`}</style>
      <SiteHeader variant="scene" />
      <main className="site-shell" style={shellStyle}>
        <HomeMount />
        {/* The sun indicator is DOM/CSS content, not a WebGL layer, so it
            renders at first paint (static config angle) instead of waiting on
            the scene arrival. App hides this copy on mount and takes over
            with the animated one at identical geometry. display:contents
            keeps the wrapper out of the shell's centering grid. */}
        {activeSiteConfig.showSunWidget ? (
          <div data-ssr-sun-widget style={{ display: "contents" }}>
            <HomeSunStatus
              angle={activeSiteConfig.shadowSettings.sunAngle}
              variant={activeSiteConfig.sunWidget}
            />
          </div>
        ) : null}
        <HomePageContent />
      </main>
    </>
  );
}
