import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { missingAuthEnvVars, authConfigErrorResponse } from "@/lib/authConfig";
import { generateToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const GENERIC_MESSAGE = "If an account exists for that email, a reset link has been sent.";

export async function POST(req: NextRequest) {
  const missing = missingAuthEnvVars();
  if (missing.length > 0) {
    return NextResponse.json(authConfigErrorResponse(missing), { status: 500 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const client = sql();

    const rows = await client`SELECT id FROM users WHERE email = ${email}`;
    if (rows.length > 0) {
      const resetToken = generateToken();
      const resetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
      await client`
        UPDATE users
        SET reset_token = ${resetToken}, reset_token_expires = ${resetExpires}
        WHERE id = ${rows[0].id}
      `;
      sendPasswordResetEmail(email, resetToken, req.nextUrl.origin).catch((err) =>
        console.error("failed to send password reset email", err)
      );
    }

    // Always return the same message, whether or not the account exists,
    // so this endpoint can't be used to check which emails are registered.
    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (err) {
    console.error("request-password-reset error", err);
    return NextResponse.json(
      { error: "Something went wrong. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
}
