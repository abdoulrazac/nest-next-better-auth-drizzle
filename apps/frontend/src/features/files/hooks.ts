import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { FileRecord, FilesPaginatedResponse } from "./types";

interface ListFilesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useListFiles(params?: ListFilesParams) {
  return useQuery({
    queryKey: ["files", params],
    queryFn: async () => {
      const res = await (apiClient.get({
        url: "/v1/files",
        query: params as Record<string, unknown>,
      }) as any);
      return res as FilesPaginatedResponse;
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete({ url: `/v1/files/${id}` }) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/v1/files`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}
