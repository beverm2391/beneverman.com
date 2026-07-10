import { backgroundModes } from "./HomeSunGradientConfig";
import { HomeBackgroundFallback } from "./HomeBackgroundFallback";
import { HomeSunStatus } from "./HomeSunStatus";
import { activeSiteConfig } from "./siteScene";

const backgroundMode =
  backgroundModes.find((mode) => mode.label === activeSiteConfig.background) ?? backgroundModes[0];

// The scene's server-rendered first paint and durable no-JavaScript fallback:
// only the visual layers behind the content. The page content itself lives in
// app/page.tsx, outside the client-scene swap, so it never remounts when the
// App chunk arrives (see primitives/clientScene.tsx).
export function HomeStaticShell() {
  return (
    <>
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
    </>
  );
}
