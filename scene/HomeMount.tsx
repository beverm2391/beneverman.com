"use client";

import { createClientScene } from "./primitives/clientScene";

// The WebGL scene mounts client-only behind the server-rendered page content
// and fades in as one unit once its layers have rendered (see useSceneArrival).
// There is no loading shell: until then — and forever without JS/WebGL — the
// page is the clean flat shell background plus the content.
export default createClientScene(() => import("./App"));
