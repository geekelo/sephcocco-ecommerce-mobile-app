// src/services/products.service.ts

import { apiClient } from "../api.service";

// ✅ Get all products (with optional user_id)
export const getAllProducts = async (outlet: string, userId: string | null) => {
  const productPath = `sephcocco_${outlet}_products`;
  const url = `/${outlet}/${productPath}`;

  const client = await apiClient();
console.log(client)
  const response = await client.get(url, {
    params: {
      user_id: userId ?? undefined,
    },
  });
console.log(response)
  return response.data.products ?? response.data;
};

// ✅ Get single product by ID
export const getProductById = async (outlet: string, id: string) => {
  const productPath = `sephcocco_${outlet}_products`;
  const url = `/${outlet}/${productPath}/${id}`;

  const client = await apiClient();

  const response = await client.get(url);

  return response.data.product ?? response.data;
};
