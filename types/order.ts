export interface Order {
  id: string;
  name: string;
  image?: string;
  price: number;
  ratingCount: number;
  status: 'Pending' | 'Completed' | string;
  likes: number;
  isFavorite: boolean;
  longDescription?: string;
  quantity:number
  // Add any other fields returned from the backend
}

export interface create_order {
  product_id: string;
    quantity: number;
    outlet: string;
    address: string;
    phone_number: string;
    additional_notes?: string;
}