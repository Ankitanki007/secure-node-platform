const http = require("node:http");

// Configuration can be supplied through environment variables.
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const version = process.env.APP_VERSION || "local-dev";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const server = http.createServer((req, res) => {
  // Ignore query parameters when matching an endpoint.
  const path = req.url.split("?")[0];

  let statusCode = 200;
  let response;

  if (req.method !== "GET") {
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

  res.end(JSON.stringify(response));

  // Log request metadata, not headers, secrets, or request bodies.
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

server.listen(port, host, () => {
  console.log(JSON.stringify({
    event: "server_started",
    address: `http://${host}:${port}`,
    version,
  }));
});