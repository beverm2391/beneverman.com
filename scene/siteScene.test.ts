import { describe, expect, it } from "vitest";
import type { Scene } from "./lab/scene";
import { sceneToSiteConfig } from "./siteScene";

describe("scene promotion mapping", () => {
  it("maps the first enabled homepage layers and ignores disabled ones", () => {
    const scene: Scene = {
      id: "promoted",
      name: "Promoted",
      sunAngle: 2.4,
      layers: [
        { instanceId: "off", type: "shadow", enabled: false, config: { preset: "canopy" } },
        {
          instanceId: "shadow",
          type: "shadow",
          enabled: true,
          config: { preset: "sundial", opacity: 0.31, density: 1.4 }
        },
        { instanceId: "gradient", type: "sunGradient", enabled: true, config: { mode: "amber" } },
        { instanceId: "sun", type: "sunWidget", enabled: true, config: { variant: "arc" } }
      ]
    };

    const mapped = sceneToSiteConfig(scene);
    expect(mapped.background).toBe("amber");
    expect(mapped.shadowMapMode).toBe("sundial");
    expect(mapped.shadowSettings).toMatchObject({ sunAngle: 2.4, opacity: 0.31, density: 1.4 });
    expect(mapped).toMatchObject({ showSunWidget: true, sunWidget: "arc" });
  });
});
