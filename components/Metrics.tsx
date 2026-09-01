import { ClaimsQueryResult } from "@/types";
import { formatCurrency, DEFAULT_RATES } from "@/utils/currency";
import React, { useMemo } from "react";

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

export default function Metrics({ claimsData }: { claimsData: ClaimsQueryResult | undefined }) {
    const data = useMemo(() => {
        let total_estimated_loss = 0;
        let total_paid = 0;
        let outstanding_balance = 0

        for (const total of claimsData?.totals || []) {
            if (total.currency === "USD") {
                total_estimated_loss += parseFloat(total.total_estimated);
                total_paid += parseFloat(total.total_paid);
                outstanding_balance += parseFloat(total.total_outstanding);
            } else {
                // Convert to USD using the DEFAULT_RATES
                total_estimated_loss += parseFloat(total.total_estimated) * (DEFAULT_RATES[total.currency]?.USD || 1);
                total_paid += parseFloat(total.total_paid) * (DEFAULT_RATES[total.currency]?.USD || 1);
                outstanding_balance += parseFloat(total.total_outstanding) * (DEFAULT_RATES[total.currency]?.USD || 1);
            }
        }

        return {
            total_estimated_loss,
            total_paid,
            outstanding_balance,
        }
    }, [claimsData?.totals])

  const primaryCurrency = "USD";

  const metrics: Metric[] = [
    {
      id: "claims",
      label: "Total Claims",
      value: `${claimsData?.claims.length || 0} Registered`,
      sub: "All statuses",
    },
    {
      id: "estimated",
      label: "Total Estimated Loss",
      value: formatCurrency(data.total_estimated_loss, primaryCurrency),
      sub: `Primary: ${primaryCurrency}`,
    },
    {
      id: "paid",
      label: "Total Paid",
      value: formatCurrency(data.total_paid, primaryCurrency),
      tone: "positive",
      sub: "Settled claims",
    },
    {
      id: "outstanding",
      label: "Outstanding Balance",
      value: formatCurrency(data.outstanding_balance, primaryCurrency),
      tone: "negative",
      sub: "Unsettled claims",
    },
  ];

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
