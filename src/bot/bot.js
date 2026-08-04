const { Telegraf, session } = require("telegraf");
const registerHandlers = require("./handlers");
const botRateLimit = require("../middleware/botRateLimit");
const logger = require("../utils/logger");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());

// Seed session defaults so ctx.session is never undefined in handlers.
bot.use((ctx, next) => {
  if (!ctx.session) ctx.session = {};
  ctx.session.mode = ctx.session.mode ?? null;
  ctx.session.step = ctx.session.step ?? null;
  ctx.session.suggestedCompany = ctx.session.suggestedCompany ?? null;
  return next();
});

// Patch answerCbQuery so stale callback queries (Telegram's 10s timeout)
// never throw an unhandled error and crash the process.
bot.use((ctx, next) => {
  if (ctx.callbackQuery) {
    const original = ctx.answerCbQuery.bind(ctx);
    ctx.answerCbQuery = (...args) => original(...args).catch(() => {});
  }
  return next();
});

bot.use(botRateLimit);

function startBot() {
  registerHandlers(bot);
  bot.launch();
  logger.info("Atlas Bot Started");
}

module.exports = { bot, startBot };
