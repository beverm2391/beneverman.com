"use client";

// Client boundary for the dev-only lab compositor. Lab drives browser-only
// state (three.js layers, disk fetches), so it mounts client-only via
// dynamic(ssr:false). Suspense satisfies next/navigation's useSearchParams.
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Lab = dynamic(() => import("./Lab"), { ssr: false });

export default function LabMount() {
  return (
    <Suspense fallback={null}>
      <Lab />
    </Suspense>
  );
}
