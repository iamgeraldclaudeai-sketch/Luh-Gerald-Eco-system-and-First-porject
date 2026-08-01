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

  try {
    await ensureSchema();
    const client = sql();

    const rows = await client`
      SELECT password_hash, email_verified FROM users WHERE email = ${email}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "No account found with that email." }, { status: 401 });
    }

    const match = await bcrypt.compare(password, rows[0].password_hash as string);
    if (!match) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const emailVerified = Boolean(rows[0].email_verified);
    const token = await createSessionToken({ email, emailVerified });
    const res = NextResponse.json({ user: { email, emailVerified } });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json(
      { error: "Something went wrong signing you in. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
}
