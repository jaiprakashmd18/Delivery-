import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
}

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Always respond with success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      // Return success even if the user doesn't exist (security best practice)
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, you will receive a password reset link shortly.",
        },
        { status: 200 }
      );
    }

    // Invalidate any existing reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token
    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token: hashedToken,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://studentexpress.ge"}/forgot-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send reset email
    try {
      await getResend().emails.send({
        from: "StudentExpress Georgia <noreply@studentexpress.ge>",
        to: email,
        subject: "Reset your StudentExpress password",
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8" /></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
              <div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                <div style="background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%); padding: 36px 32px; text-align: center;">
                  <h1 style="color: white; font-size: 26px; margin: 0; font-weight: 700;">StudentExpress Georgia</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">Password Reset Request</p>
                </div>
                <div style="padding: 40px 32px;">
                  <h2 style="color: #111; font-size: 20px; margin: 0 0 12px;">Hi ${user.name ?? "there"} 👋</h2>
                  <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">
                    We received a request to reset your password. Click the button below to choose a new one.
                  </p>
                  <p style="color: #888; font-size: 13px; margin: 0 0 28px;">This link will expire in <strong>1 hour</strong>.</p>
                  <a href="${resetUrl}"
                     style="display: inline-block; background: #FF6B00; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                    Reset Password
                  </a>
                  <p style="color: #aaa; font-size: 13px; margin: 28px 0 0; line-height: 1.5;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                  <p style="color: #bbb; font-size: 12px; margin: 16px 0 0; word-break: break-all;">
                    Or copy this link: ${resetUrl}
                  </p>
                </div>
                <div style="background: #f5f5f5; padding: 20px 32px; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0;">© 2025 StudentExpress Georgia. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("[ForgotPassword] Failed to send reset email:", emailError);
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, you will receive a password reset link shortly.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ForgotPassword] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
