// constants/query-keys.ts
const QUERY_KEYS = {
  LOGIN: ["auth", "login"],
  SIGNUP: ["auth", "signup"],
  PASSWORD_RESET: ["auth", "reset"],
  PRODUCTS: (outlet: string, userId?: string | null) => ["products", outlet, userId],
  PRODUCT: (outlet: string, id: string) => ["product", outlet, id],
};

export default QUERY_KEYS;
