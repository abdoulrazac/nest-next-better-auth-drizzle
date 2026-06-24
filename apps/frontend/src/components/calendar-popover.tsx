"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import { format } from "date-fns/format";
import { fr } from "date-fns/locale/fr";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";

interface Props {
  mode?: "single";
  placeholder?: string;
  value?: Date | string | undefined;
  onChange?: (date: Date | string) => void;
  disabled?: (date: Date) => boolean;
  triggerDisabled?: boolean;
  defaultMonth?: Date;
  startMonth?: Date;
  endMonth?: Date;
  className?: string;
}

export default function CalendarPopover({
  mode = "single",
  placeholder,
  value,
  onChange,
  disabled,
  triggerDisabled,
  defaultMonth,
  startMonth = new Date(new Date().getFullYear() - 80, 0),
  endMonth = new Date(new Date().getFullYear() + 10, 11),
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={triggerDisabled}
          className={cn(
            "w-full pl-3 text-left font-normal",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            !value
              ? "text-muted-foreground"
              : "text-secondary-foreground bg-transparent",
            className,
          )}
        >
          {value ? (
            format(value, "PP", { locale: fr })
          ) : (
            <span>{placeholder || "Choisissez une date"}</span>
          )}
          <Icon icon={CalendarIcon} className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode={mode}
          selected={value ? new Date(value) : undefined}
          onSelect={(v) => {
            if (v) {
              onChange?.(v.toString());
              setOpen(false);
            } else {
              onChange?.("");
            }
          }}
          disabled={disabled}
          defaultMonth={value ? new Date(value) : defaultMonth}
          startMonth={startMonth}
          endMonth={endMonth}
          captionLayout="dropdown"
          locale={fr}
        />
      </PopoverContent>
    </Popover>
  );
}
