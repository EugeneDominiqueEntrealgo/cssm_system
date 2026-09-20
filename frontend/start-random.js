const net = require("net");
const { spawn } = require("child_process");
const reactScriptsStart = require.resolve("react-scripts/scripts/start.js");

const server = net.createServer();

server.listen(0, "127.0.0.1", () => {
  const { port } = server.address();
  server.close(() => {
    const child = spawn(process.execPath, [reactScriptsStart], {
      cwd: __dirname,
      env: { ...process.env, PORT: String(port) },
      stdio: "inherit",
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
      } else {
        process.exit(code ?? 0);
      }
    });
  });
});

server.on("error", (error) => {
  console.error("Could not find an available frontend port:", error);
  process.exit(1);
});
