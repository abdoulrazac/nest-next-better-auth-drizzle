import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type {
  AppSettingsResponse,
  UpdateAppSettings,
  UserPreferencesResponse,
  UpdateUserPreferences,
} from "@repo/validators/settings";

export const settingsKeys = {
  app: ["settings", "app"] as const,
  preferences: ["settings", "preferences"] as const,
};

export function useGetAppSettings() {
  return useQuery({
    queryKey: settingsKeys.app,
    queryFn: async () => {
      const res = (await apiClient.get({ url: "/v1/settings/app" })) as any;
      return res.data as AppSettingsResponse;
    },
    staleTime: 60_000,
  });
}

export function useUpdateAppSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAppSettings) =>
      apiClient.patch({ url: "/v1/settings/app", body: data }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.app });
      toast.success("Paramètres enregistrés");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
}

export function useGetPreferences() {
  return useQuery({
    queryKey: settingsKeys.preferences,
    queryFn: async () => {
      const res = (await apiClient.get({
        url: "/v1/settings/preferences",
      })) as any;
      return res.data as UserPreferencesResponse;
    },
    staleTime: 60_000,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserPreferences) =>
      apiClient.patch({
        url: "/v1/settings/preferences",
        body: data,
      }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.preferences });
      toast.success("Préférences enregistrées");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
}
