export type Currency = 'USD' | 'EUR' | 'GBP' | 'GHS'

export interface Claim {
    id: string;
    policy_number: string;
    insured_name: string;
    loss_date: string;
    date_notified: string;
    loss_nature: string;
    currency: Currency;
    estimated_loss_amount: number;
    approved_amount: number | null;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: string;
    claim_id: string;
    payment_date: string;
    payment_currency: Currency;
    payment_amount: number;
    reference_note: string | null;
    amount_in_claim_currency: number;
    created_at: string;
    updated_at: string;
}

export interface Total {
    currency: Currency;
    total_estimated: string;    
    total_outstanding: string;
}

export interface ClaimsQueryResult {
    claim: Claim;
    totals: Total[];
}

export interface ClaimQueryResult {
    claims: Claim[];
    payments: Payment[];
}

export interface ClaimPaymentsQueryResult {
    payments: Payment[];
}