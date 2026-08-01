import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const loginUrl = new URL("/login", req.nextUrl.origin);

  if (!token) {
    loginUrl.searchParams.set("verified", "0");
    return NextResponse.redirect(loginUrl);
  }

  try {
    await ensureSchema();
    const client = sql();

    const rows = await client`
      SELECT id FROM users
      WHERE verification_token = ${token}
        AND verification_token_expires > now()
    `;

    if (rows.length === 0) {
      loginUrl.searchParams.set("verified", "0");
      return NextResponse.redirect(loginUrl);
    }

    await client`
      UPDATE users
      SET email_verified = true, verification_token = NULL, verification_token_expires = NULL
      WHERE id = ${rows[0].id}
    `;

    loginUrl.searchParams.set("verified", "1");
    return NextResponse.redirect(loginUrl);
  } catch (err) {
    console.error("verify error", err);
    loginUrl.searchParams.set("verified", "0");
    return NextResponse.redirect(loginUrl);
  }
}
