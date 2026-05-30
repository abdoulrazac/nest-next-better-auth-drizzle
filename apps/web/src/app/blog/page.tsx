import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../../components/nav";
import { Footer } from "../../components/footer";

export const metadata: Metadata = { title: "Blog" };

const posts = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description:
      "How to set up and run the Enterprise Boilerplate on your machine.",
    date: "2026-01-01",
  },
];

export default function BlogPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug} className="border-b pb-6">
              <Link href={`/blog/${post.slug}`} className="group">
                <h2 className="text-xl font-semibold group-hover:underline mb-1">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-1">
                  {post.date}
                </p>
                <p className="text-muted-foreground">{post.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
