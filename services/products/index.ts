// services/products.service.ts

import { apiClient } from "../api.service";


export const getAllProducts = async (outlet: string, userId: string | null) => {
  const productPath = `sephcocco_${outlet}_products`;
  const response = await apiClient().get(`/${outlet}/${productPath}`, {
    params: {
      user_id: userId ?? undefined,
    },
  });
  return response.data.products ?? response.data;
};

export const getProductById = async (outlet: string, id: string) => {
  const productPath = `sephcocco_${outlet}_products`;
  const response = await apiClient().get(`/${outlet}/${productPath}/${id}`);
  return response.data;
};
