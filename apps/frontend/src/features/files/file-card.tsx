"use client";

import { Icon } from "@/components/ui/icon";
import { FileIcon, DownloadIcon, TrashIcon } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FileRecord } from "./types";

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

interface FileCardProps {
  file: FileRecord;
  onDelete: (id: string) => void;
}

export function FileCard({ file, onDelete }: FileCardProps) {
  const isImage = file.mimeType.startsWith("image/");

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img
            src={file.url}
            alt={file.originalName}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon icon={FileIcon} size={40} className="text-muted-foreground" />
        )}
      </div>
      <CardContent className="p-3 space-y-1">
        <p className="text-sm font-medium truncate" title={file.originalName}>
          {file.originalName}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(file.size)}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(file.createdAt).toLocaleDateString()}
        </p>
        <div className="flex gap-1 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(file.url, "_blank")}
          >
            <Icon icon={DownloadIcon} size={14} />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(file.id)}
            className="text-destructive hover:text-destructive"
          >
            <Icon icon={TrashIcon} size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
