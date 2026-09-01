"use client"

import FilterBar from "@/components/FilterBar";
import Metrics from "@/components/Metrics";
import { ClaimsQueryResult } from "@/types";
import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const {data: claimsData} = useQuery<ClaimsQueryResult>({
    queryKey: ["claims"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/claims`);
      if (!response.ok) {
        throw new Error("Failed to fetch claims");
      }
      return response.json();
    },
    
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Claims Dashboard</h1>
          <p className="text-muted-foreground">Manage and track all insurance claims</p>
        </div>
        
        <div className="space-y-6">
          <Metrics claimsData={claimsData} />
          <FilterBar />
        </div>
      </div>
    </div>
  );
}
