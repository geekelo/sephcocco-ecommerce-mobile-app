// mutation/usePayment.ts
import { iHavePaid, fetchPayments } from "@/services/payment";
import { useMutation, useQuery } from "@tanstack/react-query";

type PaymentPayload = {
  outlet: string;
  orderIds: string[];
  amount: number;
  paymentMethod: string;
  transactionId: string;
};

type FetchPaymentsParams = {
  outlet: string;
  status?: string;
  page?: number;
  perPage?: number;
};

type Payment = {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string;
  created_at: string;
};

type PaymentsResponse = {
  data: Payment[];
  total: number;
  page: number;
  per_page: number;
};

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
