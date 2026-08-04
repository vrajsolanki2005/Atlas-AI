const logger = require("./logger");

function handleError(ctx, error) {
  logger.error("Bot error", error);
  return ctx.reply("⚠️ Something went wrong.\n\nPlease try again in a moment.");
}

module.exports = handleError;
