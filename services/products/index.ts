// src/services/products.service.ts

import { apiClient } from "../api.service";

// ✅ Get all products (with optional user_id)
export const getAllProducts = async (outlet: string, userId: string | null) => {
  const productPath = `sephcocco_${outlet}_products`;
  const url = `/${outlet}/${productPath}`;

  const client = await apiClient();

  const response = await client.get(url, {
    params: {
      user_id: userId ?? undefined,
    },
  });

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

// ✅ Like a product (POST)
export const likeProduct = async (outlet: string, id: string) => {
  const productPath = `sephcocco_${outlet}_products`;
  const url = `/${outlet}/${productPath}/${id}/like?${id}`;

  const client = await apiClient();
console.log('url', url)
  const response = await client.post(url);
console.log(response)
  return response.data.product ?? response.data;
};

// ✅ Unlike a product (POST)
export const unlikeProduct = async (outlet: string, id: string) => {
  const productPath = `sephcocco_${outlet}_products`;
  const url = `/${outlet}/${productPath}/${id}/unlike`;

  const client = await apiClient();

  const response = await client.post(url);
  
console.log(response)
  return response.data.product ?? response.data;
};
