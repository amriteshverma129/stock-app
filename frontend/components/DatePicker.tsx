"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  maxDate?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  maxDate,
}: DatePickerProps) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        max={maxDate}
        className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
