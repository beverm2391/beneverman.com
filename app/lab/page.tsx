import type { Metadata } from "next";
import LabMount from "@/scene/lab/LabMount";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

// next.config aliases this exact module to a tiny 404 in production. That
// excludes the editor, Three.js lab layers, Coss UI, and lab CSS from client
// assets instead of merely hiding them behind a runtime NODE_ENV branch.
export default function LabPage() {
  return <LabMount />;
}
