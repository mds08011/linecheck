import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

function collectTests(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collectTests(path) : [path];
    })
    .filter((path) => path.endsWith(".test.mjs"))
    .sort();
}

if (!existsSync("tests")) {
  console.error("No tests directory found. Add tests under tests/unit or tests/integration.");
  process.exit(1);
}

const tests = collectTests("tests");
if (tests.length === 0) {
  console.error("No test files found.");
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...tests], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
