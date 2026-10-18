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
import { registerSchema, type RegisterValues } from "./schema";
import { useRegister } from "./use-register";

const labelClass = "text-sm font-semibold text-white";

export default function RegisterForm() {
  const router = useRouter();
  const { mutate, isPending, error } = useRegister();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterValues) =>
    mutate(values, { onSuccess: () => router.push("/login") });

  return (
    <div className="w-full max-w-132 rounded-2xl border border-white/10 bg-black/60 p-6">
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

      <h1 className="mt-4 text-center text-xl font-bold">Register</h1>

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
            name="username"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className={labelClass}>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
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
                  <Input
                    type="tel"
                    placeholder="Enter your number phone"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className={labelClass}>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter your confirm password"
                    {...field}
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
            {isPending ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#8B5CF6] hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
