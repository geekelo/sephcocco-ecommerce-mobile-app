import { apiClient } from "../api.service";

export const getProductCategories = async (activeOutlet: string) => {
  const productPath = `sephcocco_${activeOutlet}_product_categories`;
  const endpoint = `/${activeOutlet}/${productPath}`;

  const client = await apiClient();

  console.log("🌐 Category Endpoint:", client.defaults.baseURL + endpoint);
  try {
    const response = await client.get(endpoint);
    console.log("✅ Fetched Categories:", response.data);
    return response.data.categories ?? response.data;
  } catch (error: any) {
    console.error("❌ Failed to fetch categories:", error?.response?.data || error.message);
    throw error;
  }
};
