import HomeMount from "@/scene/HomeMount";
import { SiteHeader } from "@/components/site-header";

// HomeMount keeps the WebGL renderer client-only while server-rendering the
// complete static shell as its loading/no-JavaScript state; the shared scene
// header stays fixed above both versions.
export default function HomePage() {
  return (
    <>
      <SiteHeader variant="scene" />
      <HomeMount />
    </>
  );
}
