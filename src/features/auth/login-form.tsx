"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/password-input";
import { loginSchema, type LoginValues } from "./schema";
import { useLogin } from "./use-login";

const labelClass = "text-sm font-semibold text-white";

export default function LoginForm() {
  const router = useRouter();
  const { mutate, isPending, error } = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginValues) =>
    mutate(values, { onSuccess: () => router.push("/") });

  return (
    <div className="w-full max-w-111.5 rounded-2xl border border-white/10 bg-black/60 p-6">
      <div className="flex items-center justify-center gap-2">
        <Image
          src="/icons/logo-sociality.svg"
          alt="Sociality"
          width={32}
          height={32}
          priority
        />
        <span className="text-xl font-bold">Sociality</span>
      </div>

      <h1 className="mt-4 text-center text-xl font-bold">Welcome Back!</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-5 space-y-5"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className={labelClass}>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className={labelClass}>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Enter your password" {...field} />
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
            {isPending ? "Loading..." : "Login"}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#8B5CF6] hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
