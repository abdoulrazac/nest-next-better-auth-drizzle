"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { EyeIcon, EyeOffIcon, LockPasswordIcon } from "@/lib/icons";

import { apiClient } from "@/lib/api";
import { FormSection } from "@/components/form-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SecurityFormValues = z.infer<typeof securitySchema>;

function PasswordField({
  id,
  label,
  placeholder,
  error,
  registration,
}: {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm>["register"]>;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pr-10"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          <Icon icon={show ? EyeOffIcon : EyeIcon} size={16} />
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function SecurityForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SecurityFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(securitySchema as any),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: SecurityFormValues) =>
      apiClient.post({
        url: "/v1/auth/change-password",
        body: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      }) as any,
    onSuccess: () => {
      toast.success("Password changed successfully");
      reset();
    },
    onError: () => {
      toast.error("Failed to change password. Check your current password.");
    },
  });

  return (
    <FormSection
      title="Change Password"
      description="Update your password to keep your account secure."
      footer={
        <Button
          type="submit"
          form="security-form"
          disabled={mutation.isPending}
        >
          <Icon icon={LockPasswordIcon} size={16} />
          {mutation.isPending ? "Saving..." : "Change password"}
        </Button>
      }
    >
      <form
        id="security-form"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        <PasswordField
          id="currentPassword"
          label="Current Password"
          placeholder="Enter current password"
          error={errors.currentPassword?.message}
          registration={register("currentPassword")}
        />
        <PasswordField
          id="newPassword"
          label="New Password"
          placeholder="Enter new password"
          error={errors.newPassword?.message}
          registration={register("newPassword")}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm New Password"
          placeholder="Confirm new password"
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword")}
        />
      </form>
    </FormSection>
  );
}
