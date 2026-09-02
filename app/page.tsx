"use client";

import FilterBar from "@/components/FilterBar";
import Metrics from "@/components/Metrics";
import ClaimsTable from "@/components/ClaimsTable";
import RegisterClaimModal from "@/components/RegisterClaimModal";
import { ClaimsQueryResult, ClaimStatus } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import RecordPaymentModal from "@/components/RecordPaymentModal";

type CurrencyOption = "USD" | "GHS" | "GBP" | "EUR" | "all";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<ClaimStatus | "all">("all");
  const [currency, setCurrency] = useState<CurrencyOption>("all");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", format(startDate, "yyyy-MM-dd"));
    if (endDate) params.append("endDate", format(endDate, "yyyy-MM-dd"));
    if (status !== "all") params.append("status", status);
    if (currency !== "all") params.append("currency", currency);
    return params.toString();
  }, [startDate, endDate, status, currency]);

  const { data: claimsData } = useQuery<ClaimsQueryResult>({
    queryKey: ["claims", startDate, endDate, status, currency],
    queryFn: async () => {  
      const url = queryParams ? `${API_URL}/claims?${queryParams}` : `${API_URL}/claims`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch claims");
      }
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Claims Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and track all insurance claims
          </p>
        </div>

        <div className="space-y-6">
          <Metrics />

          <FilterBar
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            status={status}
            onStatusChange={setStatus}
            currency={currency}
            onCurrencyChange={setCurrency}
            onRegisterClaimClick={() => setIsRegisterModalOpen(true)}
            onRecordPaymentClick={() => setIsPaymentModalOpen(true)}
          />

          <RegisterClaimModal
            open={isRegisterModalOpen}
            onOpenChange={setIsRegisterModalOpen}
          />

          <RecordPaymentModal
            open={isPaymentModalOpen}
            onOpenChange={setIsPaymentModalOpen}
            claims={claimsData?.claims || []}
          />

          <ClaimsTable
            claims={claimsData?.claims || []}
            totals={claimsData?.totals || []}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
          />
        </div>
      </div>
    </div>
  );
}
