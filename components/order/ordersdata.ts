


export const orders = [
  // Pending Orders
  { 
    id: 1, 
    name: 'Listerine Zero', 
    status: 'Delivering', 
    price: 120.00, 
    images: [require('../../assets/images/image-1.png')],
    image: require('../../assets/images/image-1.png'),
    orderDate: '2025-05-01',
    estimatedDelivery: '2025-05-10',
    // Adding product-like properties
    inStock: true,
    stockCount: 42,
    isFavorite: false,
    category: "oral-care",
    likes: 214,
    shortDescription: "Alcohol-free mouthwash for fresh breath and oral hygiene.",
    longDescription: "Listerine Zero provides 24-hour fresh breath protection without the burn of alcohol. It kills 99.9% of germs that cause bad breath, plaque, and gum disease for a cleaner, healthier mouth.",
    rating: 4.6,
    ratingCount: 78
  },
  { 
    id: 2, 
    name: 'Panadol Extra', 
    status: 'Processing Order', 
    price: 129.00, 
    images: [require('../../assets/images/image-1.png')],
    image: require('../../assets/images/image-1.png'),
    orderDate: '2025-05-02',
    estimatedDelivery: '2025-05-12',
    // Adding product-like properties
    inStock: true,
    stockCount: 28,
    isFavorite: true,
    category: "pain-relief",
    likes: 187,
    shortDescription: "Fast-acting pain relief for headaches and fever.",
    longDescription: "Panadol Extra combines paracetamol and caffeine for enhanced pain relief. The unique formula helps provide faster absorption and more effective relief from headaches, migraines, and fever.",
    rating: 4.7,
    ratingCount: 92
  },
//   { 
//     id: 3, 
//     name: 'Vitamin C Tablets', 
//     status: 'Processing Payment', 
//     price: 89.00, 
//     images: [Image, Image],
//     image: Image,
//     orderDate: '2025-05-03',
//     estimatedDelivery: '2025-05-13',
//     // Adding product-like properties
//     inStock: true,
//     stockCount: 36,
//     isFavorite: false,
//     category: "oral-care",
//     likes: 153,
//     shortDescription: "Boost your immunity with high-potency Vitamin C tablets.",
//     longDescription: "Our Vitamin C tablets provide 1000mg of high-potency vitamin C per tablet, supporting immune function, collagen production, and antioxidant protection.",
//     rating: 4.5,
//     ratingCount: 64
//   },
//   { 
//     id: 4, 
//     name: 'Zinc Supplement', 
//     status: 'Awaiting Payment Confirmation', 
//     price: 75.50, 
//     images: [Image, Image],
//     image: Image,
//     orderDate: '2025-05-04',
//     estimatedDelivery: '2025-05-14',
//     // Adding product-like properties
//     inStock: true,
//     stockCount: 19,
//     isFavorite: true,
//     category: "supplements",
//     likes: 124,
//     shortDescription: "Supports immune function and helps fight infections naturally.",
//     longDescription: "This zinc supplement contains 50mg of high-quality zinc per tablet, essential for immune system support, protein synthesis, and DNA formation.",
//     rating: 4.3,
//     ratingCount: 52
//   },
  
  // Completed Orders
  { 
    id: 5, 
    name: 'Omega-3 Fish Oil', 
    status: 'Arrived', 
    price: 149.00, 
    images: [require('../../assets/images/image-1.png')],
    image: require('../../assets/images/image-1.png'),
    orderDate: '2025-04-20',
    deliveredDate: '2025-04-27',
    // Adding product-like properties
    inStock: true,
    stockCount: 28,
    isFavorite: false,
    category: "oral-care",
    likes: 162,
    shortDescription: "Promotes heart, brain, and joint health with omega-3 fatty acids.",
    longDescription: "Our premium Omega-3 Fish Oil provides 1200mg of fish oil per softgel with high concentrations of EPA and DHA fatty acids.",
    rating: 4.7,
    ratingCount: 98
  },
//   { 
//     id: 6, 
//     name: 'Protein Powder', 
//     status: 'Completed', 
//     price: 249.00, 
//     images: [Image, Image],
//     image: Image,
//     orderDate: '2025-04-15',
//     deliveredDate: '2025-04-22',
//     // Adding product-like properties
//     inStock: true,
//     stockCount: 24,
//     isFavorite: true,
//     category: "fitness-supplements",
//     likes: 205,
//     shortDescription: "Fuel your workouts and recovery with high-quality protein.",
//     longDescription: "Our premium Protein Powder delivers 25g of high-quality whey protein isolate per serving with minimal fat and carbohydrates.",
//     rating: 4.7,
//     ratingCount: 105
//   },
//   { 
//     id: 7, 
//     name: 'Multivitamin Complex', 
//     status: 'Completed', 
//     price: 199.00, 
//     images: [Image, Image],
//     image: Image,
//     orderDate: '2025-04-10',
//     deliveredDate: '2025-04-17',
//     // Adding product-like properties
//     inStock: true,
//     stockCount: 32,
//     isFavorite: false,
//     category: "vitamins",
//     likes: 178,
//     shortDescription: "Balanced mix of essential vitamins and minerals for daily health.",
//     longDescription: "Our Multivitamin Complex contains a balanced blend of vitamins, minerals, and antioxidants to support overall health and wellbeing.",
//     rating: 4.6,
//     ratingCount: 87
//   }
];

// Helper function to get similar products from the same category
export const getSimilarOrderProducts = (currentOrder:any) => {
  if (!currentOrder || !currentOrder.category) return [];
  
  return orders.filter(order => 
    order.category === currentOrder.category && 
    order.id !== currentOrder.id
  );
};