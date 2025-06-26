export interface SimilarProduct {
  id: number;
  title: string;
  price: number;
  image: any;
  favorites: number;
  amount: string;
  stock: number;
}
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  discount_price: string;
  amount_in_stock: number;
  out_of_stock_status: boolean;
  short_description: string;
  long_description: string;
  visible: boolean;
  main_image_url: string | null;
  other_image_urls: string[];
  categories: ProductCategory[];
  likes: number;
  liked_by_user: boolean;
  created_at: string;
  updated_at: string;
}


export interface Order {
  id: number;
  name: string;
  price: number;
  image: any;
  status: string;
  products: Product[];
  quantity:any
}
