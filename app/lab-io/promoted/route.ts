import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

// Promoted scene: which saved scene drives the live homepage (read in code by
// site/siteScene.ts via promoted.json). Dev-only, like the scenes endpoint.
const PROMOTED_FILE = path.resolve(process.cwd(), "site/lab/promoted.json");

const isProd = () => process.env.NODE_ENV === "production";
const notFound = () => new NextResponse("Not found", { status: 404 });

export async function GET() {
  if (isProd()) return notFound();
  const raw = await fs.readFile(PROMOTED_FILE, "utf8").catch(() => '{"id":null}');
  return NextResponse.json(JSON.parse(raw));
}

export async function PUT(req: Request) {
  if (isProd()) return notFound();
  const body = await req.json();
  const id = typeof body?.id === "string" ? body.id.replace(/[^a-z0-9-]/gi, "") : null;
  await fs.writeFile(PROMOTED_FILE, `${JSON.stringify({ id: id || null }, null, 2)}\n`, "utf8");
  return NextResponse.json({ ok: true, id: id || null });
}
