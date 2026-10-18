import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { RegisterValues } from "./schema";

// ⚠️ Penyesuaian path & body dengan Swagger bila berbeda
export function useRegister() {
  return useMutation({
    mutationFn: ({ email, username, phone, password }: RegisterValues) =>
      apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: username, // ganti jika API butuh name terpisah
          email,
          username,
          phone,
          password,
        }),
      }),
  });
}
