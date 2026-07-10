import { backgroundModes } from "./HomeSunGradientConfig";
import { HomeBackgroundFallback } from "./HomeBackgroundFallback";
import { HomePageContent } from "./HomePageContent";
import { HomeSunStatus } from "./HomeSunStatus";
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
      <div className="visual-scene-layer" aria-hidden="true">
        <HomeBackgroundFallback
          mode={backgroundMode}
          sunAngle={activeSiteConfig.shadowSettings.sunAngle}
        />
      </div>
      {activeSiteConfig.showSunWidget ? (
        <HomeSunStatus
          angle={activeSiteConfig.shadowSettings.sunAngle}
          variant={activeSiteConfig.sunWidget}
        />
      ) : null}
      <HomePageContent />
    </main>
  );
}
