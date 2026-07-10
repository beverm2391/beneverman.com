"use client";

import dynamic from "next/dynamic";
import { HomeStaticShell } from "./HomeStaticShell";
import "./App.css";

// The shader/Three.js renderer still needs the browser. Its loading component
// is intentionally the full static experience, not an empty placeholder: Next
// emits it in the initial HTML and it remains useful when JavaScript or WebGL
// is unavailable.
const App = dynamic(() => import("./App"), {
  ssr: false,
  loading: HomeStaticShell
});

export default function HomeMount() {
  return <App />;
}
