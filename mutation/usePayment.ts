// hooks/payments/usePayment.ts
import { iHavePaid } from "@/services/payment";
import { useMutation } from "@tanstack/react-query";

type PaymentPayload = {
  outlet: string;
  orderIds: string[];
  amount: number;
  paymentMethod: string;
  transactionId: string;
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
