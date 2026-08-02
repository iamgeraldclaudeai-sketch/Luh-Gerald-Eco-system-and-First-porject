import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkDatabase, checkSessionSecret } from "./health";

describe("checkSessionSecret", () => {
  const original = process.env.SESSION_SECRET;

  afterEach(() => {
    if (original === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = original;
  });

  it("reports ok: true when SESSION_SECRET is set", () => {
    process.env.SESSION_SECRET = "some-secret";
    expect(checkSessionSecret()).toEqual({ ok: true });
  });

  it("reports ok: false when SESSION_SECRET is missing", () => {
    delete process.env.SESSION_SECRET;
    expect(checkSessionSecret()).toEqual({ ok: false });
  });
});

describe("checkDatabase", () => {
  const originalPostgresUrl = process.env.POSTGRES_URL;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    delete process.env.POSTGRES_URL;
    delete process.env.DATABASE_URL;
  });

  afterEach(() => {
    if (originalPostgresUrl === undefined) delete process.env.POSTGRES_URL;
    else process.env.POSTGRES_URL = originalPostgresUrl;
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it("reports ok: false with a clear error when no connection string is configured", async () => {
    const result = await checkDatabase();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/No database connection string found/);
  });
});
