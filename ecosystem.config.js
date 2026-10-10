module.exports = {
  apps: [
    {
      name: "secure-node-api",
      cwd: __dirname,
      script: "./src/server.js",

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      restart_delay: 2000,
      kill_timeout: 10000,
      watch: false,

      env: {
        NODE_ENV: "development",
        HOST: "127.0.0.1",
        PORT: "3001",
        APP_VERSION: "local-dev",
        ENABLE_LAB_ROUTES: "true",
      },
    },
  ],
};