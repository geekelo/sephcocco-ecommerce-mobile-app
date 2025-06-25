export interface Order {
  id: string;
  name: string;
  image: string;
  price: number;
  ratingCount: number;
  status: 'Pending' | 'Completed' | string;
  likes: number;
  isFavorite: boolean;
  longDescription?: string;
  // Add any other fields returned from the backend
}
