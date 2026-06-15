import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
}

const sendOtpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address").optional(),
    phone: z
      .string()
      .regex(
        /^(\+995|0)(5\d{8}|[23]\d{7})$/,
        "Please enter a valid Georgian phone number"
      )
      .optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
  });

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, phone } = parsed.data;
    const identifier = email ?? phone!;
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Rate limit: max 3 OTPs per 10 minutes per identifier
    const recentOtpCount = await prisma.oTPToken.count({
      where: {
        ...(email ? { email } : { phone: identifier }),
        createdAt: { gte: tenMinutesAgo },
        used: false,
      },
    });

    if (recentOtpCount >= 3) {
      return NextResponse.json(
        {
          error:
            "Too many OTP requests. Please wait 10 minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const token = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await prisma.oTPToken.create({
      data: {
        phone: phone ?? identifier,
        email: email ?? undefined,
        token,
        expires,
        used: false,
      },
    });

    if (email) {
      // Send via email using Resend
      try {
        await getResend().emails.send({
          from: "StudentExpress Georgia <noreply@studentexpress.ge>",
          to: email,
          subject: "Your StudentExpress OTP Code",
          html: `
            <!DOCTYPE html>
            <html>
              <head><meta charset="utf-8" /></head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
                <div style="max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                  <div style="background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%); padding: 32px; text-align: center;">
                    <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 700;">StudentExpress Georgia</h1>
                  </div>
                  <div style="padding: 40px 32px; text-align: center;">
                    <p style="color: #555; font-size: 16px; margin: 0 0 24px;">Your one-time verification code is:</p>
                    <div style="background: #FFF7F0; border: 2px solid #FF6B00; border-radius: 12px; padding: 24px; margin: 0 0 24px; display: inline-block; min-width: 200px;">
                      <p style="color: #FF6B00; font-size: 40px; font-weight: 800; margin: 0; letter-spacing: 8px;">${token}</p>
                    </div>
                    <p style="color: #888; font-size: 14px; margin: 0;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
                  </div>
                  <div style="background: #f5f5f5; padding: 20px 32px; text-align: center;">
                    <p style="color: #999; font-size: 12px; margin: 0;">If you didn't request this code, please ignore this email.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error("[SendOTP] Failed to send email OTP:", emailError);
        return NextResponse.json(
          { error: "Failed to send OTP email. Please try again." },
          { status: 500 }
        );
      }
    } else {
      // SMS: log to console (integrate with SMS provider later)
      console.log(
        `[SendOTP] SMS OTP for ${phone}: ${token} (expires: ${expires.toISOString()})`
      );
    }

    return NextResponse.json(
      {
        message: email
          ? "OTP sent to your email address."
          : "OTP sent to your phone number.",
        expiresAt: expires.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SendOTP] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
