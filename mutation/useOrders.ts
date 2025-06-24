// hooks/orders/useOrders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "@/services/orders";
import { Order } from "@/types/order";


export const useGetAllOrders = (outlet: string, userId: string | null) => {
  return useQuery<Order[]>({
    queryKey: ["orders", outlet, userId],
    queryFn: () => getAllOrders(outlet, userId),
    enabled: !!outlet,
  });
};

export const useGetOrderById = (
  outlet: string,
  orderId: string,
  userId: string | null
) => {
  return useQuery({
    queryKey: ["order", outlet, orderId, userId],
    queryFn: () => getOrderById(outlet, orderId, userId),
    enabled: !!orderId && !!outlet,
  });
};

export const useCreateOrder = (outlet: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      user_id: string;
      product_id: string;
      quantity: number;
      outlet: string;
    }) => createOrder({ ...payload, outlet }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", outlet] });
    },
  });
};

export const useUpdateOrder = (outlet: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      id: string;
      user_id: string;
      product_id?: string;
      quantity?: number;
      outlet: string;
    }) => updateOrder({ ...payload, outlet }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", outlet] });
    },
  });
};

export const useDeleteOrder = (outlet: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrder(outlet, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", outlet] });
    },
  });
};
