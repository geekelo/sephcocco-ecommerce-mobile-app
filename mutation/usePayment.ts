// mutation/usePayment.ts
import { iHavePaid, fetchPayments, verifyPayment } from "@/services/payment";
import { useMutation, useQuery } from "@tanstack/react-query";

type PaymentPayload = {
  outlet: string;
  orderIds: string[];
  amount: number;
  paymentMethod: string;
  transactionId: string;
};

type VerifyPaymentPayload = {
  outlet: string;
  reference: string;
};

type FetchPaymentsParams = {
  outlet: string;
  status?: string;
  page?: number;
  perPage?: number;
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

// ✅ Create Payment Mutation
export const usePayment = () => {
  return useMutation({
    mutationFn: ({
      outlet,
      orderIds,
      amount,
      paymentMethod,
      transactionId,
    }: PaymentPayload) =>
      iHavePaid(outlet, orderIds, amount, paymentMethod, transactionId),
  });
};

// ✅ Verify Payment Mutation
export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: ({ outlet, reference }: VerifyPaymentPayload) =>
      verifyPayment(outlet, reference),
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
    queryKey: ["payments", outlet, status, page, perPage],
    queryFn: () => fetchPayments(outlet, { status }, page, perPage),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
