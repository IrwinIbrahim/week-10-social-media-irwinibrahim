"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import AppHeader from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useMe } from "@/features/feed/hooks";
import { showToast } from "@/store/toast-slice";
import ImageUpload from "./images-upload";
import { postSchema, type PostValues } from "./schema";
import { useCreatePost } from "./use-create-post";

const labelClass = "text-sm font-semibold text-white";

export default function CreatePostPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, ready } = useAuthGuard();
  const me = useMe(token);
  const { mutate, isPending, error } = useCreatePost(token);
  const captionRef = useRef<HTMLTextAreaElement | null>(null);

  const form = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { caption: "" },
  });

  // Textarea tumbuh mengikuti isi caption
  const caption = form.watch("caption");
  useEffect(() => {
    const el = captionRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [caption]);

  if (!ready) return <div className="min-h-screen bg-black" />;

  const onSubmit = (values: PostValues) =>
    mutate(values, {
      onSuccess: () => {
        dispatch(showToast("Success Post"));
        router.push("/");
      },
    });

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader user={me.data} mobileTitle="Add Post" />

      <main className="mx-auto w-full max-w-113 px-4 pb-10 pt-4 md:px-0 md:pt-8">
        {/* Back + title (desktop; di mobile sudah ada di header) */}
        <div className="hidden items-center gap-3 md:flex">
          <button type="button" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Add Post</h1>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 md:mt-5"
            noValidate
          >
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelClass}>Photo</FormLabel>
                  <ImageUpload value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelClass}>Caption</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      ref={(el) => {
                        field.ref(el);
                        captionRef.current = el;
                      }}
                      rows={3}
                      placeholder="Create your caption"
                      className="min-h-25 w-full resize-none overflow-hidden rounded-xl border border-[#181D27] bg-[#0A0D12] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-neutral-500 focus-visible:border-[#6936F2] focus-visible:ring-2 focus-visible:ring-[#6936F2]/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <p role="alert" className="text-sm text-red-500">
                {error.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-full bg-[#6936F2] text-sm font-bold text-white hover:bg-[#5b2bd9] disabled:opacity-60"
            >
              {isPending ? "Sharing..." : "Share"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
