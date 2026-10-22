import dayjs from "dayjs";

const ago = (n: number, unit: string) => `${n} ${unit}${n > 1 ? "s" : ""} Ago`;

export function timeAgo(iso: string) {
  const t = dayjs(iso);
  if (!t.isValid()) return "";

  const now = dayjs();
  const seconds = now.diff(t, "second");
  if (seconds < 60) return "Just Now";

  const minutes = now.diff(t, "minute");
  if (minutes < 60) return ago(minutes, "Minute");

  const hours = now.diff(t, "hour");
  if (hours < 24) return ago(hours, "Hour");

  const days = now.diff(t, "day");
  if (days < 7) return ago(days, "Day");

  return t.format("DD MMM YYYY");
}
