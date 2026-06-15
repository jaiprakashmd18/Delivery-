import { Resend } from "resend";

// Lazy-initialize so missing key during build doesn't throw
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
  }
  return _resend;
}

export const FROM_EMAIL = "StudentExpress Georgia <noreply@studentexpress.ge>";

// ─── Order Confirmation ───────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationDetails {
  orderNumber: string;
  items: OrderItem[];
  total: number;
  estimatedTime: string;
  restaurantName: string;
}

export async function sendOrderConfirmation(
  to: string,
  orderDetails: OrderConfirmationDetails
): Promise<void> {
  const { orderNumber, items, total, estimatedTime, restaurantName } =
    orderDetails;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #374151; font-size: 14px;">
          ${item.name} × ${item.quantity}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #374151; font-size: 14px; text-align: right;">
          ₾${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>შეკვეთის დადასტურება</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">StudentExpress</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Georgia</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:600;">შეკვეთა დადასტურდა! ✓</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">თქვენი შეკვეთა მიღებულია და მუშავდება.</p>

              <!-- Order badge -->
              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin-bottom:28px;">
                <p style="margin:0 0 4px;color:#9a3412;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">შეკვეთის ნომერი</p>
                <p style="margin:0;color:#ea580c;font-size:22px;font-weight:700;letter-spacing:1px;">${orderNumber}</p>
              </div>

              <p style="margin:0 0 6px;color:#374151;font-size:14px;"><strong>რესტორანი:</strong> ${restaurantName}</p>
              <p style="margin:0 0 20px;color:#374151;font-size:14px;"><strong>სავარაუდო მიტანის დრო:</strong> ${estimatedTime}</p>

              <!-- Items table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <th style="text-align:left;padding:0 0 8px;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">პროდუქტი</th>
                  <th style="text-align:right;padding:0 0 8px;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e5e7eb;">ფასი</th>
                </tr>
                ${itemRows}
                <tr>
                  <td style="padding:16px 0 0;color:#111827;font-size:16px;font-weight:700;">სულ ჯამი</td>
                  <td style="padding:16px 0 0;color:#ea580c;font-size:16px;font-weight:700;text-align:right;">₾${total.toFixed(2)}</td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
                შეკვეთის სტატუსს შეგიძლიათ თვალი ადევნოთ <strong>StudentExpress Georgia</strong> აპლიკაციაში.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} StudentExpress Georgia. ყველა უფლება დაცულია.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `შეკვეთა #${orderNumber} დადასტურებულია — StudentExpress Georgia`,
    html,
  });
}

// ─── Welcome Email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>მოგესალმებით StudentExpress Georgia-ში</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;">StudentExpress</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Georgia</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:24px;font-weight:600;">გამარჯობა, ${name}! 👋</h2>
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
                მოგესალმებით <strong>StudentExpress Georgia</strong>-ში! ჩვენ გახარებულნი ვართ, რომ თქვენ გახდით ჩვენი პლატფორმის ნაწილი.
              </p>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
                ახლა შეგიძლიათ:
              </p>
              <ul style="margin:0 0 24px;padding:0 0 0 20px;color:#374151;font-size:15px;line-height:2;">
                <li>შეუკვეთოთ საკვები საუკეთესო რესტორნებიდან</li>
                <li>გამოიყენოთ გამოქვეყნებული სპეციალური სტუდენტური ფასდაკლებები</li>
                <li>თვალი ადევნოთ თქვენს შეკვეთებს რეალურ დროში</li>
                <li>მიიღოთ ბონუსები მეგობრების მოწვევით</li>
              </ul>
              <div style="text-align:center;margin:32px 0;">
                <a href="https://studentexpress.ge" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">შეკვეთის დაწყება</a>
              </div>
              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                დახმარება გჭირდებათ? დაგვიკავშირდით: <a href="mailto:support@studentexpress.ge" style="color:#f97316;">support@studentexpress.ge</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} StudentExpress Georgia. ყველა უფლება დაცულია.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `მოგესალმებით StudentExpress Georgia-ში, ${name}!`,
    html,
  });
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordReset(
  to: string,
  resetLink: string
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>პაროლის აღდგენა</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">StudentExpress</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Georgia</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#fff7ed;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">🔒</div>
              </div>
              <h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:600;text-align:center;">პაროლის აღდგენა</h2>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;text-align:center;">
                მიღებულია პაროლის აღდგენის მოთხოვნა. დააჭირეთ ქვემოთ მოცემულ ღილაკს პაროლის შესაცვლელად.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetLink}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">პაროლის შეცვლა</a>
              </div>
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-top:24px;">
                <p style="margin:0;color:#991b1b;font-size:13px;line-height:1.6;">
                  ⚠️ ეს ბმული <strong>15 წუთის</strong> განმავლობაში იქნება ვალიდური. თუ თქვენ არ გაუგზავნიათ ეს მოთხოვნა, გთხოვთ, უგულებელყოთ ეს წერილი.
                </p>
              </div>
              <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
                ბმული არ მუშაობს? დააკოპირეთ და ჩასვით ბრაუზერში:<br/>
                <span style="color:#f97316;word-break:break-all;">${resetLink}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} StudentExpress Georgia. ყველა უფლება დაცულია.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "პაროლის აღდგენა — StudentExpress Georgia",
    html,
  });
}

// ─── OTP Email ────────────────────────────────────────────────────────────────

export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  const digits = otp.split("").map(
    (d) =>
      `<span style="display:inline-block;width:44px;height:52px;line-height:52px;text-align:center;background:#fff7ed;border:2px solid #fed7aa;border-radius:8px;font-size:24px;font-weight:700;color:#ea580c;margin:0 3px;">${d}</span>`
  );

  const html = `
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ვერიფიკაციის კოდი</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">StudentExpress</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Georgia</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;text-align:center;">
              <h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:600;">ვერიფიკაციის კოდი</h2>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                გამოიყენეთ ქვემოთ მოცემული ერთჯერადი კოდი. ის <strong>10 წუთის</strong> განმავლობაში არის ვალიდური.
              </p>
              <div style="margin:0 0 32px;">
                ${digits.join("")}
              </div>
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px;display:inline-block;">
                <p style="margin:0;color:#991b1b;font-size:13px;">
                  ⚠️ არასდროს გაუზიაროთ ეს კოდი სხვებს.
                </p>
              </div>
              <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">
                თუ თქვენ არ მოგითხოვიათ ეს კოდი, გთხოვთ, უგულებელყოთ ეს წერილი.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} StudentExpress Georgia. ყველა უფლება დაცულია.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${otp} — თქვენი StudentExpress ვერიფიკაციის კოდი`,
    html,
  });
}

// ─── Delivery Update ──────────────────────────────────────────────────────────

interface DeliveryUpdateDetails {
  orderNumber: string;
  status: string;
  message: string;
  estimatedTime?: string;
}

const STATUS_LABELS: Record<string, { label: string; icon: string; color: string }> =
  {
    PENDING: { label: "მიღებული", icon: "⏳", color: "#d97706" },
    ACCEPTED: { label: "დადასტურებული", icon: "✅", color: "#059669" },
    PREPARING: { label: "მზადდება", icon: "👨‍🍳", color: "#7c3aed" },
    PICKED_UP: { label: "გატანილია", icon: "🛵", color: "#2563eb" },
    OUT_FOR_DELIVERY: { label: "მიმტანი გზაშია", icon: "📍", color: "#f97316" },
    DELIVERED: { label: "მიტანილია", icon: "🎉", color: "#16a34a" },
    CANCELLED: { label: "გაუქმებულია", icon: "❌", color: "#dc2626" },
    REFUNDED: { label: "დაბრუნებულია", icon: "💰", color: "#0891b2" },
  };

export async function sendDeliveryUpdate(
  to: string,
  updateDetails: DeliveryUpdateDetails
): Promise<void> {
  const { orderNumber, status, message, estimatedTime } = updateDetails;
  const statusInfo = STATUS_LABELS[status] ?? {
    label: status,
    icon: "📦",
    color: "#6b7280",
  };

  const estimatedBlock = estimatedTime
    ? `<p style="margin:12px 0 0;color:#374151;font-size:14px;"><strong>სავარაუდო მიტანა:</strong> ${estimatedTime}</p>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>შეკვეთის განახლება</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">StudentExpress</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Georgia</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 20px;color:#111827;font-size:22px;font-weight:600;">შეკვეთის განახლება</h2>

              <div style="background:#f9fafb;border-radius:10px;padding:20px;margin-bottom:24px;border-left:4px solid ${statusInfo.color};">
                <p style="margin:0 0 6px;font-size:24px;">${statusInfo.icon}</p>
                <p style="margin:0 0 4px;color:${statusInfo.color};font-size:16px;font-weight:700;">${statusInfo.label}</p>
                <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${message}</p>
                ${estimatedBlock}
              </div>

              <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px;">
                <p style="margin:0;color:#9a3412;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">შეკვეთის ნომერი</p>
                <p style="margin:0;color:#ea580c;font-size:18px;font-weight:700;">${orderNumber}</p>
              </div>

              <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
                სრული ინფორმაციისთვის შედით <strong>StudentExpress Georgia</strong> აპლიკაციაში.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} StudentExpress Georgia. ყველა უფლება დაცულია.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `შეკვეთა #${orderNumber} — ${statusInfo.label}`,
    html,
  });
}
