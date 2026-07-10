import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

// Dev-only disk persistence for lab scenes — the Next port of v7's
// vite/labScenes.ts middleware. Scenes are plain JSON under scene/lab/scenes so
// they can be committed, diffed, and imported by the homepage to promote in
// code. Gated to dev; returns 404 in production so it never ships as an API.

const SCENES_DIR = path.resolve(process.cwd(), "scene/lab/scenes");

const isProd = () => process.env.NODE_ENV === "production";
const notFound = () => new NextResponse("Not found", { status: 404 });

async function listScenes() {
  await fs.mkdir(SCENES_DIR, { recursive: true });
  const entries = await fs.readdir(SCENES_DIR);
  const scenes = await Promise.all(
    entries
      .filter((name) => name.endsWith(".json"))
      .map(async (name) => JSON.parse(await fs.readFile(path.join(SCENES_DIR, name), "utf8")))
  );
  return scenes.sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

export async function GET() {
  if (isProd()) return notFound();
  return NextResponse.json(await listScenes());
}

export async function PUT(req: Request) {
  if (isProd()) return notFound();
  const scene = await req.json();
  // Guard against path traversal — ids become filenames.
  const safe = String(scene?.id ?? "").replace(/[^a-z0-9-]/gi, "");
  if (!safe) return NextResponse.json({ error: "bad scene id" }, { status: 400 });
  await fs.mkdir(SCENES_DIR, { recursive: true });
  await fs.writeFile(path.join(SCENES_DIR, `${safe}.json`), `${JSON.stringify(scene, null, 2)}\n`, "utf8");
  return NextResponse.json({ ok: true });
}
