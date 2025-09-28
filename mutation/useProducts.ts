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

export const useLikeProduct = (outlet: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => likeProduct(outlet, id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["products", outlet] });

      const previous = queryClient.getQueryData<any[]>(["products", outlet]);

      queryClient.setQueryData<any[]>(["products", outlet], (old) =>
        old?.map((product) =>
          product.id === id
            ? {
                ...product,
                liked_by_user: true,
                likes: (product.likes || 0) + 1,
              }
            : product
        ) ?? []
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["products", outlet], context.previous);
      }
    },

    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: ["products", outlet] });
      queryClient.invalidateQueries({ queryKey: ["product", outlet, id] });
    },
  });
};

export const useUnlikeProduct = (outlet: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unlikeProduct(outlet, id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["products", outlet] });

      const previous = queryClient.getQueryData<any[]>(["products", outlet]);

      queryClient.setQueryData<any[]>(["products", outlet], (old) =>
        old?.map((product) =>
          product.id === id
            ? {
                ...product,
                liked_by_user: false,
                likes: Math.max((product.likes || 0) - 1, 0),
              }
            : product
        ) ?? []
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["products", outlet], context.previous);
      }
    },

    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: ["products", outlet] });
      queryClient.invalidateQueries({ queryKey: ["product", outlet, id] });
    },
  });
};
