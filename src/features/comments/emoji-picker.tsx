const EMOJIS = [
  "😀",
  "😅",
  "🥰",
  "😇",
  "🙂",
  "😋",
  "🤪",
  "🤐",
  "😏",
  "🤗",
  "😒",
  "🙄",
  "🤫",
  "😴",
  "🥵",
  "😫",
  "😭",
  "😱",
];

export default function EmojiPicker({
  onPick,
}: {
  onPick: (emoji: string) => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Emoji picker"
      className="absolute bottom-[calc(100%+8px)] left-0 z-20 grid w-max grid-cols-6 gap-1 rounded-2xl border border-[#252B37] bg-[#0A0D12] p-3 shadow-xl"
    >
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onPick(e)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-[28px] leading-none hover:bg-white/5"
        >
          {e}
        </button>
      ))}
    </div>
  );
}
