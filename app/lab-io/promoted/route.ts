import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { parseScene } from "@/scene/lab/sceneSchema";

// A promoted scene is a self-contained production snapshot. The homepage never
// depends on a separately maintained registry of saved lab files.
const PROMOTED_FILE = path.resolve(process.cwd(), "scene/lab/promoted.json");

const isProd = () => process.env.NODE_ENV === "production";
const notFound = () => new NextResponse("Not found", { status: 404 });

export async function GET() {
  if (isProd()) return notFound();
  const raw = await fs.readFile(PROMOTED_FILE, "utf8").catch(() => '{"scene":null}');
  const body = JSON.parse(raw);
  return NextResponse.json({
    scene: body.scene === null ? null : parseScene(body.scene, "promoted scene")
  });
}

export async function PUT(req: Request) {
  if (isProd()) return notFound();
  const body = await req.json();
  let scene = null;
  try {
    scene = body?.scene === null ? null : parseScene(body?.scene, "promoted scene");
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
  await fs.writeFile(PROMOTED_FILE, `${JSON.stringify({ scene }, null, 2)}\n`, "utf8");
  return NextResponse.json({ ok: true, id: scene?.id ?? null });
}
