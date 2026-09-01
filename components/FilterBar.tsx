"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type DateRangeOption = "all" | "last7days" | "last30days" | "custom";
type StatusOption = "all" | "reserved" | "outstanding" | "paid";
type CurrencyOption = "USD" | "GHS" | "GBP" | "EUR";

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  onChange,
  options,
}) => (
  <div className="flex flex-col gap-2.5 flex-1">
    <label className="text-xs font-semibold text-foreground uppercase tracking-widest opacity-75">
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="h-10 px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-medium
        hover:bg-muted/50 hover:border-border/80 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
        cursor-pointer appearance-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default function FilterBar() {
  const [dateRange, setDateRange] = useState<DateRangeOption>("all");
  const [status, setStatus] = useState<StatusOption>("all");
  const [currency, setCurrency] = useState<CurrencyOption>("USD");

  return (
    <div className="w-full">
      {/* Main Filter Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="bg-linear-to-r from-card to-muted/30 border-b border-border/50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Search & Filter</h2>
              <p className="text-xs text-muted-foreground mt-1">Refine your claims by date, status, or currency</p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-6 border-b border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FilterSelect
              label="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              options={[
                { value: "all", label: "All dates" },
                { value: "last7days", label: "Last 7 days" },
                { value: "last30days", label: "Last 30 days" },
                { value: "custom", label: "Custom range" },
              ]}
            />

            <FilterSelect
              label="Claim Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusOption)}
              options={[
                { value: "all", label: "All statuses" },
                { value: "reserved", label: "Reserved, not yet settled" },
                { value: "outstanding", label: "Settled, payment outstanding" },
                { value: "paid", label: "Settled and paid" },
              ]}
            />

            <FilterSelect
              label="Primary Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyOption)}
              options={[
                { value: "USD", label: "USD" },
                { value: "GHS", label: "GHS" },
                { value: "GBP", label: "GBP" },
                { value: "EUR", label: "EUR" },
              ]}
            />
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-muted/20 px-6 py-5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Quick Actions
          </div>
          <div className="flex gap-3 flex-col sm:flex-row sm:justify-end">
            <Button
              variant="default"
              size="sm"
              className="h-10 px-4 font-semibold shadow-sm hover:shadow-md transition-shadow"
              onClick={() => {
                console.log("Register New Claim");
              }}
            >
              <span>+</span>
              <span className="ml-1.5">Register Claim</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 font-semibold"
              onClick={() => {
                console.log("Record Payment");
              }}
            >
              <span>+</span>
              <span className="ml-1.5">Record Payment</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
