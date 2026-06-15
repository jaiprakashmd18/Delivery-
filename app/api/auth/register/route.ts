import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
}

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
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    studentId: z.string().optional(),
    university: z.string().optional(),
    referralCode: z
      .string()
      .length(8, "Referral code must be exactly 8 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      password,
      studentId,
      university,
      referralCode,
    } = parsed.data;

    // Check for duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Check for duplicate phone
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
        select: { id: true },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "An account with this phone number already exists." },
          { status: 409 }
        );
      }
    }

    // Resolve referrer if a referral code was provided
    let referrerId: string | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Generate unique referral code
    let newReferralCode: string;
    let codeExists = true;
    do {
      newReferralCode = generateReferralCode();
      const existing = await prisma.user.findUnique({
        where: { referralCode: newReferralCode },
        select: { id: true },
      });
      codeExists = !!existing;
    } while (codeExists);

    // Create user + wallet in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || undefined,
          password: hashedPassword,
          referralCode: newReferralCode,
          referredBy: referrerId ?? undefined,
          studentId: studentId || undefined,
          university: university || undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          referralCode: true,
          studentId: true,
          university: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Create wallet
      await tx.wallet.create({
        data: { userId: newUser.id },
      });

      // Record referral relationship
      if (referrerId) {
        await tx.referral.create({
          data: {
            userId: referrerId,
            referredUserId: newUser.id,
            status: "pending",
            rewardAmount: 5.0,
          },
        });
      }

      return newUser;
    });

    // Send welcome email (non-blocking)
    try {
      await getResend().emails.send({
        from: "StudentExpress Georgia <noreply@studentexpress.ge>",
        to: email,
        subject: "Welcome to StudentExpress Georgia! 🎉",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                <div style="background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%); padding: 40px 32px; text-align: center;">
                  <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700;">StudentExpress Georgia</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Your campus delivery companion 🚀</p>
                </div>
                <div style="padding: 40px 32px;">
                  <h2 style="color: #111; font-size: 22px; margin: 0 0 16px;">Welcome, ${name}! 👋</h2>
                  <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    Your account has been created successfully. You're now part of the StudentExpress Georgia community — where fast, affordable delivery meets student life.
                  </p>
                  <div style="background: #FFF7F0; border: 1px solid #FFD9B3; border-radius: 8px; padding: 20px; margin: 0 0 28px;">
                    <p style="color: #FF6B00; font-size: 14px; font-weight: 600; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Your Referral Code</p>
                    <p style="color: #111; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 3px;">${newReferralCode}</p>
                    <p style="color: #777; font-size: 13px; margin: 8px 0 0;">Share this code with friends and earn ₾5 for each referral!</p>
                  </div>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://studentexpress.ge"}/dashboard"
                     style="display: inline-block; background: #FF6B00; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                    Start Ordering →
                  </a>
                </div>
                <div style="background: #f5f5f5; padding: 24px 32px; text-align: center;">
                  <p style="color: #999; font-size: 13px; margin: 0;">© 2025 StudentExpress Georgia. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      // Non-fatal — log but don't fail the registration
      console.error("[Register] Failed to send welcome email:", emailError);
    }

    return NextResponse.json(
      {
        message: "Account created successfully! Welcome to StudentExpress Georgia.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
