import { ClaimsQueryResult } from "@/types";
import { formatCurrency, DEFAULT_RATES } from "@/utils/currency";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";


type Metric = {
    id: string;
    label: string;
    value: string;
    sub?: string;
    tone?: "default" | "positive" | "negative";
};


const MetricCard: React.FC<{ metric: Metric }> = ({ metric }) => {
    const toneClass =
        metric.tone === "positive"
            ? "text-green-600 dark:text-green-400"
            : metric.tone === "negative"
                ? "text-red-600 dark:text-red-400"
                : "text-foreground";

    return (
        <div className="bg-card text-card-foreground rounded-xl border border-border p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col">
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    {metric.label}
                </div>
                <div className={`text-2xl sm:text-3xl font-bold mb-2 ${toneClass}`}>
                    {metric.value}
                </div>
                {metric.sub ? (
                    <div className="text-xs text-muted-foreground">{metric.sub}</div>
                ) : null}
            </div>
        </div>
    );
};

export default function Metrics() {
    const { data: metrics = [] } = useQuery<Metric[]>({
        queryKey: ["metrics"],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/claims/metrics`);
            if (!response.ok) {
                throw new Error("Failed to fetch claims");
            }
            return response.json();
        },

    })


    return (
        <section aria-labelledby="top-metrics" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 id="top-metrics" className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-0">
                    Key Metrics
                </h2>
                <div className="text-xs sm:text-sm text-muted-foreground">Updated just now</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {metrics.map((m) => (
                    <MetricCard key={m.id} metric={m} />
                ))}
            </div>
        </section>
    );
}
