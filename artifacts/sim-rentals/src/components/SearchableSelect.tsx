import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

type SearchableOption = {
  value: string;
  label: string;
  searchText?: string;
  meta?: string;
  icon?: string | null;
  disabled?: boolean;
};

type SearchableSelectProps = {
  value: string;
  options: SearchableOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
};

export function SearchableSelect({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  onChange,
  className,
  triggerClassName,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("h-12 w-full justify-between rounded-xl border-white/10 bg-white/[0.03] px-4 text-left font-normal hover:bg-white/[0.06]", triggerClassName)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected?.icon ? <img src={selected.icon} alt="" className="h-4 w-4 shrink-0 object-contain" /> : null}
            <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)} align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-80">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.value} ${option.searchText ?? option.label}`}
                  disabled={option.disabled}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="py-3"
                >
                  <Check className={cn("h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  {option.icon ? (
                    option.icon.length <= 4 && !option.icon.startsWith("http") ? (
                      <span className="text-base leading-none">{option.icon}</span>
                    ) : (
                      <img src={option.icon} alt="" className="h-4 w-4 shrink-0 object-contain" />
                    )
                  ) : (
                    <span className="h-4 w-4 shrink-0 rounded-sm bg-white/10" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.meta ? <span className="ml-auto shrink-0 text-xs font-medium text-cyan-300">{option.meta}</span> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
