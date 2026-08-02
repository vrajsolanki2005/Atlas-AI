const { Markup } = require("telegraf");
const STATES = require("../constants/states");
const homeMenu = require("../utils/menu");

const {
  createOrFindUser,
  getUserByTelegramId,
} = require("../services/userServices");

const { updatePreference } = require("../services/preferenceService");

module.exports = (bot) => {
  bot.start(async (ctx) => {
    await createOrFindUser(ctx);

    await ctx.reply(
      `👋 Welcome to Atlas!

I'll help you stay informed without overwhelming you.

Ready?`,
      Markup.inlineKeyboard([
        [Markup.button.callback("🚀 Let's Start", "start_onboarding")],
        [Markup.button.callback("Skip", "skip")],
      ]),
    );
  });

  bot.action("start_onboarding", async (ctx) => {
    console.log("Start button clicked");

    await ctx.answerCbQuery();

    return ctx.scene.enter("onboarding");
  });

  bot.action("skip", async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.reply("You're ready 🚀", homeMenu());
  });
};
