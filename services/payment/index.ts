import { apiClient } from "../api.service";

// ✅ Submit Payment
export const iHavePaid = async (
  outlet: string,
  orderIds: string[],
  amount: number,
  paymentMethod: string,
  transactionId: string
) => {
  const paymentKey = `sephcocco_${outlet}_payment`;
  const url = `/${outlet}/sephcocco_${outlet}_payments`;

  const client = await apiClient();

  const payload = {
    [paymentKey]: {
      orders_ids: orderIds,
      amount,
      payment_method: paymentMethod,
      transaction_id: transactionId,
    },
  };
console.log('payload',payload)
  const response = await client.post(url, payload);
  console.log(url)
  console.log(response, 'paymentres')
  return response.data;
};


export const fetchPayments = async (
  outlet: string,
  filters: { status?: string } = {},
  page = 1,
  perPage = 10
) => {
  const paymentPath = `sephcocco_${outlet}_payments`;
  const url = `/${outlet}/${paymentPath}`;

  const client = await apiClient();

  const params = {
    ...filters,
    page,
    per_page: perPage,
  };
console.log(url)
  const response = await client.get(url, { params });
console.log(response)
  return response.data;
};
