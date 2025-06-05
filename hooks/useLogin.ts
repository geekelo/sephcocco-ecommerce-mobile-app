// hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { saveToken, saveUser } from '@/lib/tokenStorage';

type LoginPayload = {
  email: string;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({ email }: LoginPayload) => {
      const response = await axios.post(
        'https://sephcocco-lounge-api.onrender.com/api/v1/login',
        {
          user: {
            email,
          },
        }
      );

      const { token, user } = response.data;

      if (token) {
        await saveToken(token);
      }

      if (user) {
        await saveUser(user);
      }

      return response.data;
    },
  });
};
