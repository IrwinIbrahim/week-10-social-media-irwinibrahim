import * as React from "react";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full rounded-xl border border-[#181D27] bg-[#0A0D12] px-4 text-sm text-white outline-none",
        "placeholder:text-neutral-500 focus-visible:border-[#6936F2] focus-visible:ring-2 focus-visible:ring-[#6936F2]/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
