const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "secure-node-api",
      cwd: path.resolve(__dirname, ".."),
      script: "./src/server.js",

      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      restart_delay: 2000,
      kill_timeout: 10000,
      watch: false,

      out_file: "/var/log/secure-node/application.log",
      error_file: "/var/log/secure-node/error.log",
      merge_logs: true,

      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: "3001",
        APP_VERSION: process.env.APP_VERSION || "unknown",
        ENABLE_LAB_ROUTES: "false",
      },
    },
  ],
};
