import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface AppSelectProps {
  options: (string | Option)[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function AppSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  className,
  triggerClassName,
}: AppSelectProps) {
  const formattedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  return (
    <div className={cn("w-full", className)}>
      <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
        <SelectTrigger className={cn("text-small bg-card rounded-button px-4 py-2.5 border border-border outline-none text-foreground", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {formattedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
