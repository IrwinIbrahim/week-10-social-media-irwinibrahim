"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { TOKEN_KEY } from "@/features/auth/use-login";

export function useAuthGuard() {
  const router = useRouter();
  const reduxToken = useSelector((s: RootState) => s.auth.token);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let t = reduxToken;
    if (!t) {
      try {
        t = localStorage.getItem(TOKEN_KEY);
      } catch {}
    }
    if (!t) {
      router.replace("/login");
      return;
    }
    setToken(t);
    setReady(true);
  }, [reduxToken, router]);

  return { token, ready };
}
