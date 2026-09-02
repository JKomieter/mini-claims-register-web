/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { Payment } from "@/types";
import { ClaimQueryResult } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ViewEditClaimModalProps {
    claimId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ViewEditClaimModal({
    claimId,
    open,
    onOpenChange,
}: ViewEditClaimModalProps) {
    const queryClient = useQueryClient();

    const [insuredName, setInsuredName] = useState("");
    const [lossNature, setLossNature] = useState("");
    const [approvedAmount, setApprovedAmount] = useState("");

    const { data } = useQuery<ClaimQueryResult | null>({
        queryKey: ["claim", claimId],
        queryFn: async () => {
            if (!claimId) return null;
            const response = await fetch(`${API_URL}/claims/${claimId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch claim details");
            }
            return response.json();
        },
        enabled: !!claimId,
    });

    // Sync state when selected claim changes
    useEffect(() => {
        if (data && data.claim) {
            const claim = data.claim;
            setInsuredName(claim.insured_name || "");
            setLossNature(claim.loss_nature || "");
            setApprovedAmount(
                claim.approved_amount !== null ? String(claim.approved_amount) : ""
            );
        }
    }, [data]);

    const updateClaim = useMutation({
        mutationFn: async () => {
            if (!data || !data.claim) return;

            const parsedApproved =
                approvedAmount.trim() !== "" ? Number(approvedAmount) : null;

            const response = await fetch(`${API_URL}/claims/${data.claim.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    insuredName,
                    lossNature,
                    approvedAmount: parsedApproved,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update claim");
            }

            return response.json();
        },
        onSuccess: () => {
            toast.add({
                title: "Claim updated",
                description: "Claim details saved successfully.",
                type: "success",
            });
            queryClient.invalidateQueries({ queryKey: ["claims"] });
            onOpenChange(false);
        },
        onError: (error: Error) => {
            toast.add({
                title: "Update failed",
                description: error.message || "Failed to update claim.",
                type: "error",
            });
        },
    });

    if (!data || !data.claim) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateClaim.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-6">
                        <div>
                            <DialogTitle className="text-xl font-bold font-mono">
                                {data.claim.policy_number}
                            </DialogTitle>
                            <DialogDescription>
                                View claim financial summary, payment log, or update settlement amount.
                            </DialogDescription>
                        </div>
                        <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${data.claim.claim_status === "Settled and paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : data.claim.claim_status === "Settled, payment outstanding"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                        >
                            {data.claim.claim_status}
                        </span>
                    </div>
                </DialogHeader>

                {/* Financial Summary Strip */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 bg-muted/50 p-3 rounded-lg text-xs">
                    <div>
                        <span className="text-muted-foreground block">Estimated Loss</span>
                        <span className="font-semibold font-mono text-sm">
                            {Number(data.claim.estimated_loss_amount).toFixed(2)} {data.claim.currency}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block">Approved Amount</span>
                        <span className="font-semibold font-mono text-sm">
                            {data.claim.approved_amount !== null
                                ? `${Number(data.claim.approved_amount).toFixed(2)} ${data.claim.currency}`
                                : "Not Approved"}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block">Total Paid</span>
                        <span className="font-semibold font-mono text-sm text-emerald-600">
                            {Number(data.claim.total_paid || 0).toFixed(2)} {data.claim.currency}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block">Outstanding</span>
                        <span className="font-semibold font-mono text-sm text-amber-600">
                            {Number(data.claim.outstanding_balance || 0).toFixed(2)} {data.claim.currency}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    {/* Editable Metadata Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Insured Name
                            </label>
                            <input
                                value={insuredName}
                                onChange={(e) => setInsuredName(e.target.value)}
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Loss Nature
                            </label>
                            <input
                                value={lossNature}
                                onChange={(e) => setLossNature(e.target.value)}
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Loss Date (Read-only)
                            </label>
                            <input
                                value={data.claim.loss_date}
                                disabled
                                className="h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Date Notified (Read-only)
                            </label>
                            <input
                                value={data.claim.date_notified}
                                disabled
                                className="h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">
                                Approved Settlement Amount ({data.claim.currency})
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={approvedAmount}
                                onChange={(e) => setApprovedAmount(e.target.value)}
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Leave blank to keep as Reserved"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Updating this figure calculates the outstanding balance automatically.
                            </p>
                        </div>
                    </div>

                    {/* Payment History Section */}
                    <div className="space-y-2 border-t pt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Payment History ({data.payments.length})
                        </h4>
                        {data.payments.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-2 italic">
                                No payments recorded against this claim yet.
                            </p>
                        ) : (
                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead className="bg-muted/60 border-b text-muted-foreground font-sans">
                                        <tr>
                                            <th className="p-2">Date</th>
                                            <th className="p-2">Payment Amount</th>
                                            <th className="p-2">Exchange Rate</th>
                                            <th className="p-2">Applied ({data.claim.currency})</th>
                                            <th className="p-2">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {data.payments.map((payment: Payment) => (
                                            <tr key={payment.id} className="hover:bg-muted/20">
                                                <td className="p-2">{payment.payment_date}</td>
                                                <td className="p-2 font-medium">
                                                    {Number(payment.payment_amount).toFixed(2)} {payment.payment_currency}
                                                </td>
                                                <td className="p-2 text-muted-foreground">
                                                    1 {payment.payment_currency} = {Number(payment.exchange_rate).toFixed(4)} {data.claim.currency}
                                                </td>
                                                <td className="p-2 font-semibold text-emerald-600">
                                                    {Number(payment.amount_in_claim_currency).toFixed(2)} {data.claim.currency}
                                                </td>
                                                <td className="p-2 text-muted-foreground font-sans truncate max-w-[150px]">
                                                    {payment.reference_note || "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={updateClaim.isPending}
                        >
                            Close
                        </Button>
                        <Button type="submit" disabled={updateClaim.isPending}>
                            {updateClaim.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}