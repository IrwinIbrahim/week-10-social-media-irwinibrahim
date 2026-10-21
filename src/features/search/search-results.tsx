"use client";

import Link from "next/link";
import Avatar from "@/components/avatar";
import { useDebounce, useUserSearch } from "./hooks";

interface SearchResultsProps {
  token: string | null;
  term: string;
  onSelect?: () => void;
}

export default function SearchResults({
  token,
  term,
  onSelect,
}: SearchResultsProps) {
  const debounced = useDebounce(term, 300);
  const query = useUserSearch(token, debounced);

  // Masih menunggu debounce selesai
  if (term.trim() !== debounced.trim() || query.isLoading) {
    return (
      <ul className="space-y-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex animate-pulse items-center gap-3 p-2">
            <div className="h-10 w-10 rounded-full bg-[#181D27]" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-[#181D27]" />
              <div className="h-3 w-16 rounded bg-[#181D27]" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (query.isError) {
    return (
      <p className="p-3 text-sm text-red-500">
        {query.error instanceof Error
          ? query.error.message
          : "Failed to search."}
      </p>
    );
  }

  const users = query.data ?? [];

  if (users.length === 0) {
    return <p className="p-3 text-sm text-neutral-400">No users found.</p>;
  }

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id || u.username}>
          <Link
            href={`/users/${encodeURIComponent(u.username)}`}
            onClick={onSelect}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5"
          >
            <Avatar src={u.avatarUrl} name={u.name} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{u.name}</p>
              <p className="truncate text-sm text-neutral-400">{u.username}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
