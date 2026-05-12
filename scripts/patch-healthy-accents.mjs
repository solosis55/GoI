/**
 * Añade utilidades `healthy:*` junto a `light:*` con ámbar/amarillo/dorado explícito
 * para que en data-theme=healthy prevalezca el verde (Tailwind: orden de utilidades).
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "src");

/** Orden: patrones más largos primero */
const RULES = [
  [/light:before:bg-yellow-950\/40(?!\s+healthy:)/g, "light:before:bg-yellow-950/40 healthy:before:bg-emerald-900/38"],
  [/light:before:bg-yellow-950\/50(?!\s+healthy:)/g, "light:before:bg-yellow-950/50 healthy:before:bg-emerald-900/45"],

  [/light:hover:border-amber-400\/60(?!\s+healthy:)/g, "light:hover:border-amber-400/60 healthy:hover:border-emerald-400/60"],
  [/light:hover:border-amber-400\/55(?!\s+healthy:)/g, "light:hover:border-amber-400/55 healthy:hover:border-emerald-400/55"],
  [/light:hover:border-amber-400\/50(?!\s+healthy:)/g, "light:hover:border-amber-400/50 healthy:hover:border-emerald-400/50"],
  [/light:hover:border-amber-400\/45(?!\s+healthy:)/g, "light:hover:border-amber-400/45 healthy:hover:border-emerald-400/45"],
  [/light:hover:border-amber-400\/40(?!\s+healthy:)/g, "light:hover:border-amber-400/40 healthy:hover:border-emerald-400/40"],
  [/light:hover:border-amber-400\/35(?!\s+healthy:)/g, "light:hover:border-amber-400/35 healthy:hover:border-emerald-400/35"],
  [/light:hover:bg-amber-50\/90(?!\s+healthy:)/g, "light:hover:bg-amber-50/90 healthy:hover:bg-emerald-50/90"],
  [/light:hover:bg-amber-100\/90(?!\s+healthy:)/g, "light:hover:bg-amber-100/90 healthy:hover:bg-emerald-100/90"],
  [/light:hover:bg-amber-100\/80(?!\s+healthy:)/g, "light:hover:bg-amber-100/80 healthy:hover:bg-emerald-100/80"],
  [/light:hover:text-amber-950(?!\s+healthy:)/g, "light:hover:text-amber-950 healthy:hover:text-emerald-950"],
  [/light:hover:text-amber-900(?!\s+healthy:)/g, "light:hover:text-amber-900 healthy:hover:text-emerald-900"],
  [/light:hover:text-amber-800(?!\s+healthy:)/g, "light:hover:text-amber-800 healthy:hover:text-emerald-800"],
  [/light:hover:text-amber-700(?!\s+healthy:)/g, "light:hover:text-amber-700 healthy:hover:text-emerald-700"],

  [/light:border-l-amber-400\/35(?!\s+healthy:)/g, "light:border-l-amber-400/35 healthy:border-l-emerald-400/35"],
  [/light:border-amber-600\/40(?!\s+healthy:)/g, "light:border-amber-600/40 healthy:border-emerald-600/40"],
  [/light:border-amber-600\/35(?!\s+healthy:)/g, "light:border-amber-600/35 healthy:border-emerald-600/35"],
  [/light:border-amber-500\/70(?!\s+healthy:)/g, "light:border-amber-500/70 healthy:border-emerald-500/70"],
  [/light:border-amber-500\/50(?!\s+healthy:)/g, "light:border-amber-500/50 healthy:border-emerald-500/50"],
  [/light:border-amber-500\/35(?!\s+healthy:)/g, "light:border-amber-500/35 healthy:border-emerald-500/35"],
  [/light:border-amber-400\/55(?!\s+healthy:)/g, "light:border-amber-400/55 healthy:border-emerald-400/55"],
  [/light:border-amber-400\/45(?!\s+healthy:)/g, "light:border-amber-400/45 healthy:border-emerald-400/45"],
  [/light:border-amber-400\/40(?!\s+healthy:)/g, "light:border-amber-400/40 healthy:border-emerald-400/40"],
  [/light:border-amber-400\/35(?!\s+healthy:)/g, "light:border-amber-400/35 healthy:border-emerald-400/35"],
  [/light:border-amber-400\/30(?!\s+healthy:)/g, "light:border-amber-400/30 healthy:border-emerald-400/30"],
  [/light:border-amber-300(?!\s+healthy:)/g, "light:border-amber-300 healthy:border-emerald-300"],
  [/light:border-amber-200\/70(?!\s+healthy:)/g, "light:border-amber-200/70 healthy:border-emerald-200/70"],
  [/light:border-amber-200\/60(?!\s+healthy:)/g, "light:border-amber-200/60 healthy:border-emerald-200/60"],
  [/light:border-amber-200(?!\s+healthy:)/g, "light:border-amber-200 healthy:border-emerald-200"],

  [/light:bg-amber-100\/95(?!\s+healthy:)/g, "light:bg-amber-100/95 healthy:bg-emerald-100/95"],
  [/light:bg-amber-100\/90(?!\s+healthy:)/g, "light:bg-amber-100/90 healthy:bg-emerald-100/90"],
  [/light:bg-amber-100\/85(?!\s+healthy:)/g, "light:bg-amber-100/85 healthy:bg-emerald-100/85"],
  [/light:bg-amber-100\/80(?!\s+healthy:)/g, "light:bg-amber-100/80 healthy:bg-emerald-100/80"],
  [/light:bg-amber-100\/75(?!\s+healthy:)/g, "light:bg-amber-100/75 healthy:bg-emerald-100/75"],
  [/light:bg-amber-50\/92(?!\s+healthy:)/g, "light:bg-amber-50/92 healthy:bg-emerald-50/92"],
  [/light:bg-amber-50\/90(?!\s+healthy:)/g, "light:bg-amber-50/90 healthy:bg-emerald-50/90"],
  [/light:bg-amber-50\/80(?!\s+healthy:)/g, "light:bg-amber-50/80 healthy:bg-emerald-50/80"],
  [/light:bg-amber-50(?!\s+healthy:)/g, "light:bg-amber-50 healthy:bg-emerald-50"],
  [/light:bg-amber-100(?!\s+healthy:)/g, "light:bg-amber-100 healthy:bg-emerald-100"],
  [/light:bg-amber-400\/\[0\.14\](?!\s+healthy:)/g, "light:bg-amber-400/[0.14] healthy:bg-emerald-400/[0.14]"],
  [/light:bg-amber-400\/14(?!\s+healthy:)/g, "light:bg-amber-400/14 healthy:bg-emerald-400/14"],
  [/light:bg-amber-400\/12(?!\s+healthy:)/g, "light:bg-amber-400/12 healthy:bg-emerald-400/12"],
  [/light:bg-amber-400\/\[0\.085\](?!\s+healthy:)/g, "light:bg-amber-400/[0.085] healthy:bg-emerald-400/[0.085]"],

  [/light:sm:bg-amber-50\/90(?!\s+healthy:)/g, "light:sm:bg-amber-50/90 healthy:sm:bg-emerald-50/90"],

  [/light:from-amber-500\/90(?!\s+healthy:)/g, "light:from-amber-500/90 healthy:from-emerald-500/90"],
  [/light:via-amber-400\/45(?!\s+healthy:)/g, "light:via-amber-400/45 healthy:via-emerald-400/45"],
  [/light:from-amber-500(?!\s+healthy:)/g, "light:from-amber-500 healthy:from-emerald-500"],
  [/light:via-amber-600(?!\s+healthy:)/g, "light:via-amber-600 healthy:via-emerald-600"],
  [/light:to-amber-500\/70(?!\s+healthy:)/g, "light:to-amber-500/70 healthy:to-emerald-500/70"],
  [/light:from-amber-600(?!\s+healthy:)/g, "light:from-amber-600 healthy:from-emerald-600"],
  [/light:via-amber-500(?!\s+healthy:)/g, "light:via-amber-500 healthy:via-emerald-500"],
  [/light:to-amber-600(?!\s+healthy:)/g, "light:to-amber-600 healthy:to-emerald-600"],
  [/light:from-amber-200\/50(?!\s+healthy:)/g, "light:from-amber-200/50 healthy:from-emerald-200/50"],
  [/light:from-amber-200\/40(?!\s+healthy:)/g, "light:from-amber-200/40 healthy:from-emerald-200/40"],
  [/light:from-amber-100\/50(?!\s+healthy:)/g, "light:from-amber-100/50 healthy:from-emerald-100/50"],
  [/light:from-amber-50\/80(?!\s+healthy:)/g, "light:from-amber-50/80 healthy:from-emerald-50/80"],

  [/light:ring-amber-500\/35(?!\s+healthy:)/g, "light:ring-amber-500/35 healthy:ring-emerald-500/35"],
  [/light:ring-amber-500\/50(?!\s+healthy:)/g, "light:ring-amber-500/50 healthy:ring-emerald-500/50"],
  [/light:ring-amber-400\/40(?!\s+healthy:)/g, "light:ring-amber-400/40 healthy:ring-emerald-400/40"],
  [/light:ring-amber-400\/35(?!\s+healthy:)/g, "light:ring-amber-400/35 healthy:ring-emerald-400/35"],
  [/light:ring-amber-400\/20(?!\s+healthy:)/g, "light:ring-amber-400/20 healthy:ring-emerald-400/20"],

  [/light:stroke-amber-700\/80(?!\s+healthy:)/g, "light:stroke-amber-700/80 healthy:stroke-emerald-700/80"],
  [/light:stroke-amber-700(?!\s+healthy:)/g, "light:stroke-amber-700 healthy:stroke-emerald-700"],
  [/light:stroke-amber-800\/75(?!\s+healthy:)/g, "light:stroke-amber-800/75 healthy:stroke-emerald-800/75"],

  [/light:fill-amber-200\/50(?!\s+healthy:)/g, "light:fill-amber-200/50 healthy:fill-emerald-200/50"],
  [/light:fill-amber-200\/45(?!\s+healthy:)/g, "light:fill-amber-200/45 healthy:fill-emerald-200/45"],
  [/light:fill-amber-600(?!\s+healthy:)/g, "light:fill-amber-600 healthy:fill-emerald-600"],
  [/light:fill-amber-800(?!\s+healthy:)/g, "light:fill-amber-800 healthy:fill-emerald-800"],

  [/light:text-amber-950(?!\s+healthy:)/g, "light:text-amber-950 healthy:text-emerald-950"],
  [/light:text-amber-900(?!\s+healthy:)/g, "light:text-amber-900 healthy:text-emerald-900"],
  [/light:text-amber-800(?!\s+healthy:)/g, "light:text-amber-800 healthy:text-emerald-800"],
  [/light:text-amber-700(?!\s+healthy:)/g, "light:text-amber-700 healthy:text-emerald-700"],
  [/light:text-yellow-950(?!\s+healthy:)/g, "light:text-yellow-950 healthy:text-emerald-950"],

  [/light:border-amber-800\/22(?!\s+healthy:)/g, "light:border-amber-800/22 healthy:border-emerald-800/22"],
  [/light:border-amber-700\/28(?!\s+healthy:)/g, "light:border-amber-700/28 healthy:border-emerald-700/28"],
  [/light:to-\[#c49a1a\](?!\s+healthy:)/g, "light:to-[#c49a1a] healthy:to-[#5d9270]"],

  [
    /light:shadow-\[inset_0_1px_0_0_rgba\(255,255,255,0\.28\),0_1px_3px_rgba\(139,98,16,0\.12\)\](?!\s+healthy:)/g,
    "light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_1px_3px_rgba(139,98,16,0.12)] healthy:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_1px_3px_rgba(45,120,90,0.12)]",
  ],
  [
    /light:hover:shadow-\[inset_0_1px_0_0_rgba\(255,255,255,0\.32\),0_2px_6px_-2px_rgba\(196,154,26,0\.18\)\](?!\s+healthy:)/g,
    "light:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.32),0_2px_6px_-2px_rgba(196,154,26,0.18)] healthy:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.32),0_2px_6px_-2px_rgba(45,120,90,0.2)]",
  ],
  [
    /light:shadow-\[inset_0_1px_0_0_rgba\(255,255,255,0\.28\),0_1px_2px_rgba\(196,154,26,0\.14\)\](?!\s+healthy:)/g,
    "light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_1px_2px_rgba(196,154,26,0.14)] healthy:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_1px_2px_rgba(45,120,90,0.14)]",
  ],
  [
    /light:shadow-\[0_18px_44px_-26px_rgba\(245,158,11,0\.18\)\](?!\s+healthy:)/g,
    "light:shadow-[0_18px_44px_-26px_rgba(245,158,11,0.18)] healthy:shadow-[0_18px_44px_-26px_rgba(16,185,129,0.16)]",
  ],
  [
    /light:shadow-\[0_1px_10px_-4px_rgba\(217,119,6,0\.25\)\](?!\s+healthy:)/g,
    "light:shadow-[0_1px_10px_-4px_rgba(217,119,6,0.25)] healthy:shadow-[0_1px_10px_-4px_rgba(16,185,129,0.22)]",
  ],
  [
    /light:shadow-\[0_0_6px_rgba\(196,154,26,0\.25\)\](?!\s+healthy:)/g,
    "light:shadow-[0_0_6px_rgba(196,154,26,0.25)] healthy:shadow-[0_0_6px_rgba(45,120,90,0.28)]",
  ],

  [/light:from-amber-700(?!\s+healthy:)/g, "light:from-amber-700 healthy:from-emerald-700"],
  [/light:to-amber-500(?!\s+healthy:)/g, "light:to-amber-500 healthy:to-emerald-500"],

  [/light:border-amber-600(?!\s+healthy:)/g, "light:border-amber-600 healthy:border-emerald-600"],
  [/light:border-t-amber-200\/80(?!\s+healthy:)/g, "light:border-t-amber-200/80 healthy:border-t-emerald-200/80"],

  [/light:hover:bg-amber-100\/90(?!\s+healthy:)/g, "light:hover:bg-amber-100/90 healthy:hover:bg-emerald-100/90"],
  [/light:hover:bg-amber-50\/80(?!\s+healthy:)/g, "light:hover:bg-amber-50/80 healthy:hover:bg-emerald-50/80"],

  [/light:text-amber-100\/95(?!\s+healthy:)/g, "light:text-amber-100/95 healthy:text-emerald-950/95"],

  [/light:ring-amber-400\/55(?!\s+healthy:)/g, "light:ring-amber-400/55 healthy:ring-emerald-400/55"],
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts|css)$/.test(p)) acc.push(p);
  }
  return acc;
}

function patchContent(content) {
  let s = content;
  for (const [re, rep] of RULES) {
    s = s.replace(re, rep);
  }
  return s;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const before = readFileSync(file, "utf8");
  const after = patchContent(before);
  if (after !== before) {
    writeFileSync(file, after, "utf8");
    changed++;
    console.log("patched:", file);
  }
}
console.log(`Done. ${changed} files updated.`);
