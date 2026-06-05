"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/accounts/users");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </div>
  );
}
