import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "out/**"]
  },
  {
    files: ["scene/**/*.{ts,tsx}"],
    rules: {
      // The scene renderer deliberately mutates Three.js objects inside R3F
      // effects/frames and lazy-loads a component after capability checks.
      // Keep React Compiler diagnostics visible without treating those
      // imperative integration patterns as blocking application errors.
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn"
    }
  }
];

export default eslintConfig;
