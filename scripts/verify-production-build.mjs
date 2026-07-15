import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();

async function filesUnder(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(target) : [target];
    })
  );
  return files.flat();
}

function assert(condition, message) {
  if (!condition) throw new Error(`Production build verification failed: ${message}`);
}

const homeHtml = await fs.readFile(path.join(root, ".next/server/app/index.html"), "utf8");
assert(homeHtml.includes("Ben Everman"), "homepage HTML does not contain the server-rendered intro");
// The scene is client-only and fades in after load (useSceneArrival); the
// server HTML is the flat shell plus content, with no scene markup.
assert(homeHtml.includes("site-shell"), "homepage HTML does not contain the server-rendered shell");

const labMeta = JSON.parse(await fs.readFile(path.join(root, ".next/server/app/lab.meta"), "utf8"));
assert(labMeta.status === 404, "production /lab route is not a 404");

const staticFiles = await filesUnder(path.join(root, ".next/static"));
const staticText = (
  await Promise.all(
    staticFiles
      .filter((file) => /\.(?:css|js)$/.test(file))
      .map((file) => fs.readFile(file, "utf8"))
  )
).join("\n");

assert(!staticText.includes("Promote to homepage"), "lab editor JavaScript leaked into static assets");
assert(!staticText.includes("--lab-bg"), "lab CSS leaked into static assets");

const serverFiles = await filesUnder(path.join(root, ".next/server/app"));
const feedBodies = serverFiles.filter((file) => file.endsWith("feed.xml.body"));
assert(feedBodies.length === 1, "RSS feed was not emitted as a static route");
assert((await fs.readFile(feedBodies[0], "utf8")).includes('<rss version="2.0">'), "RSS output is invalid");

// A post whose MDX fails to compile renders notFound() rather than crashing the
// build (see the [slug] page), so it prerenders as a 404 artifact and the build
// still goes green — that once shipped the whole teeny-agent post as a dead URL
// because headless Chromium (mermaid) was missing at build time. Assert the
// build's own output instead of re-deriving the published set: every post route
// Next chose to prerender must be a real article.
const blogDirectory = path.join(root, ".next/server/app/blog");
const postSlugs = (await fs.readdir(blogDirectory))
  .filter((entry) => entry.endsWith(".html"))
  .map((entry) => entry.replace(/\.html$/, ""));

assert(postSlugs.length > 0, "no blog posts were prerendered");

for (const slug of postSlugs) {
  const meta = JSON.parse(await fs.readFile(path.join(blogDirectory, `${slug}.meta`), "utf8"));
  // Healthy pages carry no status override; only failures write one.
  assert(
    (meta.status ?? 200) === 200,
    `blog post "${slug}" prerendered as ${meta.status} — its MDX almost certainly failed to compile`
  );
  const html = await fs.readFile(path.join(blogDirectory, `${slug}.html`), "utf8");
  assert(html.includes("<article"), `blog post "${slug}" prerendered without an article body`);
}

console.log(
  `Production build verification passed: complete SSR home, lab 404/exclusion, RSS output, and ${postSlugs.length} rendered post(s).`
);
