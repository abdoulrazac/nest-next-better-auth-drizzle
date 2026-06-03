import { BasePage } from "@/components/layout";
import { SettingsNav } from "./_components/settings-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BasePage breadcrumbs={[{ title: "Paramétrage", url: "/settings" }]}>
      <div className="flex gap-8">
        <SettingsNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </BasePage>
  );
}
