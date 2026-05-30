import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/nav";
import { Footer } from "../components/footer";

export const metadata: Metadata = { title: "Enterprise Boilerplate" };

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Enterprise-grade starter kit
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            NestJS + Fastify + Drizzle + Better-Auth backend. Next.js + Shadcn +
            Zod frontend. Production-ready from day one.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-md border px-6 text-sm font-medium hover:bg-accent transition-colors"
            >
              GitHub
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="border-t py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-bold text-center mb-10">
              Everything you need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Auth & RBAC",
                  desc: "Better-Auth with roles and per-resource permissions out of the box.",
                },
                {
                  title: "File Storage",
                  desc: "S3-compatible storage with presigned URLs. MinIO in dev, any S3 in prod.",
                },
                {
                  title: "Audit Logs",
                  desc: "Every mutation logged automatically via NestJS interceptor.",
                },
                {
                  title: "Webhooks",
                  desc: "Outgoing webhooks with delivery history and retry logic.",
                },
                {
                  title: "Notifications",
                  desc: "In-app notification system with unread counts and bulk actions.",
                },
                {
                  title: "Monorepo",
                  desc: "Turborepo + Bun workspaces. Shared validators, UI, and DB packages.",
                },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-lg border p-5">
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
