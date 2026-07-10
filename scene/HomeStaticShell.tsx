import { backgroundModes } from "./HomeSunGradientConfig";
import { HomePageContent } from "./HomePageContent";
import { getHomeIntroStyle } from "./homeVisualConfig";
import { activeSiteConfig } from "./siteScene";

const backgroundMode =
  backgroundModes.find((mode) => mode.label === activeSiteConfig.background) ?? backgroundModes[0];

// This is both the server-rendered first paint and the durable no-JavaScript
// fallback. Keep its geometry identical to App so hydration cannot shift copy.
export function HomeStaticShell() {
  return (
    <main
      className="site-shell"
      style={{
        ...getHomeIntroStyle(),
        backgroundColor: backgroundMode.color
      }}
    >
      <HomePageContent />
    </main>
  );
}
