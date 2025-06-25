// services/auth.service.ts
import axios from "axios";
import Constants from "expo-constants";
import { saveToken, saveUser } from "@/lib/tokenStorage";

const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ??
  Constants.manifest?.extra?.API_BASE_URL;

export const loginUser = async (email: string) => {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    user: { email },
  });

  const { token, user } = response.data;

  if (token) await saveToken(token);
  if (user) await saveUser(user);

  return response.data;
};

export const signupUser = async (userData: {
  name: string;
  address: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  role?: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/signup`, {
    user: {
      ...userData,
      role: userData.role ?? "user",
    },
  });

  const { token, user } = response.data;

  if (token) await saveToken(token);
  if (user) await saveUser(user);

  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await axios.post(`${API_BASE_URL}/password_resets?email=${email}`, {
    email,
  });
  return response.data;
};

export const resetPassword = async ({
  token,
  password,
  password_confirmation,
}: {
  token: string;
  password: string;
  password_confirmation: string;
}) => {
  const response = await axios.patch(
    `${API_BASE_URL}/password_resets/${token}?otp=${token}`,
    {
      user: { password, password_confirmation },
    }
  );
  return response.data;
};
