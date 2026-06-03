import { ensureSession } from "@better-auth-ui/react/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getQueryClient } from "@/lib/query-client";
import { Sidebar } from "../../components/sidebar";
import { Header } from "../../components/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const requestHeaders = await headers();

  const session = await ensureSession(queryClient, auth, {
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </HydrationBoundary>
  );
}
