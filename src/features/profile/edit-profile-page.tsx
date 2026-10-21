"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import AppHeader from "@/components/app-header";
import Avatar from "@/components/avatar";
import { Input } from "@/components/ui/input";
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
import { editProfileSchema, type EditProfileValues } from "./edit-schema";
import { useUpdateProfile } from "./use-update-profile";

const labelClass = "text-sm font-semibold text-white";
const inputClass = "font-medium";

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, ready } = useAuthGuard();
  const me = useMe(token);
  const { mutate, isPending, error } = useUpdateProfile(token);

  const fileRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement | null>(null);
  const initialized = useRef(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: "", username: "", email: "", phone: "", bio: "" },
  });

  // Isi form sekali saat data profil selesai dimuat
  useEffect(() => {
    const p = me.data;
    if (!p || initialized.current) return;
    initialized.current = true;
    form.reset({
      name: p.name,
      username: p.username,
      email: p.email,
      phone: p.phone,
      bio: p.bio,
    });
  }, [me.data, form]);

  // Preview avatar baru
  const avatarFile = form.watch("avatar");
  useEffect(() => {
    if (!avatarFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  // Textarea bio tumbuh mengikuti isi
  const bio = form.watch("bio");
  useEffect(() => {
    const el = bioRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [bio]);

  if (!ready) return <div className="min-h-screen bg-black" />;

  const avatarSrc = preview ?? me.data?.avatarUrl;
  const avatarName = me.data?.name ?? "U";

  const onSubmit = (values: EditProfileValues) =>
    mutate(values, {
      onSuccess: () => {
        dispatch(showToast("Profile Updated"));
        router.push("/profile");
      },
    });

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader user={me.data} mobileTitle="Edit Profile" />

      <main className="mx-auto w-full max-w-200.5 px-4 pb-10 pt-6 md:px-0 md:pt-8">
        {/* Back + title (desktop; di mobile sudah ada di header) */}
        <div className="hidden items-center gap-3 md:flex">
          <button type="button" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col md:mt-6 md:flex-row md:gap-12"
          >
            {/* Kolom avatar */}
            <div className="flex flex-col items-center gap-4 md:w-40 md:shrink-0">
              <div className="md:hidden">
                <Avatar src={avatarSrc} name={avatarName} size={80} />
              </div>
              <div className="hidden md:block">
                <Avatar src={avatarSrc} name={avatarName} size={133} />
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    form.setValue("avatar", file, { shouldValidate: true });
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="h-10 w-40 rounded-full border-[#252B37] bg-transparent text-sm font-bold text-white hover:bg-white/5 hover:text-white md:h-11 md:w-full"
              >
                Change Photo
              </Button>
              {form.formState.errors.avatar && (
                <p className="text-center text-sm text-red-500">
                  {form.formState.errors.avatar.message as string}
                </p>
              )}
            </div>

            {/* Kolom field */}
            <div className="mt-6 flex-1 space-y-4 md:mt-0">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>Name</FormLabel>
                    <FormControl>
                      <Input className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>Username</FormLabel>
                    <FormControl>
                      <Input className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>Email</FormLabel>
                    <FormControl>
                      <Input type="email" className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>Number Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" className={inputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>Bio</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        ref={(el) => {
                          field.ref(el);
                          bioRef.current = el;
                        }}
                        rows={3}
                        className="min-h-25 w-full resize-none overflow-hidden rounded-xl border border-[#181D27] bg-[#0A0D12] px-4 py-3 text-sm font-medium leading-6 text-white outline-none placeholder:text-neutral-500 focus-visible:border-[#6936F2] focus-visible:ring-2 focus-visible:ring-[#6936F2]/30"
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
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
