import HomeMount from "@/scene/HomeMount";

// The landing is the ported v7 homepage (WebGL sun/shadow scene + intro),
// mounted client-only via HomeMount.
export default function HomePage() {
  return <HomeMount />;
}
