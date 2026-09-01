"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Claim } from "@/types";
import { format } from "date-fns";

interface ClaimsTableProps {
  claims: Claim[];
  selectedRows: Set<string>;
  onSelectedRowsChange: (rows: Set<string>) => void;
}

type StatusBadgeType = "reserved" | "outstanding" | "paid";

const getStatusBadge = (claim: Claim): StatusBadgeType => {
  if (!claim.approved_amount) {
    return "reserved";
  }
  const balance =
    (Number(claim.approved_amount) - Number(claim.total_paid)) || 0;
  if (balance > 0) {
    return "outstanding";
  }
  return "paid";
};

const statusBadgeStyles = {
  reserved: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
  outstanding:
    "bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-100",
  paid: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100",
};

const statusBadgeLabels = {
  reserved: "Reserved, not yet settled",
  outstanding: "Settled, payment outstanding",
  paid: "Settled and paid",
};

const formatCurrency = (amount: number | string | null | undefined, currency: string) => {
  if (!amount && amount !== 0) return "—";
  const num = Number(amount);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(num);
};

// Calculate totals by currency
const calculateTotalsByCurrency = (claims: Claim[]) => {
  const totals: Record<
    string,
    {
      estimated: number;
      approved: number;
      paid: number;
      outstanding: number;
    }
  > = {};

  claims.forEach((claim) => {
    const currency = claim.currency || "USD";
    if (!totals[currency]) {
      totals[currency] = {
        estimated: 0,
        approved: 0,
        paid: 0,
        outstanding: 0,
      };
    }

    totals[currency].estimated += Number(claim.estimated_loss_amount) || 0;
    totals[currency].approved += Number(claim.approved_amount) || 0;
    totals[currency].paid += Number(claim.total_paid) || 0;
    totals[currency].outstanding +=
      (Number(claim.approved_amount) - Number(claim.total_paid)) || 0;
  });

  return totals;
};

export default function ClaimsTable({
  claims,
  selectedRows,
  onSelectedRowsChange,
}: ClaimsTableProps) {
  const totals = useMemo(() => calculateTotalsByCurrency(claims), [claims]);
  const currencyList = Object.keys(totals).sort();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedRowsChange(new Set(claims.map((claim) => claim.id)));
    } else {
      onSelectedRowsChange(new Set());
    }
  };

  const handleSelectRow = (claimId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(claimId);
    } else {
      newSelected.delete(claimId);
    }
    onSelectedRowsChange(newSelected);
  };

  return (
    <div className="w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    claims.length > 0 && selectedRows.size === claims.length
                  }
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    handleSelectAll(checked === true)
                  }
                />
              </TableHead>
              <TableHead className="min-w-32">Policy Number</TableHead>
              <TableHead className="min-w-40">Insured Name</TableHead>
              <TableHead className="min-w-36">Date Notified</TableHead>
              <TableHead className="min-w-32">Loss Nature</TableHead>
              <TableHead className="w-20">Currency</TableHead>
              <TableHead className="text-right min-w-32">Estimated</TableHead>
              <TableHead className="text-right min-w-32">Approved</TableHead>
              <TableHead className="text-right min-w-32">Total Paid</TableHead>
              <TableHead className="text-right min-w-32">Balance</TableHead>
              <TableHead className="min-w-40">Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  <p className="text-muted-foreground">No claims found</p>
                </TableCell>
              </TableRow>
            ) : (
              claims.map((claim) => {
                const statusType = getStatusBadge(claim);
                const balance =
                  (Number(claim.approved_amount) - Number(claim.total_paid)) || 0;
                return (
                  <TableRow key={claim.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(claim.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(claim.id, checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {claim.policy_number}
                    </TableCell>
                    <TableCell>{claim.insured_name}</TableCell>
                    <TableCell>
                      {format(new Date(claim.date_notified), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{claim.loss_nature}</TableCell>
                    <TableCell className="font-semibold">
                      {claim.currency}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(claim.estimated_loss_amount, claim.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {claim.approved_amount
                        ? formatCurrency(claim.approved_amount, claim.currency)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(claim.total_paid, claim.currency)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(balance, claim.currency)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          statusBadgeStyles[statusType]
                        }`}
                      >
                        {statusBadgeLabels[statusType]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => console.log("View details:", claim.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Currency Totals Footer */}
      {claims.length > 0 && (
        <div className="border-t border-border bg-muted/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th colSpan={6} className="text-left px-6 py-3 font-semibold">
                    Totals by Currency
                  </th>
                </tr>
              </thead>
              <tbody>
                {currencyList.map((currency) => (
                  <tr key={currency} className="border-b border-border/50 hover:bg-muted/30">
                    <td colSpan={2} className="px-6 py-3 font-semibold">
                      {currency}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="text-xs text-muted-foreground">Estimated</div>
                      <div className="font-medium">
                        {formatCurrency(totals[currency].estimated, currency)}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="text-xs text-muted-foreground">Approved</div>
                      <div className="font-medium">
                        {formatCurrency(totals[currency].approved, currency)}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="text-xs text-muted-foreground">Total Paid</div>
                      <div className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(totals[currency].paid, currency)}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="text-xs text-muted-foreground">Outstanding</div>
                      <div className="font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(totals[currency].outstanding, currency)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}