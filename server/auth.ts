import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { Pool } from "pg";

type Auth = ReturnType<typeof betterAuth>;

let authInstance: Auth | null = null;
let migrated: Promise<void> | null = null;

function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error(
      "DATABASE_URL is required. Use the Supabase Postgres pooler URL (postgresql://...).",
    );
  }

  const url = new URL(raw);
  const projectRef = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)?.[1];
  if (!projectRef) return raw;

  // Vercel cannot reach the direct IPv6 database host. Session-mode pooler is IPv4
  // and still allows the prepared statements Better Auth uses.
  url.username = `postgres.${projectRef}`;
  url.hostname = "aws-0-ap-southeast-1.pooler.supabase.com";
  url.port = "5432";
  return url.toString();
}

export function getAuth() {
  if (authInstance) return authInstance;

  const baseURL = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  const basePath = process.env.BETTER_AUTH_PATH || process.env.BETTER_AUTH_APTH || "/api/auth";
  const serverless = process.env.VERCEL === "1";

  authInstance = betterAuth({
    database: new Pool({
      connectionString: databaseUrl(),
      max: serverless ? 1 : 5,
      idleTimeoutMillis: serverless ? 5_000 : 30_000,
      ssl: { rejectUnauthorized: false },
    }),
    baseURL,
    basePath,
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: [
      baseURL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://preipokart.com",
      "https://www.preipokart.com",
    ],
    plugins: [
      dash({
        apiKey: process.env.BETTER_AUTH_API_KEY,
      }),
    ],
  });

  return authInstance;
}

export function ensureAuthMigrations() {
  const auth = getAuth();
  migrated ??= getMigrations(auth.options).then(({ runMigrations }) => runMigrations());
  return migrated;
}
