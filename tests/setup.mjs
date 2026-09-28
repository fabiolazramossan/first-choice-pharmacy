// Lets tests import app modules that use the "@/..." path alias (tsconfig
// "paths") by resolving them to the matching .ts/.tsx file. Test-only.
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
      import { existsSync } from "node:fs";
      import { pathToFileURL, fileURLToPath } from "node:url";
      const root = ${JSON.stringify(new URL("..", import.meta.url).href)};
      export async function resolve(specifier, context, next) {
        if (specifier.startsWith("@/")) {
          const base = fileURLToPath(new URL(specifier.slice(2), root));
          for (const ext of [".ts", ".tsx", "/index.ts"]) {
            if (existsSync(base + ext)) return next(pathToFileURL(base + ext).href, context);
          }
        }
        return next(specifier, context);
      }
    `)
);
