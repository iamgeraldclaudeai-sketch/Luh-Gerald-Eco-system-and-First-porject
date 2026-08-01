import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, ensureSchema } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { missingAuthEnvVars, authConfigErrorResponse } from "@/lib/authConfig";

export async function POST(req: NextRequest) {
  const missing = missingAuthEnvVars();
  if (missing.length > 0) {
    return NextResponse.json(authConfigErrorResponse(missing), { status: 500 });
  }

  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const token = String(body.token ?? "");
  const password = String(body.password ?? "");

  if (!token) {
    return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  try {
    await ensureSchema();
    const client = sql();

    const rows = await client`
      SELECT id, email, email_verified FROM users
      WHERE reset_token = ${token} AND reset_token_expires > now()
    `;
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const { id, email, email_verified: emailVerifiedRaw } = rows[0] as {
      id: number;
      email: string;
      email_verified: boolean;
    };
    const emailVerified = Boolean(emailVerifiedRaw);
    const passwordHash = await bcrypt.hash(password, 10);

    await client`
      UPDATE users
      SET password_hash = ${passwordHash}, reset_token = NULL, reset_token_expires = NULL
      WHERE id = ${id}
    `;

    const sessionToken = await createSessionToken({ email, emailVerified });
    const res = NextResponse.json({ user: { email, emailVerified } });
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions);
    return res;
  } catch (err) {
    console.error("reset-password error", err);
    return NextResponse.json(
      { error: "Something went wrong. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
}
