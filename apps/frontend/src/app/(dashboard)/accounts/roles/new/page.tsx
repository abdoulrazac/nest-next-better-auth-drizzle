// @ts-nocheck
"use client";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import type { INavItem } from "@/types";
import { ArrowLeftIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import RoleForm from "../_components/role-form";

export default function NewRolePage() {
  const breadcrumbs: INavItem[] = [
    { title: "Administration", url: "/accounts" },
    { title: "Rôles", url: "/accounts/roles" },
    { title: "Nouveau rôle", url: "/accounts/roles/new" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/accounts/roles">
            <HugeiconsIcon icon={ArrowLeftIcon} className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouveau rôle</h1>
          <p className="text-muted-foreground">
            Créez un nouveau rôle avec ses permissions
          </p>
        </div>
      </div>

      <RoleForm />
    </div>
  );
}
