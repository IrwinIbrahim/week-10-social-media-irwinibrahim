import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "./api";

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export function useUserSearch(token: string | null, term: string) {
  const q = term.trim();

  return useQuery({
    queryKey: ["user-search", q],
    queryFn: () => searchUsers(token!, q),
    enabled: !!token && q.length > 0,
  });
}
