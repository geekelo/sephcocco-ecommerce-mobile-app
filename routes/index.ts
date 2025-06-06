export const Routes = {
  auth: {
    login: '/auth/signIn' as const,
    register: '/auth/signup',
    forgotPassword: '/auth/forgotPassword',
    
  },

  products: {
    all: '/products',
    single: (id: string | number) => `/products/${id}`,
    create: '/products/create',
    edit: (id: string | number) => `/products/${id}/edit`,
  },

  outlets: {
    pharmacy: '/pharmacy',
    restaurant: '/restaurant',
    lounge: '/lounge',
  },

  orders: {
    all: '/orders',
    details: (id: string | number) => `/orders/${id}`,
    track: (id: string | number) => `/orders/${id}/track`,
  },

  account: {
    profile: '/account/profile',
    settings: '/account/settings',
  },

  home: '/',
};
