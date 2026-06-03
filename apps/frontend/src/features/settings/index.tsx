"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "./profile-form";
import { AppearanceForm } from "./appearance-form";
import { SecurityForm } from "./security-form";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings."
      />
      <Separator />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="appearance" className="mt-6">
          <AppearanceForm />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <SecurityForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
