import HomeMount from "@/scene/HomeMount";
import { SiteHeader } from "@/components/site-header";
import { HomePageContent } from "@/scene/HomePageContent";
import { getHomeShellStyle } from "@/scene/homeVisualConfig";
import "@/scene/App.css";

// The shell <main> and page content are server-rendered once and never remount;
// HomeMount swaps only the visual scene layers behind them (static CSS fallback
// -> WebGL when ready). The client scene restyles this shell through
// useSceneShellStyle when responsive presets or debug controls change.
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
