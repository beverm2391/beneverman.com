import { notFound } from "next/navigation";
import LabMount from "@/site/lab/LabMount";

// The scene lab is a dev-only authoring tool — never reachable in production
// (matches v7, where the /lab route only existed outside the prod build).
export default function LabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <LabMount />;
}
