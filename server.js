require("dotenv").config();
require("./src/cron/morningBrief.job");
require("./src/cron/eveningBrief.job");

const app = require("./src/app");
const { syncDb } = require("./src/models");
const { startBot } = require("./src/bot/bot");
const { PORT } = require("./src/config");
const logger = require("./src/utils/logger");

(async () => {
  await syncDb();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    startBot();
  });
})();

process.on("SIGINT", async () => {
  logger.info("Shutting down...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", reason instanceof Error ? reason : new Error(String(reason)));
});
