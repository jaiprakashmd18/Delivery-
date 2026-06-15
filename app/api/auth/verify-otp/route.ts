import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const verifyOtpSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone is required"),
  token: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { identifier, token } = parsed.data;
    const now = new Date();

    // Detect whether identifier is email or phone
    const isEmail = identifier.includes("@");

    // Find a valid, unused, non-expired OTP
    const otpRecord = await prisma.oTPToken.findFirst({
      where: {
        ...(isEmail ? { email: identifier } : { phone: identifier }),
        token,
        used: false,
        expires: { gt: now },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await prisma.oTPToken.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // If phone verification, mark the user's phone as verified
    if (!isEmail) {
      await prisma.user.updateMany({
        where: { phone: identifier },
        data: { isVerified: true },
      });
    }

    return NextResponse.json(
      { message: "OTP verified successfully.", verified: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("[VerifyOTP] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
