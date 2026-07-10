import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "out/**"]
  },
  {
    files: ["scene/V2ShadowLayer.tsx"],
    rules: {
      // R3F's frame loop is the ownership boundary for these Three.js scene
      // objects; animation intentionally mutates them before each render.
      "react-hooks/immutability": "off"
    }
  }
];

export default eslintConfig;
