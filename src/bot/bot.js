const { Telegraf, session } = require("telegraf");
const registerHandlers = require("./handlers");
const botRateLimit = require("../middleware/botRateLimit");
const logger = require("../utils/logger");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(botRateLimit);

function startBot() {
  registerHandlers(bot);
  bot.launch();
  logger.info("Atlas Bot Started");
}

module.exports = { bot, startBot };
