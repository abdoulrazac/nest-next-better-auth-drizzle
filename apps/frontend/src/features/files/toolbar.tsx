"use client";

import { Icon } from "@/components/ui/icon";
import { SearchIcon, GridIcon, ListViewIcon } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type View = "table" | "grid";

interface FilesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  view: View;
  onViewChange: (view: View) => void;
}

export function FilesToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
}: FilesToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Icon
          icon={SearchIcon}
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center border rounded-md">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-r-none border-r",
            view === "table" && "bg-muted",
          )}
          onClick={() => onViewChange("table")}
        >
          <Icon icon={ListViewIcon} size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("rounded-l-none", view === "grid" && "bg-muted")}
          onClick={() => onViewChange("grid")}
        >
          <Icon icon={GridIcon} size={16} />
        </Button>
      </div>
    </div>
  );
}
