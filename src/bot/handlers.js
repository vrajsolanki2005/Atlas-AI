const { Markup } = require("telegraf");
const homeMenu = require("../utils/menu");
const Conversation = require("../models/Conversation");

const {
  createOrFindUser,
  getUserByTelegramId,
} = require("../services/userServices");

const { analyzeConversation } = require("../services/aiService");

const {
  createOrUpdatePreference,
  updateProfile,
} = require("../services/preferenceService");

module.exports = (bot) => {
  bot.start(async (ctx) => {
    const user = await createOrFindUser(ctx);
    const preference = await createOrUpdatePreference(user.id);

    if (preference.onboardingCompleted) {
      return ctx.reply(
        `👋 Welcome back ${user.firstName}!\n\nWhat would you like to do today?\n\n📈 Morning Brief\n💬 Ask Atlas\n⭐ Watchlist\n⚙ Settings`,
        homeMenu(),
      );
    }

    await ctx.reply(
      `👋 Hi, I'm Atlas.

Think of me as your personal intelligence assistant. I'll help you stay updated on what matters most without overwhelming you.

To personalize your experience, let's begin.`,
      Markup.inlineKeyboard([
        [Markup.button.callback("🚀 Let's Start", "start_onboarding")],
        [Markup.button.callback("Skip", "skip")],
      ]),
    );
  });

  bot.action("start_onboarding", async (ctx) => {
    await ctx.answerCbQuery();
    if (ctx.session.onboarding) {
      return ctx.answerCbQuery("You're already onboarding 😊");
    }
    ctx.session.onboarding = true;

    await ctx.reply(
      `Awesome!

Let's keep this conversational.

Tell me a little about yourself.

For example:

"I'm a backend developer who follows Nvidia and Tesla."`,
    );
  });

  bot.action("skip", async (ctx) => {
    await ctx.answerCbQuery();

    const user = await getUserByTelegramId(ctx.from.id);
    const preference = await createOrUpdatePreference(user.id);

    await preference.update({ onboardingCompleted: true });

    ctx.session.onboarding = false;

    return ctx.reply("You're ready 🚀", homeMenu());
  });

  bot.on("text", async (ctx) => {
    if (!ctx.session.onboarding) return;
    if (!ctx.message.text.trim()) return;

    let interval;
    try {
      const user = await getUserByTelegramId(ctx.from.id);
      const preference = await createOrUpdatePreference(user.id);

      // 🔹 Save the user's message first so it's part of the history sent to the AI
      await Conversation.create({
        userId: user.id,
        role: "user",
        message: ctx.message.text,
        intent: "onboarding",
      });

      // 🔹 Build history from persisted conversation (now includes this message)
      const history = await Conversation.findAll({
        where: {
          userId: user.id,
          intent: "onboarding",
        },
        order: [["createdAt", "ASC"]],
        limit: 10,
      });
      const formattedHistory = history.map((chat) => ({
        role: chat.role,
        content: chat.message,
      }));

      // 🔹 Start typing indicator loop (assign to outer `interval`, don't shadow it)
      interval = setInterval(() => {
        ctx.sendChatAction("typing");
      }, 4000);

      // 🔹 Call AI
      const aiResult = await analyzeConversation({
        profile: preference.profile || {},
        history: formattedHistory,
        message: ctx.message.text,
      });

      // 🔹 Stop typing indicator
      clearInterval(interval);

      // 🔹 Validate AI response
      if (!aiResult.profile || typeof aiResult.nextQuestion !== "string") {
        throw new Error("Invalid AI Response");
      }

      await updateProfile(user.id, aiResult.profile);

      if (aiResult.nextQuestion === "DONE") {
        await preference.update({ onboardingCompleted: true });
        ctx.session.onboarding = false;

        return ctx.reply(
          `🎉 Awesome!\n\nYou're all set.\nI'll continue learning naturally as we chat.`,
          homeMenu(),
        );
      }

      // 🔹 Save assistant reply
      await Conversation.create({
        userId: user.id,
        role: "assistant",
        message: aiResult.nextQuestion,
        intent: "onboarding",
        metadata: {
          model: "gpt-4.1-mini",
          confidence: aiResult.confidence ?? null,
        },
      });

      return ctx.reply(aiResult.nextQuestion);
    } catch (err) {
      console.error(err);
      return ctx.reply(
        `⚠️ I'm having trouble understanding right now.\nPlease try again in a few seconds.`,
      );
    } finally {
      if (interval) clearInterval(interval); // always clear safely
    }
  });
};