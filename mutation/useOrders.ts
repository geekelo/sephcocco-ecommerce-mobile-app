// hooks/orders/useOrders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getAllPaidOrders,
  getAllPendingOrders,
  getAllCompletedOrders,
} from "@/services/orders";
import { Order } from "@/types/order";


export const useGetAllOrders = (outlet: string, userId: string | null) => {
  return useQuery<Order[]>({
    queryKey: ["orders", outlet, userId],
    queryFn: () => getAllOrders(outlet, userId),
    enabled: !!outlet,
  });
};


export const useGetPaidOrders = (outlet: string, userId: string | null) => {
  return useQuery<Order[]>({
    queryKey: ["orders", outlet, userId],
    queryFn: () => getAllPaidOrders(outlet, userId),
    enabled: !!outlet,
  });
};


export const useGetPendingOrders = (outlet: string, userId: string | null) => {
  return useQuery<Order[]>({
    queryKey: ["orders", outlet, userId],
    queryFn: () => getAllPendingOrders(outlet, userId),
    enabled: !!outlet,
  });
};

export const useGetCompletedOrders = (outlet: string, userId: string | null) => {
  return useQuery<Order[]>({
    queryKey: ["orders", outlet, userId],
    queryFn: () => getAllCompletedOrders(outlet, userId),
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
      product_id: string;
      quantity: number;
      outlet: string;
      address: string;
      phone_number: string;
      additional_notes?: string;
    }) => createOrder({ ...payload, outlet }),

    onSuccess: (data) => {
      console.log("✅ Order created successfully. Backend response:", data);
      queryClient.invalidateQueries({ queryKey: ["orders", outlet] });
    },

    onError: (error: any) => {
      console.error("❌ Failed to create order:", error?.response?.data || error.message);
    },
  });
};


export const useUpdateOrder = (outlet: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      id: any;
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
