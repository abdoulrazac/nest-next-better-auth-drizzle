import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/page-header";

interface SettingsPlaceholderProps {
  title: string;
  description: string;
}

export function SettingsPlaceholder({
  title,
  description,
}: SettingsPlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} variant="list" />
      <Card>
        <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Cette fonctionnalité sera disponible prochainement.
        </CardContent>
      </Card>
    </div>
  );
}
