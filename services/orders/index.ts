import { apiClient } from "../api.service";


export const createOrder = async ({
  user_id,
  product_id,
  quantity,
  outlet,
}: {
  user_id: string;
  product_id: string;
  quantity: number;
  outlet: string;
}) => {
  const orderKey = `sephcocco_${outlet}order`;

  const payload = {
    [orderKey]: {
      sephcocco_user_id: user_id,
      [`sephcocco${outlet}_product_id`]: product_id,
      quantity,
    },
  };

  const { data } = await apiClient().post(
    `/api/v1/${outlet}/sephcocco_${outlet}_orders`,
    payload
  );

  return data;
};

export const getAllOrders = async (outlet: string, userId: string | null) => {
  const { data } = await apiClient().get(
    `/api/v1/${outlet}/sephcocco_${outlet}_orders`,
    {
      params: {
        user_id: userId ?? undefined,
      },
    }
  );
  return data.orders ?? data;
};

export const getOrderById = async (
  outlet: string,
  id: string,
  userId: string | null
) => {
  const { data } = await apiClient().get(
    `/api/v1/${outlet}/sephcocco_${outlet}_orders/${id}`,
    {
      params: {
        user_id: userId ?? undefined,
      },
    }
  );
  return data.order ?? data;
};

export const updateOrder = async ({
  id,
  user_id,
  outlet,
  product_id,
  quantity,
}: {
  id: string;
  user_id: string;
  outlet: string;
  product_id?: string;
  quantity?: number;
}) => {
  const orderKey = `sephcocco_${outlet}order`;

  const payload = {
    [orderKey]: {
      sephcocco_user_id: user_id,
      ...(product_id && { [`sephcocco${outlet}_product_id`]: product_id }),
      ...(quantity && { quantity }),
    },
  };

  const { data } = await apiClient().patch(
    `/api/v1/${outlet}/sephcocco_${outlet}_orders/${id}`,
    payload
  );
  return data;
};

export const deleteOrder = async (outlet: string, id: string) => {
  const { data } = await apiClient().delete(
    `/api/v1/${outlet}/sephcocco_${outlet}_orders/${id}`
  );
  return data;
};
