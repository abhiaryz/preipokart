import type { IncomingMessage, ServerResponse } from "node:http";
import { toNodeHandler } from "better-auth/node";
import { ensureAuthMigrations, getAuth } from "../../server/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureAuthMigrations();
  return toNodeHandler(getAuth())(req, res);
}
