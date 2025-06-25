// src/service/apiClient.ts
import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "@/lib/tokenStorage"; // 🔐 You must implement this to fetch token from secure storage

const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ??
  Constants.manifest?.extra?.API_BASE_URL;

export const apiClient = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add Authorization header dynamically
  instance.interceptors.request.use(
    async (config) => {
      const token = await getToken(); // 👈 Fetch token from local storage
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};
