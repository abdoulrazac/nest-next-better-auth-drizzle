import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      const { data, error } = await apiClient.v1.settingsGetAppSettings();
      if (error) throw error;
      return data as unknown as AppSettingsResponse;
    },
    staleTime: 60_000,
  });
}

export function useUpdateAppSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateAppSettings) => {
      const { data: res, error } = await apiClient.v1.settingsUpdateAppSettings(
        {
          body: data,
        },
      );
      if (error) throw error;
      return res;
    },
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
      const { data, error } = await apiClient.v1.settingsGetPreferences();
      if (error) throw error;
      return data as unknown as UserPreferencesResponse;
    },
    staleTime: 60_000,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateUserPreferences) => {
      const { data: res, error } = await apiClient.v1.settingsUpdatePreferences(
        {
          body: data,
        },
      );
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.preferences });
      toast.success("Préférences enregistrées");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
}
