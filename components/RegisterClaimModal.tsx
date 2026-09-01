"use client";

import { useState } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type RegisterClaimForm = {
  insuredName: string;
  lossDate: string;
  dateNotified: string;
  lossNature: string;
  currency: "USD" | "GHS" | "GBP" | "EUR";
  estimatedLossAmount: string;
};

const initialForm: RegisterClaimForm = {
  insuredName: "",
  lossDate: "",
  dateNotified: "",
  lossNature: "",
  currency: "USD",
  estimatedLossAmount: "",
};

interface RegisterClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RegisterClaimModal({
  open,
  onOpenChange,
}: RegisterClaimModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<RegisterClaimForm>(initialForm);

  const createClaim = useMutation({
    mutationFn: async (values: RegisterClaimForm) => {
      const response = await fetch(`${API_URL}/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          insuredName: values.insuredName,
          lossDate: values.lossDate,
          dateNotified: values.dateNotified,
          lossNature: values.lossNature,
          currency: values.currency,
          estimatedLossAmount: Number(values.estimatedLossAmount),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create claim");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.add({
        title: "Claim registered",
        description: "The new claim was added successfully.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      setForm(initialForm);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.add({
        title: "Registration failed",
        description:
          error.message || "Something went wrong while creating the claim.",
        type: "error",
      });
    },
  });

  const updateField = (
    field: keyof RegisterClaimForm,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createClaim.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Register New Claim</DialogTitle>
          <DialogDescription>
            Add a new claim to the register and start tracking it immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Insured Name
              </label>
              <input
                value={form.insuredName}
                onChange={(e) => updateField("insuredName", e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Loss Date
              </label>
              <input
                type="date"
                value={form.lossDate}
                onChange={(e) => updateField("lossDate", e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Date Notified
              </label>
              <input
                type="date"
                value={form.dateNotified}
                onChange={(e) => updateField("dateNotified", e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Loss Nature
              </label>
              <input
                value={form.lossNature}
                onChange={(e) => updateField("lossNature", e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Vehicle accident"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) =>
                  updateField("currency", e.target.value as RegisterClaimForm["currency"])
                }
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="USD">USD</option>
                <option value="GHS">GHS</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Estimated Loss Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.estimatedLossAmount}
                onChange={(e) => updateField("estimatedLossAmount", e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="2500.00"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createClaim.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createClaim.isPending}>
              {createClaim.isPending ? "Saving..." : "Create Claim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
