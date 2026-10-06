import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type Plugin } from "vite";
import { toNodeHandler } from "better-auth/node";
import { ensureAuthMigrations, getAuth } from "./auth";

function applyEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "BETTER_AUTH_API_KEY", "BETTER_AUTH_PATH", "BETTER_AUTH_APTH", "DATABASE_URL"] as const) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
}

export function betterAuthPlugin(): Plugin {
  let handler: ReturnType<typeof toNodeHandler> | null = null;
  let ready: Promise<void> | null = null;

  const prepare = async () => {
    if (!ready) {
      ready = ensureAuthMigrations().then(() => {
        handler = toNodeHandler(getAuth());
      });
    }
    await ready;
  };

  const mount = () => {
    return async (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
      const url = req.url ?? "";
      if (!url.startsWith("/api/auth")) {
        next();
        return;
      }
      try {
        await prepare();
        if (!handler) throw new Error("Better Auth handler failed to start");
        await handler(req, res);
      } catch (error) {
        next(error);
      }
    };
  };

  return {
    name: "better-auth",
    config(_config, { mode }) {
      applyEnv(mode);
    },
    configureServer(server) {
      server.middlewares.use(mount());
    },
    configurePreviewServer(server) {
      server.middlewares.use(mount());
    },
  };
}
