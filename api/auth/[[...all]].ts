import type { IncomingMessage, ServerResponse } from "node:http";
import { toNodeHandler } from "better-auth/node";
import { ensureAuthMigrations, getAuth } from "../../server/auth.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "", "http://localhost");

  // Make the base path clickable in browsers and compatible with dashboards
  // that probe the base URL.
  if (req.method === "GET" && (url.pathname === "/api/auth" || url.pathname === "/api/auth/")) {
    json(res, 200, { ok: true });
    return;
  }

  await ensureAuthMigrations();
  return toNodeHandler(getAuth())(req, res);
}

