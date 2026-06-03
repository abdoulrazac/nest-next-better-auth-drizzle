"use client";

import { useState } from "react";
import { FileUploadIcon } from "@/lib/icons";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";
import { useListFiles, useDeleteFile } from "./hooks";
import { getColumns } from "./columns";
import { FileCard } from "./file-card";
import { FilesToolbar } from "./toolbar";
import { UploadDialog } from "./upload-dialog";
import type { FileRecord } from "./types";

type View = "table" | "grid";

export function FilesPage() {
  const [view, setView] = useState<View>("table");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useListFiles({ search: search || undefined });
  const deleteFile = useDeleteFile();

  const items = data?.items ?? [];

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteFile.mutateAsync(deleteId);
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeleteId(null);
    }
  }

  const columns = getColumns({ onDelete: setDeleteId });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Files"
        description="Manage uploaded files"
        action={{
          label: "Upload File",
          icon: FileUploadIcon,
          onClick: () => setUploadOpen(true),
        }}
      />

      <div className="space-y-4">
        <FilesToolbar
          search={search}
          onSearchChange={setSearch}
          view={view}
          onViewChange={setView}
        />

        {view === "table" ? (
          <DataTable columns={columns} data={items} isLoading={isLoading} />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg bg-muted animate-pulse"
                  />
                ))
              : items.map((file: FileRecord) => (
                  <FileCard key={file.id} file={file} onDelete={setDeleteId} />
                ))}
            {!isLoading && items.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No files found.
              </div>
            )}
          </div>
        )}
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete File"
        description="Are you sure you want to delete this file? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isPending={deleteFile.isPending}
      />
    </div>
  );
}
