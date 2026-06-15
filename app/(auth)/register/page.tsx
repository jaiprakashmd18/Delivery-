"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  Phone,
  User,
  GraduationCap,
  BadgeCheck,
  Gift,
  Chrome,
} from "lucide-react";
import { loginWithGoogle } from "@/actions/auth";

// ─── Schema ──────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .regex(
        /^(\+995|0)(5\d{8}|[23]\d{7})$/,
        "Please enter a valid Georgian phone number"
      )
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    studentId: z.string().optional(),
    university: z.string().optional(),
    referralCode: z
      .string()
      .length(8, "Referral code must be exactly 8 characters")
      .optional()
      .or(z.literal("")),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterInput = z.infer<typeof registerSchema>;

// ─── Helper components ───────────────────────────────────────────────────────

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

const inputBase =
  "w-full py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

const inputWithIcon = `${inputBase} pl-10 pr-4`;

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Lowercase", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-[#00C853]", "bg-[#00C853]"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score] : "bg-gray-200 dark:bg-neutral-700"
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
            } transition-colors duration-200`}
          >
            {pass ? "✓" : "○"} {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: undefined as unknown as true },
  });

  const passwordValue = watch("password") ?? "";

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          password: data.password,
          confirmPassword: data.confirmPassword,
          studentId: data.studentId || undefined,
          university: data.university || undefined,
          referralCode: data.referralCode || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        // Handle validation errors object
        if (result.details) {
          const firstError = Object.values(result.details as Record<string, string[]>)[0]?.[0];
          toast.error(firstError ?? result.error ?? "Registration failed");
        } else {
          toast.error(result.error ?? "Registration failed");
        }
        return;
      }

      toast.success(
        result.message ?? "Account created! Welcome to StudentExpress Georgia!",
        { duration: 5000 }
      );
      router.push("/login");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      // NEXT_REDIRECT is expected
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Join StudentExpress Georgia — fast delivery for students
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-6 space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Giorgi Beridze"
              className={inputWithIcon}
              disabled={isLoading}
              {...register("name")}
            />
          </div>
          <FieldError message={errors.name?.message} />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="reg-email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="reg-email"
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

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+995 5XX XXX XXX"
              className={inputWithIcon}
              disabled={isLoading}
              {...register("phone")}
            />
          </div>
          <FieldError message={errors.phone?.message} />
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="reg-password"
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
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <PasswordStrength password={passwordValue} />
          <FieldError message={errors.password?.message} />
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              className={`${inputWithIcon} pr-11`}
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        {/* Optional section toggle */}
        <button
          type="button"
          onClick={() => setShowOptional((v) => !v)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors font-medium"
        >
          <span
            className={`w-4 h-4 rounded border border-current flex items-center justify-center transition-colors ${
              showOptional ? "text-[#FF6B00]" : ""
            }`}
          >
            {showOptional ? "−" : "+"}
          </span>
          Add student info & referral code (optional)
        </button>

        {/* Optional fields */}
        {showOptional && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-xl border border-gray-100 dark:border-neutral-700">
            {/* University */}
            <div>
              <Label htmlFor="university">University</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="university"
                  type="text"
                  placeholder="e.g. Tbilisi State University"
                  className={inputWithIcon}
                  disabled={isLoading}
                  {...register("university")}
                />
              </div>
              <FieldError message={errors.university?.message} />
            </div>

            {/* Student ID */}
            <div>
              <Label htmlFor="studentId">Student ID</Label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="studentId"
                  type="text"
                  placeholder="Your student ID number"
                  className={inputWithIcon}
                  disabled={isLoading}
                  {...register("studentId")}
                />
              </div>
              <FieldError message={errors.studentId?.message} />
            </div>

            {/* Referral Code */}
            <div>
              <Label htmlFor="referralCode">Referral Code</Label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="referralCode"
                  type="text"
                  placeholder="8-character code"
                  maxLength={8}
                  className={`${inputWithIcon} uppercase`}
                  disabled={isLoading}
                  {...register("referralCode")}
                />
              </div>
              <FieldError message={errors.referralCode?.message} />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Enter a friend&apos;s referral code to earn bonus credits!
              </p>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-neutral-600 text-[#FF6B00] focus:ring-[#FF6B00] focus:ring-offset-0 cursor-pointer"
            disabled={isLoading}
            {...register("terms")}
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-[#FF6B00] hover:text-orange-700 dark:hover:text-orange-400 font-medium underline underline-offset-2"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-[#FF6B00] hover:text-orange-700 dark:hover:text-orange-400 font-medium underline underline-offset-2"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        <FieldError message={errors.terms?.message} />

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-orange-300 dark:hover:shadow-orange-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
            Or sign up with
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
        </div>

        {/* Google sign-up */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
      </form>

      {/* Footer */}
      <div className="px-8 pb-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#FF6B00] hover:text-orange-700 dark:hover:text-orange-400 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
