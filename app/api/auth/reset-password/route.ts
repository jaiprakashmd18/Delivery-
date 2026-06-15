import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import prisma from "@/lib/prisma";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token, email, password } = parsed.data;

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: `reset:${email}`,
        token: hashedToken,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        {
          error:
            "This password reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Update password and delete the used token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return NextResponse.json(
      {
        message:
          "Password reset successfully. You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ResetPassword] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
