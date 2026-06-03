"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  CheckIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
  ChevronDownIcon,
  RefreshIcon,
} from "@/lib/icons";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SelectOption<T = string> {
  label: string;
  value: T;
  description?: string;
  /** Icon rendered left of the label */
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Assign to a named group */
  group?: string;
}

type SingleValue<T> = T | null;
type MultiValue<T> = T[];

interface BaseProps<T> {
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  /** Show spinner while loading options */
  isLoading?: boolean;
  className?: string;
  /** Width of the trigger. Defaults to full width. */
  triggerClassName?: string;
  /**
   * Async fetch function. Receives the current search string.
   * When provided, client-side filtering is disabled.
   */
  fetchOptions?: (search: string) => Promise<SelectOption<T>[]>;
  /** Static options (used when fetchOptions is not provided). */
  options?: SelectOption<T>[];
  /**
   * Debounce delay in ms for async search.
   * @default 300
   */
  debounceMs?: number;
  /**
   * Enable "Create X" item at the bottom when the search string
   * doesn't match any option.
   */
  creatable?: boolean;
  /**
   * Called when the user confirms creating a new option.
   * Receives the raw input string.
   */
  onCreate?: (label: string) => void | Promise<void>;
  /** Label prefix for the create item. Defaults to "Create". */
  createLabel?: string;
  /**
   * Extra action button shown at the bottom of the dropdown.
   * Useful for "Open form to add a new role" patterns.
   */
  addAction?: {
    label: string;
    icon?: React.ComponentProps<typeof Icon>["icon"];
    onClick: () => void;
  };
  /** Text shown when no options match. */
  emptyText?: string;
}

// Single-select props
interface SingleProps<T> extends BaseProps<T> {
  multiple?: false;
  value?: SingleValue<T>;
  defaultValue?: SingleValue<T>;
  onChange?: (value: SingleValue<T>) => void;
}

// Multi-select props
interface MultiProps<T> extends BaseProps<T> {
  multiple: true;
  value?: MultiValue<T>;
  defaultValue?: MultiValue<T>;
  onChange?: (value: MultiValue<T>) => void;
}

export type ResourceSelectProps<T = string> = SingleProps<T> | MultiProps<T>;

// ─── Internal hook: option resolution ────────────────────────────────────────

function useResolvedOptions<T>(
  options: SelectOption<T>[] | undefined,
  fetchOptions: BaseProps<T>["fetchOptions"],
  search: string,
  debounceMs: number,
) {
  const debouncedSearch = useDebounce(search, debounceMs);
  const isAsync = !!fetchOptions;

  const queryResult = useQuery({
    queryKey: ["resource-select", fetchOptions?.toString(), debouncedSearch],
    queryFn: () => fetchOptions!(debouncedSearch),
    enabled: isAsync,
    staleTime: 30_000,
    placeholderData: (prev) => prev, // keep previous results while fetching
  });

  if (isAsync) {
    return {
      resolvedOptions: queryResult.data ?? [],
      isFetching: queryResult.isFetching,
    };
  }

  return {
    resolvedOptions: options ?? [],
    isFetching: false,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ResourceSelect<T = string>(props: ResourceSelectProps<T>) {
  const {
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    disabled = false,
    isLoading = false,
    className,
    triggerClassName,
    fetchOptions,
    options,
    debounceMs = 300,
    creatable = false,
    onCreate,
    createLabel = "Create",
    addAction,
    emptyText = "No results found.",
    multiple,
  } = props;

  const isAsync = !!fetchOptions;
  const [inputValue, setInputValue] = React.useState("");
  const chipsAnchor = useComboboxAnchor();

  const { resolvedOptions, isFetching } = useResolvedOptions(
    options,
    fetchOptions,
    inputValue,
    debounceMs,
  );

  const isPending = isLoading || isFetching;

  // Group options by `group` field
  const grouped = React.useMemo(() => {
    const groups = new Map<string | undefined, SelectOption<T>[]>();
    for (const opt of resolvedOptions) {
      const key = opt.group;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(opt);
    }
    return groups;
  }, [resolvedOptions]);

  const hasGroups = [...grouped.keys()].some((k) => k !== undefined);

  // Show creatable item when: search is non-empty AND no exact match found
  const showCreatable =
    creatable &&
    inputValue.trim().length > 0 &&
    !resolvedOptions.some(
      (o) => o.label.toLowerCase() === inputValue.trim().toLowerCase(),
    );

  const handleCreate = async () => {
    if (onCreate) await onCreate(inputValue.trim());
    setInputValue("");
  };

  // ── Shared option rendering ─────────────────────────────────────────────

  const renderOptions = () => {
    if (hasGroups) {
      return [...grouped.entries()].map(([groupName, groupOptions]) => (
        <ComboboxGroup key={groupName ?? "__ungrouped"}>
          {groupName && <ComboboxLabel>{groupName}</ComboboxLabel>}
          {groupOptions.map((opt) => (
            <OptionItem key={String(opt.value)} option={opt} />
          ))}
        </ComboboxGroup>
      ));
    }

    return resolvedOptions.map((opt) => (
      <OptionItem key={String(opt.value)} option={opt} />
    ));
  };

  // ── Dropdown footer ─────────────────────────────────────────────────────

  const hasFooter = showCreatable || !!addAction;

  const renderFooter = () => (
    <>
      {hasFooter && <ComboboxSeparator />}

      {showCreatable && (
        <button
          type="button"
          className="flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-xs text-primary hover:bg-accent"
          onMouseDown={(e) => {
            e.preventDefault();
            void handleCreate();
          }}
        >
          <Icon icon={PlusIcon} size={13} />
          {createLabel} &quot;{inputValue.trim()}&quot;
        </button>
      )}

      {addAction && (
        <button
          type="button"
          className="flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          onMouseDown={(e) => {
            e.preventDefault();
            addAction.onClick();
          }}
        >
          {addAction.icon ? (
            <Icon icon={addAction.icon} size={13} />
          ) : (
            <Icon icon={PlusIcon} size={13} />
          )}
          {addAction.label}
        </button>
      )}
    </>
  );

  // ── Render ──────────────────────────────────────────────────────────────

  if (multiple) {
    const multiProps = props as MultiProps<T>;

    return (
      <Combobox
        multiple
        value={multiProps.value}
        defaultValue={multiProps.defaultValue}
        onValueChange={multiProps.onChange}
        inputValue={isAsync ? inputValue : undefined}
        onInputValueChange={(val) => setInputValue(val)}
        filteredItems={isAsync ? resolvedOptions : undefined}
        disabled={disabled}
        // @ts-expect-error — base-ui Combobox accepts className at runtime
        className={cn("w-full", className)}
      >
        <ComboboxChips
          ref={chipsAnchor}
          className={cn("w-full", triggerClassName)}
        >
          <ComboboxChipsInput placeholder={placeholder} />
          <ChevronTrigger />
        </ComboboxChips>

        <ComboboxContent anchor={chipsAnchor}>
          <ComboboxInput showTrigger={false} placeholder={searchPlaceholder} />
          <ComboboxList>
            {isPending ? (
              <LoadingRow />
            ) : isAsync ? (
              <>
                {resolvedOptions.length === 0 && !showCreatable ? (
                  <EmptyRow text={emptyText} />
                ) : (
                  renderOptions()
                )}
              </>
            ) : (
              <>
                {renderOptions()}
                <ComboboxEmpty>{emptyText}</ComboboxEmpty>
              </>
            )}
            {renderFooter()}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  }

  // Single select
  const singleProps = props as SingleProps<T>;

  return (
    <Combobox
      value={singleProps.value ?? null}
      defaultValue={singleProps.defaultValue}
      onValueChange={singleProps.onChange}
      inputValue={isAsync ? inputValue : undefined}
      onInputValueChange={(val) => setInputValue(val)}
      filteredItems={isAsync ? resolvedOptions : undefined}
      disabled={disabled}
      // @ts-expect-error — base-ui Combobox accepts className at runtime
      className={cn("w-full", className)}
    >
      <ComboboxInput
        showTrigger
        showClear={!!singleProps.value}
        placeholder={placeholder}
        className={cn("w-full", triggerClassName)}
      />

      <ComboboxContent>
        {isAsync && (
          <ComboboxInput showTrigger={false} placeholder={searchPlaceholder} />
        )}
        <ComboboxList>
          {isPending ? (
            <LoadingRow />
          ) : isAsync ? (
            <>
              {resolvedOptions.length === 0 && !showCreatable ? (
                <EmptyRow text={emptyText} />
              ) : (
                renderOptions()
              )}
            </>
          ) : (
            <>
              {renderOptions()}
              <ComboboxEmpty>{emptyText}</ComboboxEmpty>
            </>
          )}
          {renderFooter()}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionItem<T>({ option }: { option: SelectOption<T> }) {
  return (
    <ComboboxItem value={option.value as string} disabled={option.disabled}>
      {option.icon && (
        <span className="shrink-0 text-muted-foreground">{option.icon}</span>
      )}
      <div className="flex flex-col min-w-0">
        <span className="truncate">{option.label}</span>
        {option.description && (
          <span className="truncate text-[10px] text-muted-foreground">
            {option.description}
          </span>
        )}
      </div>
    </ComboboxItem>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
      <Icon icon={RefreshIcon} size={13} className="animate-spin" />
      Loading...
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="py-2 text-center text-xs text-muted-foreground">{text}</div>
  );
}

function ChevronTrigger() {
  return (
    <ComboboxPrimitive.Trigger className="ml-auto flex h-full shrink-0 items-center px-2 text-muted-foreground">
      <Icon icon={ChevronDownIcon} size={13} />
    </ComboboxPrimitive.Trigger>
  );
}
