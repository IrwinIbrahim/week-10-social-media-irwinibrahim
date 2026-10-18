import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/store/auth-slice";
import type { LoginValues } from "./schema";

export const TOKEN_KEY = "sociality_token";

type LoginResponse = {
  token?: string;
  accessToken?: string;
  data?: { token?: string; accessToken?: string };
};

// ⚠️ Penyesuaian path & body dengan Swagger bila berbeda
export function useLogin() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (values: LoginValues) => {
      const res = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const token =
        res.data?.token ??
        res.token ??
        res.data?.accessToken ??
        res.accessToken;

      if (!token) throw new Error("Token tidak ditemukan pada response API.");
      return token;
    },
    onSuccess: (token) => {
      dispatch(setToken(token));
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch {}
    },
  });
}
