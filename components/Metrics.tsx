import { formatCurrency } from "@/utils/currency";
import React from "react";

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
      ? "text-green-600 dark:text-green-300"
      : metric.tone === "negative"
      ? "text-red-600 dark:text-red-300"
      : "text-foreground";

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{metric.label}</div>
          <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{metric.value}</div>
        </div>
        {metric.sub ? (
          <div className="text-xs text-muted-foreground text-right">{metric.sub}</div>
        ) : null}
      </div>
    </div>
  );
};

export default function Metrics() {
  // Mock data
  const primaryCurrency = "USD";
  const mock = {
    totalClaims: 15,
    totalEstimatedLoss: 125000, // in primaryCurrency - USD
    totalPaid: 42000,
    outstandingBalance: 83000,
  };

  const metrics: Metric[] = [
    {
      id: "claims",
      label: "Total Claims",
      value: `${mock.totalClaims} Registered`,
      sub: "All statuses",
    },
    {
      id: "estimated",
      label: "Total Estimated Loss",
      value: formatCurrency(mock.totalEstimatedLoss, primaryCurrency),
      sub: `Primary: ${primaryCurrency}`,
    },
    {
      id: "paid",
      label: "Total Paid",
      value: formatCurrency(mock.totalPaid, primaryCurrency),
      tone: "positive",
      sub: "Settled claims",
    },
    {
      id: "outstanding",
      label: "Outstanding Balance",
      value: formatCurrency(mock.outstandingBalance, primaryCurrency),
      tone: "negative",
      sub: "Unsettled claims",
    },
  ];

  return (
    <section aria-labelledby="top-metrics" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 id="top-metrics" className="text-lg font-semibold">
          Top metrics
        </h2>
        <div className="text-sm text-muted-foreground">Updated just now</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>
    </section>
  );
}
