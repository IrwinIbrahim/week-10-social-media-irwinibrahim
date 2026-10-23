import { Suspense, type ReactNode } from "react";

export function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

async function Resolved<T>({
  params,
  children,
}: {
  params: Promise<T>;
  children: (p: T) => ReactNode;
}) {
  return <>{children(await params)}</>;
}

export default function WithParams<T>({
  params,
  children,
}: {
  params: Promise<T>;
  children: (p: T) => ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <Resolved params={params}>{children}</Resolved>
    </Suspense>
  );
}
