import { apiClient } from "../api.service";


export const getProductCategories = async (activeOutlet: string) => {
  const productPath = `sephcocco_${activeOutlet}_product_categories`;
  const endpoint = `/${activeOutlet}/${productPath}`;

  const response = await apiClient().get(endpoint);
  return response.data;
};
