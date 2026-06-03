// @ts-nocheck
"use client";

import { BasePage } from "@/components";
import PageHeader from "@/components/shared/page-header";
import type { TemplateType } from "@/lib/template";
import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { TemplateEditor } from "../../_components/template-editor";

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const utils = api.useUtils();

  const { data, isLoading } = api.settings.template.getContent.useQuery({
    id: params.id,
  });

  const updateMutation = api.settings.template.updateContent.useMutation({
    onSuccess: () => {
      toast.success("Modèle mis à jour avec succès");
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
          title={data ? `Modifier — ${data.name}` : "Modifier le modèle"}
          description="Modifiez votre modèle de document avec l'éditeur visuel"
          variant="edit"
          backNavigation={{ href: "/settings/templates" }}
        />

        <TemplateEditor
          mode="edit"
          initialName={data?.name ?? ""}
          initialType={(data?.type as TemplateType) ?? "INVOICE_FV"}
          initialContent={data?.content ?? ""}
          isLoading={isLoading}
          onSubmit={(submitData) => {
            updateMutation.mutate({
              id: params.id,
              name: submitData.name,
              content: submitData.content,
            });
          }}
          isSaving={updateMutation.isPending}
        />
      </div>
    </BasePage>
  );
}
