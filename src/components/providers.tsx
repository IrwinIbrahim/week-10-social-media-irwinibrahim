"use client";

import { useEffect, useState } from "react";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";
import { setToken } from "@/store/auth-slice";

const TOKEN_KEY = "sociality_token";

function AuthHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) dispatch(setToken(token));
    } catch {}
  }, [dispatch]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
      }),
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthHydrator />
        {children}
      </QueryClientProvider>
    </ReduxProvider>
  );
}
