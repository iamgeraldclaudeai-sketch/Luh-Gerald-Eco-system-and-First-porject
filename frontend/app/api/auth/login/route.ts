import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, ensureUsersTable } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
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
    await ensureUsersTable();
    const client = sql();

    const rows = await client`SELECT password_hash FROM users WHERE email = ${email}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "No account found with that email." }, { status: 401 });
    }

    const match = await bcrypt.compare(password, rows[0].password_hash as string);
    if (!match) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = await createSessionToken(email);
    const res = NextResponse.json({ user: { email } });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json(
      { error: "Server isn't configured for sign in yet. See DEPLOYMENT.md." },
      { status: 500 }
    );
  }
}
