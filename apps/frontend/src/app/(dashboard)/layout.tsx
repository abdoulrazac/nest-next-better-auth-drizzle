import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { getSession } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/query-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  const session = await getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardShell>{children}</DashboardShell>
    </HydrationBoundary>
  );
}
