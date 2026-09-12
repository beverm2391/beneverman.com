import fs from "node:fs/promises";
import path from "node:path";
import type { PostComponents } from "@/lib/mdx";
import {
  assertPublicationSlug,
  publicationDirectory,
  type PublicationLabel
} from "@/lib/publication-data";

// A folder post's `components.tsx` exports the MDX components only that post
// uses. Loading them per slug is what keeps the shared component map in
// lib/mdx.ts generic: the system never has to name a post. This lives apart
// from lib/publication-data.ts because the dynamic import below gives the
// bundler a module context over every post's components, and the metadata
// and feed routes that import the data module must not pay for that.
function createComponentLoader(label: PublicationLabel) {
  const contentDirectory = publicationDirectory(label);

  return async function loadComponents(slug: string): Promise<PostComponents> {
    assertPublicationSlug(label, slug);

    const componentsPath = path.join(contentDirectory, slug, "components.tsx");
    const exists = await fs.access(componentsPath).then(() => true, () => false);
    if (!exists) return {};

    // Two literal roots and an explicit extension keep the bundler's context
    // narrow: only content/{blog,research}/*/components.tsx resolve, never
    // the whole tree.
    const loaded: PostComponents =
      label === "blog"
        ? await import(`../content/blog/${slug}/components.tsx`)
        : await import(`../content/research/${slug}/components.tsx`);
    return { ...loaded };
  };
}

export const loadBlogPostComponents = createComponentLoader("blog");
export const loadResearchComponents = createComponentLoader("research");
