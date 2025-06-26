// src/services/auth.service.ts

import { apiClient } from "../api.service";
import { saveToken, saveUser } from "@/lib/tokenStorage";

// ✅ Login
export const loginUser = async (email: string) => {
  const client = await apiClient();
  const url = `/login`;
  const payload = { user: { email } };

  console.log("🔐 [LOGIN] URL:", url);
  console.log("📤 [LOGIN] Payload:", payload);

  const response = await client.post(url, payload);
  const { token, user } = response.data;

  if (token) await saveToken(token);
  if (user) await saveUser(user);

  console.log("✅ [LOGIN] Response:", response.data);
  return response.data;
};

// ✅ Signup
export const signupUser = async (userData: {
  name: string;
  address: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  role?: string;
}) => {
  const client = await apiClient();
  const url = `/signup`;
  const payload = {
    user: {
      ...userData,
      role: userData.role ?? "user",
    },
  };

  console.log("📝 [SIGNUP] URL:", url);
  console.log("📤 [SIGNUP] Payload:", payload);

  const response = await client.post(url, payload);
  const { token, user } = response.data;

  if (token) await saveToken(token);
  if (user) await saveUser(user);

  console.log("✅ [SIGNUP] Response:", response.data);
  return response.data;
};

// ✅ Request Password Reset
export const requestPasswordReset = async (email: string) => {
 const client = await apiClient(); 

  const url = `/password_resets`;
  const payload = { email };

  console.log("🔁 [FORGOT PASSWORD] URL:", url);
  console.log("📤 [FORGOT PASSWORD] Payload:", payload);

  const response = await client.post(url, payload);
  console.log("✅ [FORGOT PASSWORD] Response:", response.data);
  return response.data;
};

// ✅ Reset Password
export const resetPassword = async ({
  token,
  password,
  password_confirmation,
}: {
  token: string;
  password: string;
  password_confirmation: string;
}) => {
  const client = await apiClient();
  const url = `/password_resets/${token}?otp=${token}`;
  const payload = {
    user: {
      password,
      password_confirmation,
    },
  };

  console.log("🔁 [RESET PASSWORD] URL:", url);
  console.log("📤 [RESET PASSWORD] Payload:", payload);

  const response = await client.patch(url, payload);
  console.log("✅ [RESET PASSWORD] Response:", response.data);
  return response.data;
};
