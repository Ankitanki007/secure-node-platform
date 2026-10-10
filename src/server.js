const http = require("node:http");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const version = process.env.APP_VERSION || "local-dev";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

let shuttingDown = false;

const server = http.createServer((req, res) => {
  const path = req.url.split("?")[0];

  let statusCode = 200;
  let response;

  if (shuttingDown) {
    statusCode = 503;
    res.setHeader("Connection", "close");
    response = { error: "Application is shutting down" };
  } else if (req.method !== "GET") {
    statusCode = 405;
    res.setHeader("Allow", "GET");
    response = { error: "Method not allowed" };
  } else if (path === "/") {
    response = {
      application: "secure-node-platform",
      message: "Application is running",
    };
  } else if (path === "/health") {
    response = { status: "ok" };
  } else if (path === "/version") {
    response = { version };
  } else {
    statusCode = 404;
    response = { error: "Route not found" };
  }

  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  res.end(JSON.stringify(response) + "\n");

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: "request",
    method: req.method,
    statusCode,
  }));
});

server.on("error", (error) => {
  console.error(JSON.stringify({
    event: "server_error",
    code: error.code,
    message: error.message,
  }));

  process.exit(1);
});

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(JSON.stringify({
    event: "shutdown_started",
    signal,
  }));

  const shutdownTimer = setTimeout(() => {
    console.error(JSON.stringify({
      event: "shutdown_timeout",
    }));

    process.exit(1);
  }, 8000);

  shutdownTimer.unref();

  server.close((error) => {
    clearTimeout(shutdownTimer);

    if (error) {
      console.error(JSON.stringify({
        event: "shutdown_error",
        message: error.message,
      }));

      process.exit(1);
    }

    console.log(JSON.stringify({
      event: "shutdown_complete",
    }));

    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

server.listen(port, host, () => {
  console.log(JSON.stringify({
    event: "server_started",
    address: `http://${host}:${port}`,
    version,
    nodeVersion: process.version,
  }));
});