import { spawn } from "node:child_process";
import process from "node:process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const services = [
  {
    name: "backend",
    args: ["run", "dev", "--prefix", "backend"],
  },
  {
    name: "frontend",
    args: ["run", "dev", "--prefix", "frontend"],
  },
];

let isShuttingDown = false;

const children = services.map((service) => {
  const child = spawn(npmCommand, service.args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    stopChildren();

    if (signal) {
      console.error(`${service.name} exited with signal ${signal}`);
      process.exitCode = 1;
      return;
    }

    process.exitCode = code ?? 1;
  });

  return child;
});

process.on("SIGINT", () => {
  isShuttingDown = true;
  stopChildren();
});

process.on("SIGTERM", () => {
  isShuttingDown = true;
  stopChildren();
});

function stopChildren() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}
