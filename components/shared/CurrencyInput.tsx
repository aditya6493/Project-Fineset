"use client";

import { IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils/currency-input";

interface CurrencyInputProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  onBlur?: () => void;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "Enter amount",
  className,
  id,
  name,
  onBlur,
}: CurrencyInputProps) {
  return (
    <div className={cn("relative", className)}>
      <IndianRupee
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gold"
        aria-hidden
      />
      <Input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        className="pl-9 tabular-nums"
        value={value != null ? formatCurrencyInput(value) : ""}
        onChange={(event) => {
          onChange(parseCurrencyInput(event.target.value));
        }}
        onBlur={onBlur}
      />
    </div>
  );
}
