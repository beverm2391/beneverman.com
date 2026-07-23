import fs from "node:fs/promises";
import path from "node:path";

const contentPageDirectory = path.join(process.cwd(), "content/pages");
const allowedSlug = /^[a-z0-9-]+$/;

export async function readContentPageSource(slug: string) {
  if (!allowedSlug.test(slug)) {
    throw new Error(`Invalid content page slug "${slug}".`);
  }

  return fs.readFile(path.join(contentPageDirectory, `${slug}.mdx`), "utf8");
}
