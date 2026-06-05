"use client";

import { Icon } from "@/components/ui/icon";
import { UserIcon } from "@/lib/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@nanostores/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormSection } from "@/components/form/form-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const profileSchema = z.object({
  name: z.string().min(1, "Display name is required"),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const session = useStore(authClient.useSession);
  const user = session?.data?.user;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema as any),
    defaultValues: { name: "", bio: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        bio: (user as { bio?: string }).bio ?? "",
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      apiClient.patch({ url: "/v1/settings/profile", body: values }) as any,
    onSuccess: () => toast.success("Profile updated"),
    onError: () => toast.error("Failed to update profile"),
  });

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="space-y-6">
      <FormSection title="Avatar">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage
              src={user?.image ?? undefined}
              alt={user?.name ?? "User"}
            />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Profile Information"
        description="Update your display name and bio."
        footer={
          <Button
            type="submit"
            form="profile-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        }
      >
        <form
          id="profile-form"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
        >
          <div className="space-y-1">
            <Label htmlFor="name">Display Name</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Icon icon={UserIcon} size={16} />
              </span>
              <Input
                id="name"
                className="pl-9"
                placeholder="Your name"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email ?? ""}
              readOnly
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us a little about yourself"
              className="resize-none"
              rows={3}
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>
        </form>
      </FormSection>
    </div>
  );
}
