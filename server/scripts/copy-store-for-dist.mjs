/**
 * Copia `server/data/store.json` a `server/dist/data/store.json` tras `tsc`
 * para que Vercel pueda empaquetarlo con `includeFiles: "server/dist/**"`.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const serverRoot = join(scriptDir, "..");
const src = join(serverRoot, "data", "store.json");
const dest = join(serverRoot, "dist", "data", "store.json");

if (!existsSync(src)) {
  console.warn("[copy-store-for-dist] omitido: no existe", src);
  process.exit(0);
}

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log("[copy-store-for-dist] copiado a", dest);
