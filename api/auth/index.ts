import type { IncomingMessage, ServerResponse } from "node:http";
import { toNodeHandler } from "better-auth/node";
import { ensureAuthMigrations, getAuth } from "../../server/auth.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

// `api/auth/[...all].ts` matches `/api/auth/*`, but not `/api/auth`.
// Better Auth dashboards (and humans clicking the URL) often hit the base path,
// so we forward `/api/auth` to the same handler.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureAuthMigrations();
  return toNodeHandler(getAuth())(req, res);
}

