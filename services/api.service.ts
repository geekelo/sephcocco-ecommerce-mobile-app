// src/service/apiClient.ts
import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "@/lib/tokenStorage";

const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ??
  Constants.manifest?.extra?.API_BASE_URL;

export const apiClient = async (requireAuth: boolean = true) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = await getToken();
    console.log("🔐 API Token:", token);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  console.log("🌍 API_BASE_URL:", API_BASE_URL);
  return axios.create({
    baseURL: API_BASE_URL,
    headers,
  });
};
