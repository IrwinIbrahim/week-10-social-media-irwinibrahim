/* eslint-disable @next/next/no-img-element */
interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
}

export default function Avatar({ src, name, size = 40 }: AvatarProps) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#6936F2] text-sm font-bold uppercase text-white"
    >
      {name.charAt(0) || "U"}
    </div>
  );
}
