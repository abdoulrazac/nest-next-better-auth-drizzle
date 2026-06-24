// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { Save } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReminderLevel {
  level: "first" | "second" | "final";
  label: string;
  description: string;
  daysAfterDue: number;
  channel: string;
  subject: string;
  bodyTemplate: string;
  isActive: boolean;
}

const DEFAULT_LEVELS: ReminderLevel[] = [
  {
    level: "first",
    label: "Premier rappel",
    description: "Rappel courtois après l'échéance",
    daysAfterDue: 3,
    channel: "email",
    subject: "",
    bodyTemplate: "",
    isActive: true,
  },
  {
    level: "second",
    label: "Deuxième rappel",
    description: "Rappel de suivi plus insistant",
    daysAfterDue: 7,
    channel: "email",
    subject: "",
    bodyTemplate: "",
    isActive: true,
  },
  {
    level: "final",
    label: "Rappel final",
    description: "Dernier rappel avant action",
    daysAfterDue: 14,
    channel: "email",
    subject: "",
    bodyTemplate: "",
    isActive: true,
  },
];

export function ReminderConfigForm() {
  const [levels, setLevels] = useState<ReminderLevel[]>(DEFAULT_LEVELS);
  const utils = api.useUtils();

  const { data: configs, isLoading } =
    api.settings.reminderConfig.getAll.useQuery();
  const upsertAll = api.settings.reminderConfig.upsertAll.useMutation({
    onSuccess: () => {
      toast.success("Configuration des relances enregistrée");
      void utils.settings.reminderConfig.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (configs && configs.length > 0) {
      setLevels(
        DEFAULT_LEVELS.map((def) => {
          const saved = configs.find((c: any) => c.level === def.level);
          if (!saved) return def;
          return {
            ...def,
            daysAfterDue: saved.daysAfterDue,
            channel: saved.channel,
            subject: saved.subject ?? "",
            bodyTemplate: saved.bodyTemplate ?? "",
            isActive: saved.isActive,
          };
        }),
      );
    }
  }, [configs]);

  const updateLevel = (index: number, updates: Partial<ReminderLevel>) => {
    setLevels((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...updates } : l)),
    );
  };

  const handleSubmit = () => {
    upsertAll.mutate({
      configs: levels.map((l) => ({
        level: l.level,
        daysAfterDue: l.daysAfterDue,
        channel: l.channel as "email" | "sms",
        subject: l.subject || undefined,
        bodyTemplate: l.bodyTemplate || undefined,
        isActive: l.isActive,
      })),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-40" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {levels.map((level, index) => (
        <Card key={level.level}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">{level.label}</CardTitle>
              <CardDescription>{level.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor={`active-${level.level}`}
                className="text-sm text-muted-foreground"
              >
                Actif
              </Label>
              <Switch
                id={`active-${level.level}`}
                checked={level.isActive}
                onCheckedChange={(checked) =>
                  updateLevel(index, { isActive: checked })
                }
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`days-${level.level}`}>
                  Jours après échéance
                </Label>
                <Input
                  id={`days-${level.level}`}
                  type="number"
                  min={1}
                  max={365}
                  value={level.daysAfterDue}
                  onChange={(e) =>
                    updateLevel(index, {
                      daysAfterDue: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  disabled={!level.isActive}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`channel-${level.level}`}>Canal d'envoi</Label>
                <Input
                  id={`channel-${level.level}`}
                  value="Email"
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`subject-${level.level}`}>
                Objet personnalisé (optionnel)
              </Label>
              <Input
                id={`subject-${level.level}`}
                placeholder="Laisser vide pour utiliser l'objet par défaut"
                value={level.subject}
                onChange={(e) =>
                  updateLevel(index, { subject: e.target.value })
                }
                disabled={!level.isActive}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`body-${level.level}`}>
                Message personnalisé (optionnel)
              </Label>
              <Textarea
                id={`body-${level.level}`}
                placeholder="Laisser vide pour utiliser le template par défaut"
                rows={3}
                value={level.bodyTemplate}
                onChange={(e) =>
                  updateLevel(index, { bodyTemplate: e.target.value })
                }
                disabled={!level.isActive}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={upsertAll.isPending}>
          <Icon icon={Save} className="mr-1" />
          {upsertAll.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
