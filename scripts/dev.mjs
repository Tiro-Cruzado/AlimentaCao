// Local development: starts the site (next dev) and, next to it, keeps the
// content from Sanity up to date (scripts/sync-content.mjs --watch).
//
//   npm run dev
//
// Without SANITY_PROJECT_ID in .env.local the watcher just says so and stops;
// the site runs with the sample content.

import { spawn } from "node:child_process";

const next = spawn("npx", ["next", "dev", ...process.argv.slice(2)], { stdio: "inherit" });
const sync = spawn(process.execPath, ["scripts/sync-content.mjs", "--watch"], { stdio: "inherit" });

const stop = () => {
  sync.kill();
  next.kill();
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

next.on("exit", (code) => {
  sync.kill();
  process.exit(code ?? 0);
});
