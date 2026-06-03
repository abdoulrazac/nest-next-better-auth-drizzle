"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { CloudUploadIcon, FileUploadIcon } from "@/lib/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadFile } from "./hooks";
import { toast } from "sonner";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync, isPending } = useUploadFile();

  async function handleFile(file: File) {
    try {
      await mutateAsync(file);
      toast.success(`"${file.name}" uploaded successfully`);
      onOpenChange(false);
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Drag and drop a file or click to browse.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            isPending && "pointer-events-none opacity-50",
          )}
          onClick={() => inputRef.current?.click()}
        >
          <Icon
            icon={isPending ? FileUploadIcon : CloudUploadIcon}
            size={40}
            className="text-muted-foreground"
          />
          <div className="text-center">
            <p className="text-sm font-medium">
              {isPending ? "Uploading..." : "Drop file here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          disabled={isPending}
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
          >
            <Icon icon={FileUploadIcon} size={16} />
            {isPending ? "Uploading..." : "Choose File"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
