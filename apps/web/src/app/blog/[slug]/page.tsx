import { notFound } from "next/navigation";
import { Nav } from "../../../components/nav";
import { Footer } from "../../../components/footer";

type SlugImport = {
  default: React.ComponentType;
  frontmatter: { title?: string; date?: string; description?: string };
};

const slugMap: Record<string, () => Promise<SlugImport>> = {
  "getting-started": () =>
    import("../../../../content/blog/getting-started.mdx") as Promise<SlugImport>,
};

export function generateStaticParams() {
  return Object.keys(slugMap).map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const importer = slugMap[slug];
  if (!importer) notFound();

  const { default: MDXContent, frontmatter } = await importer();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-20">
        <p className="text-sm text-muted-foreground mb-2">{frontmatter.date}</p>
        <h1 className="text-4xl font-bold mb-8">{frontmatter.title}</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
