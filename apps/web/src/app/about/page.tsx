import type { Metadata } from "next";
import { Nav } from "../../components/nav";
import { Footer } from "../../components/footer";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="text-4xl font-bold mb-6">About</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>
            Enterprise Boilerplate is an opinionated fullstack starter built for
            teams who want to ship a production-ready application without
            spending weeks setting up infrastructure.
          </p>
          <p>
            It combines <strong className="text-foreground">NestJS</strong>{" "}
            (with Fastify adapter),{" "}
            <strong className="text-foreground">Drizzle ORM</strong>, and{" "}
            <strong className="text-foreground">Better-Auth</strong> on the
            backend — and <strong className="text-foreground">Next.js</strong>,{" "}
            <strong className="text-foreground">Shadcn/ui</strong>, and{" "}
            <strong className="text-foreground">Zod</strong> on the frontend —
            in a Turborepo monorepo with shared packages.
          </p>
          <p>
            The goal is to provide a solid foundation with RBAC, audit logs,
            file storage, webhooks, and notifications pre-wired, so you can
            focus on building your product.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
