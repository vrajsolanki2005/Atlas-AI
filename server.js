require("dotenv").config();
require("./src/cron/morningBrief.job");
require("./src/cron/eveningBrief.job");

const app = require("./src/app");
const { syncDb } = require("./src/models");
const { startBot } = require("./src/bot/bot");
const { PORT } = require("./src/config");

(async () => {
  await syncDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startBot();
  });
})();

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  process.exit(0);
});
