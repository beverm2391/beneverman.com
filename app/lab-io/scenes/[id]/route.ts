import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

// DELETE a saved lab scene by id. Dev-only (see ../route.ts).
const SCENES_DIR = path.resolve(process.cwd(), "site/lab/scenes");

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const { id } = await params;
  const safe = id.replace(/[^a-z0-9-]/gi, "");
  if (!safe) return NextResponse.json({ error: "bad scene id" }, { status: 400 });
  await fs.rm(path.join(SCENES_DIR, `${safe}.json`), { force: true });
  return NextResponse.json({ ok: true });
}
