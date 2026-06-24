import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FilesPaginatedResponse } from "./types";

interface ListFilesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useListFiles(params?: ListFilesParams) {
  return useQuery({
    queryKey: ["files", params],
    queryFn: async () => {
      const { data, error } = await apiClient.v1.filesFindAll({
        query: {
          page: params?.page,
          limit: params?.pageSize,
        },
      });
      if (error) throw error;
      return data as unknown as FilesPaginatedResponse;
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await apiClient.v1.filesRemove({
        path: { id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      // Presigned-URL upload flow:
      // 1) ask the backend for a one-time PUT URL + object key
      const { data: presigned, error: pErr } =
        await apiClient.v1.filesGetPresignedUrl({
          body: {
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
          },
        });
      if (pErr) throw pErr;

      // 2) upload the raw file directly to object storage
      const uploadRes = await fetch(presigned!.uploadUrl, {
        method: "PUT",
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      // 3) confirm with the backend so it registers file metadata
      const { data: confirmed, error: cErr } =
        await apiClient.v1.filesConfirmUpload({
          body: {
            key: presigned!.key,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
          },
        });
      if (cErr) throw cErr;
      return confirmed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}
