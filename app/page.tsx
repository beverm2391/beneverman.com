import HomeMount from "@/scene/HomeMount";

// HomeMount keeps the WebGL renderer client-only while server-rendering the
// complete static shell as its loading and no-JavaScript state.
export default function HomePage() {
  return <HomeMount />;
}
