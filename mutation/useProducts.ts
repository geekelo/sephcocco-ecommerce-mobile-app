// hooks/products/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import { getAllProducts, getProductById } from "@/services/products";

export const useProducts = (outlet: string, userId: string | null) => {
  return useQuery({
    queryKey: ["products", outlet, userId],
    queryFn: () => getAllProducts(outlet, userId),
    enabled: !!outlet,
  });
};

export const useProductById = (outlet: string, id: string | null) => {
  return useQuery({
    queryKey: ["product", outlet, id],
    queryFn: () => getProductById(outlet, id as string),
    enabled: !!outlet && !!id,
  });
};