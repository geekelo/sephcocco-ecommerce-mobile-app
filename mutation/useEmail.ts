
import { useMutation } from "@tanstack/react-query";
import { checkEmailConfirmation, confirmEmailToken, requestEmailConfirmationToken } from "../services/email";

export const useRequestEmailConfirmationToken = () =>
  useMutation({
    mutationFn: async (email: string) =>
      requestEmailConfirmationToken(email),
  });

// 📩 CONFIRM EMAIL TOKEN
export const useConfirmEmailToken = () =>
  useMutation({
    mutationFn: async ({
      email,
      token,
    }: {
      email: string;
      token: string;
    }) => confirmEmailToken(email, token),
  });

// 📩 CHECK EMAIL CONFIRMATION
export const useCheckEmailConfirmation = () =>
  useMutation({
    mutationFn: async (email: string) =>
      checkEmailConfirmation(email),
  });