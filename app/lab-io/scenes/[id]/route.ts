import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { sceneIdSchema } from "@/scene/lab/sceneSchema";

// DELETE a saved lab scene by id. Dev-only (see ../route.ts).
const SCENES_DIR = path.resolve(process.cwd(), "scene/lab/scenes");

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const { id } = await params;
  const parsed = sceneIdSchema.safeParse(id);
  if (!parsed.success) return NextResponse.json({ error: "bad scene id" }, { status: 400 });
  await fs.rm(path.join(SCENES_DIR, `${parsed.data}.json`), { force: true });
  return NextResponse.json({ ok: true });
}
