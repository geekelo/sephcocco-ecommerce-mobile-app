// hooks/useAuth.ts
import { useMutation } from "@tanstack/react-query";
import {
  loginUser,
  signupUser,
  requestPasswordReset,
  resetPassword,
} from "@/services/auth";

// LOGIN
export const useLogin = () =>
  useMutation({
    mutationFn: async ({ email }: { email: string }) => loginUser(email),
  });

// SIGNUP
export const useSignup = () =>
  useMutation({
    mutationFn: async (userData: {
      name: string;
      address: string;
      email: string;
      phone_number: string;
      whatsapp_number: string;
      role?: string;
    }) => signupUser(userData),
  });

// REQUEST RESET
export const useRequestReset = () =>
  useMutation({
    mutationFn: async (email: string) => requestPasswordReset(email),
  });

// RESET PASSWORD
export const useResetPassword = () =>
  useMutation({
    mutationFn: async ({
      token,
      password,
      password_confirmation,
    }: {
      token: string;
      password: string;
      password_confirmation: string;
    }) => resetPassword({ token, password, password_confirmation }),
  });
