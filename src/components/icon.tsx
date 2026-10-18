import { cn } from "@/lib/utils";

interface IconProps {
  name: string; // nama file tanpa .svg, mis. "logo-home"
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 24, className }: IconProps) {
  const url = `url(/icons/${name}.svg)`;
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
