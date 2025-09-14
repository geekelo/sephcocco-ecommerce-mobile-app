import { apiClient } from "../api.service";
import { create_order } from "../../types/order";

// ✅ Create Order
export const createOrder = async ({
  product_id,
  quantity,
  outlet,
  address,
  phone_number,
  additional_notes,
}: {
  product_id: string;
  quantity: number;
  outlet: string;
  address: string;
  phone_number: string;
  additional_notes?: string;
}) => {
  const orderKey = `sephcocco_${outlet}_order`;
  const productKey = `sephcocco_${outlet}_product_id`;

  const payload = {
    [orderKey]: {
      [productKey]: product_id,
      quantity,
      address,
      phone_number,
      additional_notes,
    },
  };

  const url = `/${outlet}/sephcocco_${outlet}_orders`;
  const client = await apiClient();
console.log(client)
  console.log("🟢 [CREATE] URL:", url);
  console.log("🟡 [CREATE] Payload:", JSON.stringify(payload, null, 2));
  console.log("🧾 [CREATE] Headers:", client.defaults.headers);

  try {
    const { data } = await client.post(url, payload);
    console.log(url)
    console.log("✅ [CREATE] Response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ [CREATE] Error:", error?.response?.data || error.message);
    throw error;
  }
};

// ✅ Get All Orders
export const getAllOrders = async (outlet: string, userId: string | null) => {
  const url = `/${outlet}/sephcocco_${outlet}_orders`;
  const client = await apiClient();

  console.log("🟢 [GET ALL] URL:", url);
  console.log("🧾 [GET ALL] Params:", userId ? { user_id: userId } : {});

  try {
    const { data } = await client.get(url, {
      params: userId ? { user_id: userId } : {},
    });
    console.log("✅ [GET ALL] Response:", data);
    return data.orders ?? data;
  } catch (error: any) {
    console.error("❌ [GET ALL] Error:", error?.response?.data || error.message);
    throw error;
  }
};
// ✅ Get All pending Orders
export const getAllPendingOrders = async (outlet: string, userId: string | null) => {
  const url = `/${outlet}/sephcocco_${outlet}_orders/pending`;
  const client = await apiClient();

  try {
    const { data } = await client.get(url, {
      params: userId ? { user_id: userId } : {},
    });
    console.log("✅ [GET pending] Response:", data);
    return data.orders ?? data;
  } catch (error: any) {
    console.error("❌ [GET pending] Error:", error?.response?.data || error.message);
    throw error;
  }
};


// ✅ Get All completed Orders
export const getAllCompletedOrders = async (outlet: string, userId: string | null) => {
  const url = `/${outlet}/sephcocco_${outlet}_orders/completed`;
  const client = await apiClient();

  try {
    const { data } = await client.get(url, {
      params: userId ? { user_id: userId } : {},
    });
    console.log("✅ [GET completed] Response:", data);
    return data.orders ?? data;
  } catch (error: any) {
    console.error("❌ [GET completed] Error:", error?.response?.data || error.message);
    throw error;
  }
};


export const getAllDeliveringOrders = async (outlet: string, userId: string | null) => {
  const url = `/${outlet}/sephcocco_${outlet}_orders/delivering`;
  const client = await apiClient();

  try {
    const { data } = await client.get(url, {
      params: userId ? { user_id: userId } : {},
    });
    console.log("✅ [GET delivered] Response:", data);
    return data.orders ?? data;
  } catch (error: any) {
    console.error("❌ [GET delievred] Error:", error?.response?.data || error.message);
    throw error;
  }
};


// ✅ Get All paid Orders
export const getAllPaidOrders = async (outlet: string, userId: string | null) => {
  const url = `/${outlet}/sephcocco_${outlet}_orders/paid`;
  const client = await apiClient();

  try {
    const { data } = await client.get(url, {
      params: userId ? { user_id: userId } : {},
    });
    console.log("✅ [GET paid] Response:", data);
    return data.orders ?? data;
  } catch (error: any) {
    console.error("❌ [GET paid] Error:", error?.response?.data || error.message);
    throw error;
  }
};

// ✅ Get Order by ID
export const getOrderById = async (
  outlet: string,
  id: string,
  userId: string | null
) => {
  const url = `/${outlet}/sephcocco_${outlet}_orders/${id}`;
  const client = await apiClient();

  console.log("🟢 [GET ONE] URL:", url);
  console.log("🧾 [GET ONE] Params:", userId ? { user_id: userId } : {});

  try {
    const { data } = await client.get(url, {
      params: userId ? { user_id: userId } : {},
    });
    console.log("✅ [GET ONE] Response:", data);
    return data.order ?? data;
  } catch (error: any) {
    console.error("❌ [GET ONE] Error:", error?.response?.data || error.message);
    throw error;
  }
};

// ✅ Update Order
export const updateOrder = async ({
  id,
  user_id,
  outlet,
  product_id,
  quantity,
}: {
  id: string | number;
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

  const url = `/${outlet}/sephcocco_${outlet}_orders/${id}`;
  const client = await apiClient();

  console.log("🟢 [UPDATE] URL:", url);
  console.log("🟡 [UPDATE] Payload:", JSON.stringify(payload, null, 2));

  try {
    const { data } = await client.patch(url, payload);
    console.log("✅ [UPDATE] Response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ [UPDATE] Error:", error?.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete Order
export const deleteOrder = async (outlet: string, id: string) => {
  const url = `/${outlet}/sephcocco_${outlet}_orders/${id}`;
  const client = await apiClient();

  console.log("🟢 [DELETE] URL:", url);

  try {
    const { data } = await client.delete(url);
    console.log("✅ [DELETE] Response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ [DELETE] Error:", error?.response?.data || error.message);
    throw error;
  }
};
