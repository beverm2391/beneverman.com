import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { parseScene, sceneIdSchema } from "@/scene/lab/sceneSchema";

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
      .map(async (name) =>
        parseScene(JSON.parse(await fs.readFile(path.join(SCENES_DIR, name), "utf8")), name)
      )
  );
  return scenes.sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

export async function GET() {
  if (isProd()) return notFound();
  return NextResponse.json(await listScenes());
}

export async function PUT(req: Request) {
  if (isProd()) return notFound();
  let scene;
  try {
    scene = parseScene(await req.json());
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
  await fs.mkdir(SCENES_DIR, { recursive: true });
  const previousHeader = req.headers.get("X-Previous-Scene-Id");
  const previousId = previousHeader ? sceneIdSchema.safeParse(previousHeader) : null;
  if (previousId && !previousId.success) {
    return NextResponse.json({ error: "bad previous scene id" }, { status: 400 });
  }
  const target = path.join(SCENES_DIR, `${scene.id}.json`);
  const targetExists = await fs.access(target).then(() => true).catch(() => false);
  if (targetExists && previousId?.data !== scene.id) {
    return NextResponse.json({ error: `scene "${scene.id}" already exists` }, { status: 409 });
  }
  await fs.writeFile(target, `${JSON.stringify(scene, null, 2)}\n`, "utf8");
  return NextResponse.json({ ok: true });
}
