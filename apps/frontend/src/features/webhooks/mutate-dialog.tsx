"use client";

import { FormSection } from "@/components/form/form-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateWebhook, useUpdateWebhook } from "./hooks";
import {
  AVAILABLE_EVENTS,
  createWebhookSchema,
  type WebhookFormValues,
} from "./schema";
import type { Webhook } from "./types";

interface MutateWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: Webhook | null;
}

export function MutateWebhookDialog({
  open,
  onOpenChange,
  webhook,
}: MutateWebhookDialogProps) {
  const isEditing = !!webhook;
  const createMutation = useCreateWebhook();
  const updateMutation = useUpdateWebhook();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(createWebhookSchema),
    defaultValues: { name: "", url: "", events: [], secret: "" },
  });

  useEffect(() => {
    if (open && webhook) {
      form.reset({
        name: webhook.name,
        url: webhook.url,
        events: webhook.events ?? [],
        secret: webhook.secret ?? "",
      });
    } else if (open && !webhook) {
      form.reset({ name: "", url: "", events: [], secret: "" });
    }
  }, [open, webhook, form]);

  function onSubmit(values: WebhookFormValues) {
    if (isEditing && webhook) {
      updateMutation.mutate(
        { id: webhook.id, data: values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Webhook" : "Create Webhook"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Webhook" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/webhook"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Secret{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional, min 16 chars)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Signing secret"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSection
              title="Events"
              description="Select which events should trigger this webhook"
            >
              <FormField
                name="events"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {AVAILABLE_EVENTS.map((event) => (
                        <label
                          key={event}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={(field.value as string[])?.includes(event)}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...((field.value as string[]) ?? []), event]
                                : ((field.value as string[]) ?? []).filter(
                                    (v: string) => v !== event,
                                  );
                              field.onChange(next);
                            }}
                          />
                          <span className="font-mono text-xs">{event}</span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Webhook"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
