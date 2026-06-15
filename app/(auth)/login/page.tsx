"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, Phone, Chrome } from "lucide-react";
import { loginWithCredentials, loginWithGoogle } from "@/actions/auth";

// ─── Schemas ────────────────────────────────────────────────────────────────

const credentialsSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const otpRequestSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone is required"),
});

const otpVerifySchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

type CredentialsInput = z.infer<typeof credentialsSchema>;
type OtpRequestInput = z.infer<typeof otpRequestSchema>;
type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

// ─── Sub-components ──────────────────────────────────────────────────────────

function InputWrapper({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{message}</p>;
}

const inputClass =
  "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

// ─── Credentials Tab ─────────────────────────────────────────────────────────

function CredentialsTab() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsInput>({
    resolver: zodResolver(credentialsSchema),
  });

  const onSubmit = async (data: CredentialsInput) => {
    setIsLoading(true);
    try {
      const result = await loginWithCredentials(data.email, data.password);
      if (result?.error) {
        toast.error(result.error);
      }
      // On success, next-auth redirects to /dashboard automatically
    } catch {
      // If it's a NEXT_REDIRECT, the error is expected — don't show toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div>
        <Label htmlFor="email">Email address</Label>
        <InputWrapper>
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
            disabled={isLoading}
            {...register("email")}
          />
        </InputWrapper>
        <FieldError message={errors.email?.message} />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-[#FF6B00] hover:text-orange-700 dark:hover:text-orange-400 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <InputWrapper>
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${inputClass} pr-11`}
            disabled={isLoading}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </InputWrapper>
        <FieldError message={errors.password?.message} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-orange-300 dark:hover:shadow-orange-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

// ─── OTP Tab ─────────────────────────────────────────────────────────────────

function OTPTab() {
  const [otpSent, setOtpSent] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const requestForm = useForm<OtpRequestInput>({
    resolver: zodResolver(otpRequestSchema),
  });

  const verifyForm = useForm<OtpVerifyInput>({
    resolver: zodResolver(otpVerifySchema),
  });

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((v) => {
        if (v <= 1) {
          clearInterval(interval);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (data: OtpRequestInput) => {
    setIsSending(true);
    try {
      const isEmail = data.identifier.includes("@");
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEmail
            ? { email: data.identifier }
            : { phone: data.identifier }
        ),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Failed to send OTP");
        return;
      }

      setIdentifier(data.identifier);
      setOtpSent(true);
      startCountdown();
      toast.success(result.message ?? "OTP sent successfully!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (data: OtpVerifyInput) => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, token: data.otp }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "OTP verification failed");
        return;
      }

      toast.success("Verified! Signing you in…");
      // After OTP verify, redirect user — for now go to dashboard
      window.location.href = "/dashboard";
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {!otpSent ? (
        <form onSubmit={requestForm.handleSubmit(handleSendOtp)} className="space-y-4">
          <div>
            <Label htmlFor="otp-identifier">Email or Phone Number</Label>
            <InputWrapper>
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="otp-identifier"
                type="text"
                placeholder="+995 5XX XXX XXX or email"
                className={inputClass}
                disabled={isSending}
                {...requestForm.register("identifier")}
              />
            </InputWrapper>
            <FieldError message={requestForm.formState.errors.identifier?.message} />
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-orange-300 dark:hover:shadow-orange-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending OTP…
              </>
            ) : (
              "Send OTP"
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            OTP sent to{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {identifier}
            </span>
          </p>
          <div>
            <Label htmlFor="otp-code">Enter 6-digit OTP</Label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              disabled={isVerifying}
              {...verifyForm.register("otp")}
            />
            <FieldError message={verifyForm.formState.errors.otp?.message} />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-orange-300 dark:hover:shadow-orange-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          <button
            type="button"
            disabled={countdown > 0 || isSending}
            onClick={() => {
              setOtpSent(false);
              verifyForm.reset();
            }}
            className="w-full text-sm text-[#FF6B00] hover:text-orange-700 dark:hover:text-orange-400 font-medium py-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {countdown > 0 ? `Resend OTP in ${countdown}s` : "Change number / Resend OTP"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "credentials" | "otp";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<Tab>("credentials");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      // NEXT_REDIRECT is thrown as an error internally; this is expected
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
      {/* Card header */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Welcome back 👋
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Sign in to your StudentExpress account
        </p>
      </div>

      {/* Tab switcher */}
      <div className="px-8">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl">
          {(
            [
              { key: "credentials", label: "Email & Password" },
              { key: "otp", label: "OTP Login" },
            ] as { key: Tab; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === key
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-8 py-6">
        {activeTab === "credentials" ? <CredentialsTab /> : <OTPTab />}
      </div>

      {/* Divider */}
      <div className="px-8">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
        </div>
      </div>

      {/* Google sign-in */}
      <div className="px-8 pt-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-750 text-gray-700 dark:text-gray-200 font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Chrome className="w-4 h-4 text-[#4285F4]" />
          )}
          {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
        </button>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#FF6B00] hover:text-orange-700 dark:hover:text-orange-400 font-semibold transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
