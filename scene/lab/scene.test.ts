import { describe, expect, it } from "vitest";
import { cloneScene, moveLayer, removeLayer, slugify, updateLayer, type Scene } from "./scene";
import { parseScene, sceneIdSchema } from "./sceneSchema";

const scene: Scene = {
  id: "test-scene",
  name: "Test scene",
  sunAngle: 1.2,
  layers: [
    { instanceId: "front", type: "text", enabled: true, config: { opacity: 1 } },
    { instanceId: "back", type: "sunGradient", enabled: true, config: { mode: "paper" } }
  ]
};

describe("scene model", () => {
  it("clones nested config before edits", () => {
    const cloned = cloneScene(scene);
    cloned.layers[0].config.opacity = 0;
    expect(scene.layers[0].config.opacity).toBe(1);
  });

  it("reorders, updates, and removes without mutating the source", () => {
    const moved = moveLayer(scene, 0, 1);
    const updated = updateLayer(moved, "front", (layer) => ({ ...layer, enabled: false }));
    const removed = removeLayer(updated, "back");
    expect(removed.layers.map((layer) => layer.instanceId)).toEqual(["front"]);
    expect(removed.layers[0].enabled).toBe(false);
    expect(scene.layers.map((layer) => layer.instanceId)).toEqual(["front", "back"]);
  });

  it("uses exact safe ids rather than sanitizing aliases", () => {
    expect(slugify("  New Scene!  ")).toBe("new-scene");
    expect(sceneIdSchema.safeParse("new-scene").success).toBe(true);
    expect(sceneIdSchema.safeParse("../new-scene").success).toBe(false);
    expect(sceneIdSchema.safeParse("New-Scene").success).toBe(false);
  });

  it("rejects malformed promoted snapshots", () => {
    expect(() => parseScene({ ...scene, sunAngle: Number.NaN }, "test snapshot")).toThrow(
      "Invalid test snapshot"
    );
  });
});
