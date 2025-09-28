import { apiClient } from "../api.service";

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
export const getProductById = async (outlet: string, id: string) => {
  const productPath = `sephcocco_${outlet}_products`;
  const url = `/${outlet}/${productPath}/${id}`;

  const client = await apiClient();

  const response = await client.get(url);

  return response.data ?? response.data;
};

export const likeProduct = async (outlet: string, id: string) => {
  const productPath = `sephcocco_${outlet}_products`;
  const url = `/${outlet}/${productPath}/${id}/like?${id}`;

  const client = await apiClient();
  const response = await client.post(url);

  return response.data.product ?? response.data;
};

export const unlikeProduct = async (outlet: string, id: string) => {
  const productPath = `sephcocco_${outlet}_products`;
  const url = `/${outlet}/${productPath}/${id}/unlike`;

  const client = await apiClient();

  const response = await client.post(url);
  
  return response.data.product ?? response.data;
};
