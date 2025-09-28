// src/services/auth.service.ts

import { apiClient } from "../api.service";
import qs from "qs"; // if you don’t already have it, install: npm i qs

export const requestEmailConfirmationToken = async (email: string) => {
  const client = await apiClient();
  const url = `/sephcocco_users/request_email_confirmation_token?email=${encodeURIComponent(email)}`;

  console.log("📩 [REQUEST CONFIRMATION TOKEN] URL:", url);

  const response = await client.post(url);
  console.log("✅ [REQUEST CONFIRMATION TOKEN] Response:", response.data);

  return response.data;
};

export const confirmEmailToken = async (email: string, token: string) => {
  const client = await apiClient();

  // email raw, token wrapped in quotes
  const payload = qs.stringify({
    email,
    confirmation_token: token,
  });

  // debug URL for logging
  const fullUrl = `/sephcocco_users/confirm_email?email=${encodeURIComponent(email)}&confirmation_token=${encodeURIComponent(token)}`;

  console.log("📩 [CONFIRM EMAIL] Full URL:", fullUrl);
  console.log("📩 [CONFIRM EMAIL] Payload:", payload);

  const response = await client.patch(
    `/sephcocco_users/confirm_email`,
    payload,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  console.log("✅ [CONFIRM EMAIL] Response:", response.data);

  return {
    email,
    token,
    data: response.data,
  };
};

// ✅ Check Email Confirmation Status
export const checkEmailConfirmation = async (email: string) => {
  const client = await apiClient();
  const url = `/sephcocco_users/check_email_confirmation?email=${encodeURIComponent(
    email
  )}`;

  console.log("📩 [CHECK EMAIL CONFIRMATION] URL:", url);

  const response = await client.get(url);
  console.log("✅ [CHECK EMAIL CONFIRMATION] Response:", response.data);

  return response.data;
};
