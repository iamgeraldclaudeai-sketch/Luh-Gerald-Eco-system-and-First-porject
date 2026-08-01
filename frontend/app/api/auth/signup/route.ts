import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, ensureSchema } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { missingAuthEnvVars, authConfigErrorResponse } from "@/lib/authConfig";
import { generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const missing = missingAuthEnvVars();
  if (missing.length > 0) {
    return NextResponse.json(authConfigErrorResponse(missing), { status: 500 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
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

    const existing = await client`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();
    const verificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS).toISOString();

    await client`
      INSERT INTO users (email, password_hash, verification_token, verification_token_expires)
      VALUES (${email}, ${passwordHash}, ${verificationToken}, ${verificationExpires})
    `;

    sendVerificationEmail(email, verificationToken, req.nextUrl.origin).catch((err) =>
      console.error("failed to send verification email", err)
    );

    const token = await createSessionToken({ email, emailVerified: false });
    const res = NextResponse.json({ user: { email, emailVerified: false } });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json(
      { error: "Something went wrong creating your account. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
}
