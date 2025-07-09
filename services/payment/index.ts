import { apiClient } from "../api.service";

export const iHavePaid = async (
  outlet: string,
  orderIds: string[],
  amount: number,
  paymentMethod: string,
  transactionId: string
) => {
  const paymentPath = `sephcocco_${outlet}_payments`;
  const url = `/api/v1/restaurant/${paymentPath}`;

  const client = await apiClient();

  const payload = {
    sephcocco_restaurant_payment: {
      order_ids: orderIds,
      amount,
      payment_method: paymentMethod,
      transaction_id: transactionId,
    },
  };

  const response = await client.post(url, payload);

  return response.data;
};
