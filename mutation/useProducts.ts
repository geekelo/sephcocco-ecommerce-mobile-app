// hooks/products/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProducts,
  getProductById,
  likeProduct,
  unlikeProduct,
} from "@/services/products";

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

// ✅ Like product mutation
export const useLikeProduct = (outlet: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => likeProduct(outlet, id),
    onSuccess: (_, id) => {
      // Invalidate the product queries so UI updates
      queryClient.invalidateQueries({ queryKey: ["product", outlet, id] });
      queryClient.invalidateQueries({ queryKey: ["products", outlet] });
    },
  });
};

// ✅ Unlike product mutation
export const useUnlikeProduct = (outlet: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unlikeProduct(outlet, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["product", outlet, id] });
      queryClient.invalidateQueries({ queryKey: ["products", outlet] });
    },
  });
};
