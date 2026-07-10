import HomeMount from "@/scene/HomeMount";
import { SiteHeader } from "@/components/site-header";

// The landing is the ported v7 homepage (WebGL sun/shadow scene + intro),
// mounted client-only via HomeMount, with the shared nav fixed on top.
export default function HomePage() {
  return (
    <>
      <SiteHeader variant="scene" />
      <HomeMount />
    </>
  );
}
