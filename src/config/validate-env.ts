/**
 * Validate required environment variables at startup. Exits process with code 1 if any are missing.
 */
const REQUIRED = [
  "MONGO_URI",
  "JWT_SECRET",
  "API_KEY",
  "CORS_ORIGINS",
] as const;

export function validateEnv(): void {
  const missing = REQUIRED.filter(
    (key) => !process.env[key] || String(process.env[key]).trim() === "",
  );
  if (missing.length > 0) {
    console.error(
      "Missing required environment variables:",
      missing.join(", "),
    );
    process.exit(1);
  }
}
