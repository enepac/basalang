import { execSync } from "child_process";

console.log("🔎 Running prebuild integrity checks...");

try {
  execSync("pnpm lint", { stdio: "inherit" });
  execSync("tsc --noEmit", { stdio: "inherit" });
  console.log("✅ Prebuild checks passed.");
} catch (err) {
  console.error("❌ Prebuild checks failed.");
  process.exit(1);
}
