export function missingAuthEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    missing.push("POSTGRES_URL or DATABASE_URL");
  }
  if (!process.env.SESSION_SECRET) {
    missing.push("SESSION_SECRET");
  }
  return missing;
}

export function authConfigErrorResponse(missing: string[]) {
  return {
    error: `Server is missing required environment variable(s): ${missing.join(", ")}. See DEPLOYMENT.md.`,
  };
}
