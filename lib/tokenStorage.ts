// utils/tokenStorage.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    console.log("🧪 getToken() result:", token);
    return token;
  } catch (error) {
    console.error("❌ Failed to get token from SecureStore:", error);
    return null;
  }
};


export const deleteToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const saveUser = async (user: any) => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const getUser = async (): Promise<any | null> => {
  const json = await SecureStore.getItemAsync(USER_KEY);
  return json ? JSON.parse(json) : null;
};

export const deleteUser = async () => {
  await SecureStore.deleteItemAsync(USER_KEY);
};

export const logout = async () => {
  try {
    await deleteToken();
    await deleteUser();
    console.log('✅ User logged out successfully');
  } catch (e) {
    console.error('❌ Failed to log out user:', e);
  }
};