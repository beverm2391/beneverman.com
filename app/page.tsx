import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Ben Everman</h1>
      <p>This is the scaffold for the personal site.</p>
      <p>
        <Link href="/blog">Read the blog</Link>
      </p>
    </main>
  );
}
