"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import type { RootState } from "@/store";
import { hideToast } from "@/store/toast-slice";

export default function Toaster() {
  const dispatch = useDispatch();
  const { message, id } = useSelector((s: RootState) => s.toast);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => dispatch(hideToast()), 3000);
    return () => clearTimeout(t);
  }, [message, id, dispatch]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 top-21 z-60 flex h-10 items-center justify-between rounded-lg bg-[#039855] px-3 text-sm font-semibold text-white shadow-lg md:inset-x-auto md:right-6 md:top-26.25 md:w-75 xl:left-[calc(50%+332px)] xl:right-auto"
    >
      <span>{message}</span>
      <button
        type="button"
        aria-label="Close"
        onClick={() => dispatch(hideToast())}
      >
        <X size={16} />
      </button>
    </div>
  );
}
