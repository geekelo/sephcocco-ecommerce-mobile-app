// hooks/products/useProductCategories.ts
import { getProductCategories } from "@/services/category";
import { useQuery } from "@tanstack/react-query";

export const useProductCategories = (activeOutlet: string) => {
  return useQuery({
    queryKey: ["productCategories", activeOutlet],
    queryFn: () => getProductCategories(activeOutlet),
    enabled: !!activeOutlet,
  });
};
