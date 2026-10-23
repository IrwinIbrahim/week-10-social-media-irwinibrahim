import Link from "next/link";
import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  value: number;
  href?: string;
}

export default function ProfileStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className="mt-5 grid grid-cols-4">
      {stats.map((s, i) => {
        const cls = cn(
          "flex flex-col items-center gap-1 py-1",
          i > 0 && "border-l border-[#181D27]",
          s.href && "hover:bg-white/5",
        );
        const content = (
          <>
            <span className="text-xl font-bold">{s.value}</span>
            <span className="text-sm text-neutral-400">{s.label}</span>
          </>
        );
        return s.href ? (
          <Link key={s.label} href={s.href} className={cls}>
            {content}
          </Link>
        ) : (
          <div key={s.label} className={cls}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
