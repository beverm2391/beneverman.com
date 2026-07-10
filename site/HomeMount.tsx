"use client";

// Client boundary for the ported v7 homepage. App reads window.location and
// drives a WebGL scene, so it must not server-render — dynamic() with
// ssr:false keeps it client-only (the equivalent of v7 mounting App into #root
// in the browser). The heavy three.js work stays lazy and isolated here.
import dynamic from "next/dynamic";

const App = dynamic(() => import("./App"), { ssr: false });

export default function HomeMount() {
  return <App />;
}
