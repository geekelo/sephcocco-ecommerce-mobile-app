// mutation/usePayment.ts
import { iHavePaid, fetchPayments, verifyPayment } from "@/services/payment";
import { useMutation, useQuery } from "@tanstack/react-query";

type PaymentPayload = {
  outlet: string;
  orderIds: string[];
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status?: string;       // 👈 added
  reference?: string;    // 👈 optional for Paystack
};

type VerifyPaymentPayload = {
  outlet: string;
  reference: string;
  isReactNative?: boolean; // 👈 allow RN toggle
};

type FetchPaymentsParams = {
  outlet: string;
  status?: string;
  page?: number;
  perPage?: number;
  isReactNative?: boolean; // 👈 allow RN toggle
};

export type Payment = {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string;
  created_at: string;
};

export type PaymentsResponse = {
  payments: Payment[];
  total: number;
  page: number;
  per_page: number;
};

// ✅ Create Payment (Web)
export const usePayment = () => {
  return useMutation({
    mutationFn: ({
      outlet,
      orderIds,
      amount,
      paymentMethod,
      transactionId,
      status = "pending",
  
    }: PaymentPayload) =>
      iHavePaid(
        outlet,
        orderIds,
        amount,
        paymentMethod,
        transactionId,
        false, // 👈 web
        status,
    
      ),
  });
};

// ✅ Create Payment (React Native / Paystack)
export const usePaystackPayment = () => {
  return useMutation({
    mutationFn: ({
      outlet,
      orderIds,
      amount,
      paymentMethod,
      transactionId,
      status = "pending",
    }: PaymentPayload) =>
      iHavePaid(outlet, orderIds, amount, paymentMethod, transactionId, true, status),
  });
};


// ✅ Verify Payment Mutation
export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: ({ outlet, reference,}: VerifyPaymentPayload) =>
      verifyPayment(outlet, reference, ),
  });
};

// ✅ Fetch Payments Query
export const useFetchPayments = ({
  outlet,
  status,
  page = 1,
  perPage = 10,
  
}: FetchPaymentsParams) => {
  return useQuery<PaymentsResponse, Error>({
    queryKey: ["payments", outlet, status, page, perPage, ],
    queryFn: () => fetchPayments(outlet, { status }, page, perPage, ),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
