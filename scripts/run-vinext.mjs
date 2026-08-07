import { spawnSync } from "node:child_process";

const args = ["vinext", ...process.argv.slice(2)];
const env = {
  ...process.env,
  WRANGLER_LOG_PATH: process.env.WRANGLER_LOG_PATH ?? ".wrangler/wrangler.log",
};

const result =
  process.platform === "win32"
    ? spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", `npx ${args.join(" ")}`], {
        stdio: "inherit",
        env,
      })
    : spawnSync("npx", args, {
        stdio: "inherit",
        env,
      });

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
