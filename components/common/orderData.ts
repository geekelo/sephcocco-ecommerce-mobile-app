// ordersData.ts

import { SimilarProduct, Order } from '@/components/types/types'; // Adjust path as needed

export const orders: Order[] = [
  {
    id: 1,
    name: 'Order 1',
    price: 250,
    image: require('@/assets/images/image(1).png'),
    status: 'Processing Order',
    products: [
      {
        id: 101,
        title: 'Product A',
        price: 100,
        image: require('@/assets/images/image(1).png'),
        favorites: 12,
        amount: '1kg',
        stock: 10,
      },
      {
        id: 102,
        title: 'Product B',
        price: 150,
        image: require('@/assets/images/image(1).png'),
        favorites: 5,
        amount: '500g',
        stock: 4,
      },
    ],
  },
  {
    id: 2,
    name: 'Order 2',
    price: 200,
    image: require('@/assets/images/image(1).png'),
    status: 'Awaiting Payment Confirmation',
    products: [
      {
        id: 103,
        title: 'Product C',
        price: 200,
        image: require('@/assets/images/image(1).png'),
        favorites: 9,
        amount: '750g',
        stock: 3,
      },
    ],
  },
  {
    id: 3,
    name: 'Order 3',
    price: 300,
    image: require('@/assets/images/image(1).png'),
    status: 'Delivering',
    products: [
      {
        id: 104,
        title: 'Product D',
        price: 300,
        image: require('@/assets/images/image(1).png'),
        favorites: 2,
        amount: '2kg',
        stock: 8,
      },
    ],
  },
];


export const getSimilarOrderProducts = (order: Order): SimilarProduct[] => {
  return [
    {
      id: 201,
      title: 'Similar Product 1',
      price: 80,
      image: require('@/assets/images/image(1).png'),
      favorites: 7,
      amount: '500g',
      stock: 12,
    },
    {
      id: 202,
      title: 'Similar Product 2',
      price: 120,
      image: require('@/assets/images/image(1).png'),
      favorites: 3,
      amount: '1kg',
      stock: 6,
    },
  ];
};
