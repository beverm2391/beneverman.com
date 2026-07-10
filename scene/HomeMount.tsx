"use client";

import { createClientScene } from "./primitives/clientScene";
import { HomeStaticShell } from "./HomeStaticShell";

// The WebGL scene mounts client-only behind the server-rendered page content,
// with the complete static shell as its loading/no-JavaScript state.
export default createClientScene(() => import("./App"), HomeStaticShell);
