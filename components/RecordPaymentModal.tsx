"use client";

import { useMemo, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Claim, Currency } from "@/types";
import { DEFAULT_RATES } from '@/utils/currency';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface RecordPaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    claims: Claim[];
}

export default function RecordPaymentModal({
    open,
    onOpenChange,
    claims,
}: RecordPaymentModalProps) {
    const queryClient = useQueryClient();

    const [claimId, setClaimId] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [currency, setCurrency] = useState<Currency>("USD");
    const [exchangeRate, setExchangeRate] = useState<number>(1);

    // Derive the currently selected claim
    const selectedClaim = useMemo(
        () => claims.find((claim) => claim.id === claimId) || claims[0] || null,
        [claims, claimId],
    );

    // Initialize form state when modal opens or claims load
    useEffect(() => {
        if (selectedClaim && !claimId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClaimId(selectedClaim.id);
            setCurrency(selectedClaim.currency as Currency);
        }
    }, [selectedClaim, claimId]);

    // Is payment currency different from claim base currency?
    const isCrossCurrency = useMemo(() => {
        if (!selectedClaim) return false;
        return currency !== selectedClaim.currency;
    }, [currency, selectedClaim]);

    // Update claim selection & auto-adjust currency/rates
    const handleClaimChange = (newClaimId: string) => {
        setClaimId(newClaimId);
        const targetClaim = claims.find((c) => c.id === newClaimId);
        if (targetClaim) {
            setCurrency(targetClaim.currency as Currency);
            setExchangeRate(1);
        }
    };

    // Update payment currency & pre-fill exchange rate (Payment Currency -> Claim Currency)
    const handleCurrencyChange = (newCurrency: Currency) => {
        setCurrency(newCurrency);
        if (selectedClaim && newCurrency !== selectedClaim.currency) {
            // DEFAULT_RATES[PaymentCurrency][ClaimCurrency]
            const rate = DEFAULT_RATES[newCurrency]?.[selectedClaim.currency as Currency] ?? 1;
            setExchangeRate(rate);
        } else {
            setExchangeRate(1);
        }
    };

    // Clear, formatted financial helper text
    const helperText = useMemo(() => {
        if (!selectedClaim || !amount || Number(amount) <= 0) return "";

        const numericAmount = Number(amount);

        if (!isCrossCurrency) {
            return `Payment of ${numericAmount.toFixed(2)} ${currency} applied directly to claim balance.`;
        }

        const rate = Number(exchangeRate || 0);
        const converted = numericAmount * rate;

        return `Converting ${numericAmount.toFixed(2)} ${currency} @ ${rate} ${selectedClaim.currency}/${currency} ➔ ${converted.toFixed(2)} ${selectedClaim.currency} deducted from claim balance.`;
    }, [amount, exchangeRate, isCrossCurrency, selectedClaim, currency]);

    const recordPayment = useMutation({
        mutationFn: async (values: {
            claimId: string;
            amount: string;
            currency: Currency;
            exchangeRate: number;
        }) => {
            // if claim has not being approved, do not record payment
            const approvedAmount = claims?.find((claim) => claim.id === values.claimId)?.approved_amount;
            if (approvedAmount === null || approvedAmount === undefined) {
                throw new Error("Cannot record payment for a claim that has not been approved.");
            }

            const response = await fetch(`${API_URL}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    claimId: values.claimId,
                    amount: Number(values.amount),
                    currency: values.currency,
                    exchangeRate: Number(values.exchangeRate),
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to record payment");
            }

            return response.json();
        },
        onSuccess: () => {
            toast.add({
                title: "Payment recorded",
                description: "The payment was recorded successfully.",
                type: "success",
            });
            queryClient.invalidateQueries({ queryKey: ["claims"] });
            setAmount("");
            onOpenChange(false);
        },
        onError: (error: Error) => {
            toast.add({
                title: "Payment failed",
                description: error.message || "Something went wrong.",
                type: "error",
            });
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!claimId || !amount || Number(amount) <= 0) return;

        recordPayment.mutate({
            claimId,
            amount,
            currency,
            exchangeRate: isCrossCurrency ? exchangeRate : 1,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Add a payment against an existing claim.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                            Claim
                        </label>
                        <select
                            value={claimId}
                            onChange={(e) => handleClaimChange(e.target.value)}
                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            {claims.map((claim) => (
                                <option key={claim.id} value={claim.id}>
                                    {claim.policy_number} - {claim.insured_name} ({claim.currency})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                                Payment Amount
                            </label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                placeholder="15000"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                                Payment Currency
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="USD">USD</option>
                                <option value="GHS">GHS</option>
                                <option value="GBP">GBP</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>

                    {/* Editable Exchange Rate input when currencies differ */}
                    {isCrossCurrency && (
                        <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50/50 p-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-amber-900">
                                    Exchange Rate (1 {currency} = ? {selectedClaim?.currency})
                                </label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    min="0.000001"
                                    value={exchangeRate}
                                    // onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                                    className="h-8 w-32 rounded border border-amber-300 bg-white px-2 text-right font-mono text-sm outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Real-time financial output preview */}
                    {helperText && (
                        <div className="rounded-md bg-muted p-2.5 font-mono text-xs text-muted-foreground">
                            {helperText}
                        </div>
                    )}

                    {recordPayment.isError && (
                        <div className="text-xs text-red-600">
                            {recordPayment.error instanceof Error
                                ? recordPayment.error.message
                                : "An error occurred while recording the payment."}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={recordPayment.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={recordPayment.isPending}>
                            {recordPayment.isPending ? "Recording..." : "Record Payment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}