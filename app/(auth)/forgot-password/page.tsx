"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const requestSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RequestInput = z.infer<typeof requestSchema>;
type ResetInput = z.infer<typeof resetSchema>;

// ─── Common helpers ───────────────────────────────────────────────────────────

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
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
  return (
    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{message}</p>
  );
}

const inputWithIcon =
  "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

// ─── Step 1: Request reset email ─────────────────────────────────────────────

function RequestStep({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = async (data: RequestInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Failed to send reset email");
        return;
      }

      onSuccess(data.email);
      toast.success("Reset link sent! Check your inbox.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
      <div className="px-8 pt-8 pb-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] mb-5 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Forgot your password?
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-4">
        <div>
          <Label htmlFor="forgot-email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputWithIcon}
              disabled={isLoading}
              {...register("email")}
            />
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-orange-300 dark:hover:shadow-orange-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending reset link…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Step 1b: Email sent confirmation ────────────────────────────────────────

function EmailSentStep({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  return (
    <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
      <div className="px-8 py-10 text-center space-y-5">
        <div className="w-16 h-16 bg-[#00C853]/10 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-[#00C853]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Check your inbox
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            We sent a password reset link to{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {email}
            </span>
            . It expires in 1 hour.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Didn&apos;t receive it? Check your spam folder, or
          </p>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-[#FF6B00] hover:text-orange-700 dark:hover:text-orange-400 font-semibold transition-colors"
          >
            try again with a different email
          </button>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}

// ─── Step 2: Reset password ───────────────────────────────────────────────────

function ResetStep({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
  });

  const passwordValue = watch("password") ?? "";
  const checks = [
    { label: "8+ characters", pass: passwordValue.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(passwordValue) },
    { label: "Lowercase letter", pass: /[a-z]/.test(passwordValue) },
    { label: "Number", pass: /[0-9]/.test(passwordValue) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const barColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-[#00C853]", "bg-[#00C853]"];

  const onSubmit = async (data: ResetInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Failed to reset password");
        return;
      }

      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
        <div className="px-8 py-10 text-center space-y-5">
          <div className="w-16 h-16 bg-[#00C853]/10 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[#00C853]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Password reset!
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your password has been updated. Redirecting you to login…
            </p>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-[#FF6B00] mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Set new password
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Resetting password for{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {email}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-4">
        {/* New Password */}
        <div>
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
              className={`${inputWithIcon} pr-11`}
              disabled={isLoading}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Strength indicator */}
          {passwordValue && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < score
                        ? barColors[score]
                        : "bg-gray-200 dark:bg-neutral-700"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                {checks.map(({ label, pass }) => (
                  <span
                    key={label}
                    className={`text-xs ${
                      pass
                        ? "text-[#00C853] dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500"
                    } transition-colors`}
                  >
                    {pass ? "✓" : "○"} {label}
                  </span>
                ))}
              </div>
            </div>
          )}
          <FieldError message={errors.password?.message} />
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirm-new-password">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="confirm-new-password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              className={`${inputWithIcon} pr-11`}
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-orange-300 dark:hover:shadow-orange-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting password…
            </>
          ) : (
            "Reset password"
          )}
        </button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Step = "request" | "sent" | "reset";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [step, setStep] = useState<Step>(
    tokenParam && emailParam ? "reset" : "request"
  );
  const [sentToEmail, setSentToEmail] = useState("");

  // Sync URL params — if user lands with token+email, go straight to reset
  useEffect(() => {
    if (tokenParam && emailParam) {
      setStep("reset");
    }
  }, [tokenParam, emailParam]);

  if (step === "reset" && tokenParam && emailParam) {
    return (
      <ResetStep
        token={tokenParam}
        email={decodeURIComponent(emailParam)}
      />
    );
  }

  if (step === "sent") {
    return (
      <EmailSentStep
        email={sentToEmail}
        onBack={() => {
          setSentToEmail("");
          setStep("request");
        }}
      />
    );
  }

  return (
    <RequestStep
      onSuccess={(email) => {
        setSentToEmail(email);
        setStep("sent");
      }}
    />
  );
}

export default function ForgotPasswordPage() {
  return (
    <div>
      <ForgotPasswordContent />
    </div>
  );
}
