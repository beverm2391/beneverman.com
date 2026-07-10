import HomeMount from "@/scene/HomeMount";
import { SiteHeader } from "@/components/site-header";
import { HomePageContent } from "@/scene/HomePageContent";
import { getHomeShellStyle } from "@/scene/homeVisualConfig";
import "@/scene/App.css";

// The shell <main> and page content are server-rendered once and never remount.
// HomeMount mounts the WebGL scene behind them, and the scene fades in as one
// unit when its layers have rendered (useSceneArrival) — until then, and for
// no-JS/no-WebGL visitors, the page is the flat shell background plus content.
// The client scene restyles this shell through useSceneShellStyle when
// responsive presets or debug controls change.
export default function HomePage() {
  return (
    <>
      <SiteHeader variant="scene" />
      <main className="site-shell" style={getHomeShellStyle()}>
        <HomeMount />
        <HomePageContent />
      </main>
    </>
  );
}
