#!/usr/bin/env node
/**
 * Zero-setup runner for the Playwright E2E harness (scripts/run-playwright-e2e.py).
 *
 * WHY THIS EXISTS. `npm run test:e2e` used to call `python3 scripts/run-playwright-e2e.py`
 * directly and assumed the `playwright` Python package was already on the system interpreter.
 * On a fresh checkout it was not, so the hard-fail E2E check could not run at all (found
 * 23 Sep 2026 on the Mac that runs automated site jobs). This script owns the dependency:
 *
 *   1. creates a repo-local virtualenv at .venv/ (gitignored) if missing
 *   2. installs the pinned requirements from requirements-e2e.txt
 *   3. installs the Chromium build Playwright expects (`python -m playwright install chromium`)
 *   4. runs the harness with the venv's interpreter
 *
 * Steps 2-3 run once per requirements change; a stamp file in .venv/ records the hash of
 * requirements-e2e.txt that was last installed, so repeat runs go straight to step 4.
 * Nothing is installed into the system Python and nothing needs sudo.
 *
 * Overrides:
 *   E2E_PYTHON=/path/to/python3   interpreter used to create the venv (default: python3 on PATH)
 *   E2E_INSTALL_DEPS=1            pass --with-deps to `playwright install` so Chromium's OS
 *                                 libraries are installed too (Linux CI runners; needs sudo apt)
 *   CHROMIUM_PATH=/path/to/chrome use a specific browser binary (read by the harness itself)
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VENV = join(ROOT, ".venv");
const REQUIREMENTS = join(ROOT, "requirements-e2e.txt");
const STAMP = join(VENV, ".e2e-requirements.sha256");
const HARNESS = join(ROOT, "scripts", "run-playwright-e2e.py");
const VENV_PYTHON = process.platform === "win32"
  ? join(VENV, "Scripts", "python.exe")
  : join(VENV, "bin", "python");

function run(cmd, args, label) {
  const result = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
  if (result.error) {
    console.error(`e2e: ${label} failed to start: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`e2e: ${label} exited with status ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

function requirementsHash() {
  if (!existsSync(REQUIREMENTS)) {
    console.error(`e2e: missing ${REQUIREMENTS}; it pins the Python playwright package.`);
    process.exit(1);
  }
  return createHash("sha256").update(readFileSync(REQUIREMENTS)).digest("hex");
}

function ensureVenv() {
  if (existsSync(VENV_PYTHON)) return;
  const bootstrapPython = process.env.E2E_PYTHON || "python3";
  console.log(`e2e: creating virtualenv at .venv/ with ${bootstrapPython}`);
  run(bootstrapPython, ["-m", "venv", VENV], "python -m venv");
  if (!existsSync(VENV_PYTHON)) {
    console.error(`e2e: venv created but ${VENV_PYTHON} is missing`);
    process.exit(1);
  }
}

function ensureDependencies() {
  const wanted = requirementsHash();
  const have = existsSync(STAMP) ? readFileSync(STAMP, "utf8").trim() : "";
  if (have === wanted) return;
  console.log("e2e: installing pinned requirements from requirements-e2e.txt");
  run(VENV_PYTHON, ["-m", "pip", "install", "--quiet", "--disable-pip-version-check", "-r", REQUIREMENTS], "pip install");
  const installArgs = ["-m", "playwright", "install"];
  if (process.env.E2E_INSTALL_DEPS === "1") installArgs.push("--with-deps");
  installArgs.push("chromium");
  console.log(`e2e: installing Playwright's Chromium build${installArgs.includes("--with-deps") ? " and its OS libraries" : ""}`);
  run(VENV_PYTHON, installArgs, "playwright install chromium");
  mkdirSync(dirname(STAMP), { recursive: true });
  writeFileSync(STAMP, `${wanted}\n`);
}

ensureVenv();
ensureDependencies();
run(VENV_PYTHON, [HARNESS], "Playwright E2E harness");
