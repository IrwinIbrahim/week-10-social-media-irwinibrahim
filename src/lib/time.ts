import dayjs from "dayjs";

export function timeAgo(iso: string) {
  const t = dayjs(iso);
  if (!t.isValid()) return "";

  const now = dayjs();
  const seconds = now.diff(t, "second");
  if (seconds < 60) return "Just Now";

  const minutes = now.diff(t, "minute");
  if (minutes < 60) return `${minutes} Minutes Ago`;

  const hours = now.diff(t, "hour");
  if (hours < 24) return `${hours} Hours Ago`;

  const days = now.diff(t, "day");
  if (days < 7) return `${days} Days Ago`;

  return t.format("DD MMM YYYY");
}
