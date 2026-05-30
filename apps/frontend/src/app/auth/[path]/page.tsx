import { viewPaths } from "@better-auth-ui/core";
import { redirect } from "next/navigation";
import { Auth } from "@/components/auth/auth";

interface AuthPageProps {
  params: Promise<{ path: string }>;
}

const validPaths = Object.values(viewPaths.auth);

export function generateStaticParams() {
  return validPaths.map((path) => ({ path }));
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params;

  if (!validPaths.includes(path as (typeof validPaths)[number])) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Auth path={`/auth/${path}`} />
    </div>
  );
}
