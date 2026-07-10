import { HomeIntro } from "./HomeIntro";

export function HomePageContent() {
  return (
    <>
      <HomeIntro />
      <footer className="inspiration-footer">
        shaders inspired by{" "}
        <a href="https://basement.studio/" rel="noreferrer" target="_blank">
          Basement Studio
        </a>{" "}
        and{" "}
        <a href="https://farayan.me/" rel="noreferrer" target="_blank">
          Fara Yan
        </a>
      </footer>
      <div className="surface-texture" aria-hidden="true" />
    </>
  );
}
