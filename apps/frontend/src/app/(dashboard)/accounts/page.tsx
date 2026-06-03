// @ts-nocheck
"use client";

import { Spinner } from "@/components/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/accounts/users");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-24">
      <Spinner />
    </div>
  );
}
