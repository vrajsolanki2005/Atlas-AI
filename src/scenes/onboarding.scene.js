const { Scenes, Markup } = require("telegraf");

const { getUserByTelegramId } = require("../services/userServices");

const { updatePreference } = require("../services/preferenceService");

const homeMenu = require("../utils/menu");

const onboardingScene = new Scenes.WizardScene(
  "onboarding",
  async (ctx) => {
    await ctx.reply(
      "What best describes you?",
      Markup.inlineKeyboard([
        [Markup.button.callback("💼 Professional", "professional")],
        [Markup.button.callback("👨‍🎓 Student", "student")],
        [Markup.button.callback("👨‍💻 Developer", "developer")],
        [Markup.button.callback("👨‍🏫 Educator", "educator")],
        [Markup.button.callback("🚀 Founder", "founder")],

        [Markup.button.callback("📈 Investor", "investor")],
      ]),
    );

    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.callbackQuery || !ctx.callbackQuery.data) return;
    const profession = ctx.callbackQuery.data;
    const user = await getUserByTelegramId(ctx.from.id);
    await updatePreference(user.id, { profession });
    await ctx.answerCbQuery();
    await ctx.reply(
      "What interest you most?",
      Markup.inlineKeyboard([
        [Markup.button.callback(" Finance", "finance")],
        [Markup.button.callback("AI", "ai")],
        [Markup.button.callback("Technology", "technology")],
      ]),
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.callbackQuery || !ctx.callbackQuery.data) return;
    const industry = ctx.callbackQuery.data;
    const user = await getUserByTelegramId(ctx.from.id);

    await updatePreference(user.id, { interests: industry }); // or { interests: industry } if that's your schema

    await ctx.answerCbQuery();
    await ctx.reply(
      "What companies do you want to follow?\n\nExample: Apple, Google, Microsoft",
    );

    console.log("Moved to step:", ctx.wizard.cursor);
    return ctx.wizard.next();
  },

  async (ctx) => {
    // const companies=ctx.message.text;
    if (!ctx.message?.text) {
      return ctx.reply("Please type company names.");
    }

    const companies = ctx.message.text;
    const user = await getUserByTelegramId(ctx.from.id);
    await updatePreference(user.id, {
      companies,
    });

    console.log("Wizard Cursor:", ctx.wizard.cursor);
    console.log(ctx.updateType);
    await ctx.reply(
      "When should I send your briefing?",
      Markup.inlineKeyboard([
        [Markup.button.callback("🌅 Morning", "morning")],
        [Markup.button.callback("🌆 Evening", "evening")],
        [Markup.button.callback("🌞 Both", "both")],
      ]),
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    try {
      console.log("1");

      await ctx.answerCbQuery();

      console.log("2");

      const briefingTime = ctx.callbackQuery.data;

      console.log("3");

      const user = await getUserByTelegramId(ctx.from.id);

      console.log("4");

      await updatePreference(user.id, {
        briefingTime,
      });

      console.log("5");

      await ctx.reply(
        "🎉 Perfect!\n\nAtlas is personalized for you.",
        homeMenu(),
      );

      console.log("6");

      await ctx.scene.leave();

      console.log("7");
    } catch (err) {
      console.error("FINAL STEP ERROR:", err);
    }
  },
);

module.exports = onboardingScene;
