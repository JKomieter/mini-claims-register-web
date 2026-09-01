"use client"

import Metrics from "@/components/Metrics";
import { ClaimsQueryResult } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const queryClient = useQueryClient();

  const {data: claims, status: claimsStatus} = useQuery<ClaimsQueryResult>({
    queryKey: ["claims"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/claims`);
      if (!response.ok) {
        throw new Error("Failed to fetch claims");
      }
      return response.json();
    }
  })

  return (
    <div className="dark:bg-black p-20">
      <Metrics />
    </div>
  );
}
