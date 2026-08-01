interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

function wrapTemplate(title: string, bodyHtml: string): string {
  return `
    <div style="background:#05030f;padding:32px;font-family:ui-monospace,monospace;color:#e9e4ff;">
      <div style="max-width:480px;margin:0 auto;border:1px solid rgba(168,85,247,0.4);border-radius:16px;padding:32px;background:#0b0620;">
        <p style="letter-spacing:0.3em;font-size:11px;color:#c084fc;margin:0 0 8px;">LUH GERALD ECO SYSTEM</p>
        <h1 style="font-size:20px;margin:0 0 16px;color:#ffffff;">${title}</h1>
        ${bodyHtml}
      </div>
    </div>
  `;
}

async function sendEmail({ to, subject, html }: SendEmailArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email:fallback] To: ${to}\nSubject: ${subject}\n${html}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Luh Gerald Eco System <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] Resend send failed (${res.status}): ${body}`);
  }
}

export async function sendVerificationEmail(
  to: string,
  token: string,
  origin: string
): Promise<void> {
  const link = `${origin}/api/auth/verify?token=${token}`;
  const html = wrapTemplate(
    "Confirm your email",
    `
      <p style="font-size:14px;color:#c7c2e0;line-height:1.6;">
        Click the button below to verify <strong>${to}</strong> and finish setting up your account.
      </p>
      <p style="margin:24px 0;">
        <a href="${link}" style="display:inline-block;background:#9333ea;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;">Verify email</a>
      </p>
      <p style="font-size:11px;color:#7a7492;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    `
  );
  await sendEmail({ to, subject: "Verify your email — Luh Gerald Eco System", html });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  origin: string
): Promise<void> {
  const link = `${origin}/reset-password?token=${token}`;
  const html = wrapTemplate(
    "Reset your password",
    `
      <p style="font-size:14px;color:#c7c2e0;line-height:1.6;">
        We received a request to reset the password for <strong>${to}</strong>.
      </p>
      <p style="margin:24px 0;">
        <a href="${link}" style="display:inline-block;background:#9333ea;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;">Reset password</a>
      </p>
      <p style="font-size:11px;color:#7a7492;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `
  );
  await sendEmail({ to, subject: "Reset your password — Luh Gerald Eco System", html });
}
