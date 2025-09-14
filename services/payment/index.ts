import { apiClient } from "../api.service";
export const iHavePaid = async (
  outlet: string,
  orderIds: string[],
  amount: number,
  paymentMethod: string,
  transactionId: string,
  isReactNative = false,     
  status: string = "pending"
) => {
  const paymentPath = `sephcocco_${outlet}_payments`;
  let url = `/${outlet}/${paymentPath}`; 

  if (isReactNative) {
    url += "?react_native=true";
  }

  const client = await apiClient();

  const payload = {
     
      orders_ids: orderIds,
      amount,
      payment_method: paymentMethod,
      transaction_id: transactionId,
      status,
  
  };

  console.log("Payment payload:", payload);
  console.log("POST URL:", url);

  const response = await client.post(url, payload);

  console.log("Payment response:", response.data);

  return response.data;
};


export const fetchPayments = async (
  outlet: string,
  filters: { status?: string } = {},
  page = 1,
  perPage = 10,
  isReactNative = false // 👈 added flag
) => {
  const paymentPath = `sephcocco_${outlet}_payments`;
  let url = `/${outlet}/${paymentPath}`;

  if (isReactNative) {
    url += "?react-native=true";
  }

  const client = await apiClient();

  const params = {
    ...filters,
    page,
    per_page: perPage,
  };

  console.log(url);
  const response = await client.get(url, { params });
  console.log(response);

  return response.data;
};

export const verifyPayment = async (
  outlet: string,
  reference: string,
) => {
  let url = `/${outlet}/sephcocco_${outlet}_payments/verify`;


  const client = await apiClient();
  const payload = { reference };

  const response = await client.post(url, payload);

  console.log("verify response", response);

  return response.data;
};
