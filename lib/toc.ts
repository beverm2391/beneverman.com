import GithubSlugger from "github-slugger";

export type TocItem = {
  id: string;
  text: string;
  depth: 2 | 3;
};

export type TocNode = TocItem & {
  children: TocNode[];
};

// Turn the source-order heading list into the same outline represented by the
// rendered h2/h3 elements. A deeper heading belongs to the nearest preceding
// shallower heading; peers and shallower headings close the current branch.
// Orphaned deep headings stay reachable at the root instead of being dropped.
export function nestToc(items: TocItem[]): TocNode[] {
  const roots: TocNode[] = [];
  const ancestors: TocNode[] = [];

  for (const item of items) {
    const node: TocNode = { ...item, children: [] };
    let parent = ancestors.at(-1);
    while (parent && parent.depth >= node.depth) {
      ancestors.pop();
      parent = ancestors.at(-1);
    }

    if (parent) parent.children.push(node);
    else roots.push(node);

    ancestors.push(node);
  }

  return roots;
}

// Strip inline markdown from a heading line so the visible text (and the slug
// derived from it) matches what rehype-slug produces from the rendered HTML:
// links keep their label, code/emphasis markers drop, footnote refs vanish.
function headingText(raw: string) {
  return raw
    .replace(/\[\^[^\]]*\]/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

// Collects h2/h3 headings from raw MDX for the post TOC. Slugs come from the
// same github-slugger that rehype-slug uses (including its duplicate-counter
// behavior), so these ids line up with the anchors in the compiled HTML as
// long as both see the same headings in the same order. Fenced code blocks
// are skipped so a `## comment` inside a snippet can't leak in; the
// remark-gfm footnotes section never appears here because its heading is
// generated at render time, already carrying its own id (rehype-slug skips
// it, keeping the slug sequences aligned).
export function extractToc(source: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!match) continue;

    const text = headingText(match[2]);
    if (!text) continue;
    // Every heading feeds the slugger (rehype-slug numbers duplicates across
    // all levels), but only h2/h3 are TOC material.
    const id = slugger.slug(text);
    const depth = match[1].length;
    if (depth === 2 || depth === 3) items.push({ id, text, depth });
  }

  return items;
}
