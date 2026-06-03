// @ts-nocheck
"use client";

import { BasePage } from "@/components";
import PageHeader from "@/components/shared/page-header";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TemplateEditor } from "../_components/template-editor";

export default function NewTemplatePage() {
  const router = useRouter();
  const utils = api.useUtils();

  const createMutation = api.settings.template.createFromContent.useMutation({
    onSuccess: () => {
      toast.success("Modèle créé avec succès");
      void utils.settings.template.invalidate();
      router.push("/settings/templates");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <BasePage
      breadcrumbs={[
        { title: "Paramètres", url: "/settings" },
        { title: "Modèles de Documents", url: "/settings/templates" },
      ]}
    >
      <div className="space-y-4">
        <PageHeader
          title="Nouveau modèle"
          description="Personnalisez votre modèle de document avec l'éditeur visuel"
          variant="create"
          backNavigation={{ href: "/settings/templates" }}
        />

        <TemplateEditor
          mode="create"
          onSubmit={(data) => {
            createMutation.mutate({
              name: data.name,
              type: data.type,
              content: data.content,
              isDefault: false,
            });
          }}
          isSaving={createMutation.isPending}
        />
      </div>
    </BasePage>
  );
}
