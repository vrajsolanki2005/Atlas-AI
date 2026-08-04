const { Markup } = require("telegraf");
const homeMenu = require("../utils/menu");

const {
  createOrFindUser,
  getUserByTelegramId,
} = require("../services/userServices");

const aiService = require("../services/aiService");
const memoryService = require("../services/memoryService");
const briefingService = require("../services/briefing/briefingService");
const WatchlistService = require("../services/watchlist/watchlistService");
const watchlistService = new WatchlistService();

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
    if (ctx.session.mode === "onboarding") {
      return ctx.answerCbQuery("You're already onboarding 😊");
    }
    ctx.session.mode = "onboarding";

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

    ctx.session.mode = null;

    return ctx.reply("You're ready 🚀", homeMenu());
  });

  bot.action("watchlist", async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.mode = "watchlist";
    await ctx.reply(
      "⭐ Watchlist\n\nChoose an option",
      Markup.inlineKeyboard([
        [Markup.button.callback("➕ Add Company", "add_company")],
        [Markup.button.callback("📄 View Watchlist", "view_watchlist")],
        [Markup.button.callback("➖ Remove Company", "remove_company")],
      ]),
    );
  });

  bot.action("add_company", async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.step = "add_company";
    await ctx.reply("Type the company name.\n\nExample:\nTesla");
  });

  bot.action("view_watchlist", async (ctx) => {
    await ctx.answerCbQuery();
    const user = await getUserByTelegramId(ctx.from.id);
    const list = await watchlistService.getAll(user.id);
    if (!list.length) return ctx.reply("No companies followed yet.");
    await ctx.reply(`⭐ Your Watchlist\n\n${list.map((c) => `• ${c.company}`).join("\n")}`);
  });

  bot.action("remove_company", async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.step = "remove_company";
    await ctx.reply("Type company name to remove.");
  });

  bot.action("watchlist_add_yes", async (ctx) => {
    await ctx.answerCbQuery();
    const user = await getUserByTelegramId(ctx.from.id);
    const company = ctx.session.suggestedCompany;
    if (!company) return;
    await watchlistService.add(user.id, company);
    ctx.session.suggestedCompany = null;
    await ctx.reply(`✅ ${company} added to your watchlist.`);
  });

  bot.action("watchlist_add_no", async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.suggestedCompany = null;
  });

  bot.action("ask", async (ctx) => {
    await ctx.answerCbQuery();

    ctx.session.mode = "chat";

    await ctx.reply(
      "💬 Ask me anything about finance, companies, markets, or today's news.",
    );
  });

  bot.action("brief", async (ctx) => {
    console.log("Brief clicked");
    let interval;
    try {
      await ctx.answerCbQuery();

      const user = await getUserByTelegramId(ctx.from.id);
      const pref = await createOrUpdatePreference(user.id);

      interval = await startTyping(ctx);

      const briefing = await briefingService.generate(pref.profile || {}, user.id);

      clearInterval(interval);

      await ctx.reply(briefing);
    } catch (err) {
      console.error(err);
      await ctx.reply("⚠️ Couldn't generate today's briefing.");
    } finally {
      if (interval) clearInterval(interval);
    }
  });

  // 🔹 Single text handler, dispatching on ctx.session.mode.
  // NOTE: this MUST stay a single bot.on("text") registration. Telegraf chains
  // multiple middlewares for the same event, and a bare `return` (no `next()`)
  // in an earlier handler stops the chain — so separate bot.on("text") blocks
  // per mode would mean later ones never run once an earlier one returns early.
  bot.on("text", async (ctx) => {
    if (!ctx.message.text.trim()) return;

    switch (ctx.session.mode) {
      case "onboarding":
        return handleOnboardingMessage(ctx);
      case "chat":
        return handleChatMessage(ctx);
      case "watchlist":
        return handleWatchlistMessage(ctx);
      default:
        return;
    }
  });

  async function startTyping(ctx) {
    // Fire immediately so users see typing right away, not just after the
    // first interval tick 4+ seconds in.
    await ctx.sendChatAction("typing").catch(() => {});
    return setInterval(() => {
      ctx.sendChatAction("typing").catch(() => {});
    }, 4500);
  }

  async function handleOnboardingMessage(ctx) {
    let interval;
    try {
      const user = await getUserByTelegramId(ctx.from.id);
      const preference = await createOrUpdatePreference(user.id);

      // 🔹 Save the user's message first so it's part of the history sent to the AI
      await memoryService.saveMessage({
        userId: user.id,
        role: "user",
        message: ctx.message.text,
        intent: "onboarding",
      });

      // 🔹 Memory service owns storage/ordering — handler just asks for history
      const history = await memoryService.getMemory(user.id, "onboarding");

      interval = await startTyping(ctx);

      // 🔹 Call AI
      const ai = await aiService.analyzeConversation({
        profile: preference.profile,
        history,
        message: ctx.message.text,
      });

      clearInterval(interval);

      // 🔹 Validate AI response defensively — don't trust LLM output shape
      if (
        typeof ai !== "object" ||
        ai === null ||
        !ai.profile ||
        !Array.isArray(ai.missingFields) ||
        typeof ai.nextQuestion !== "string"
      ) {
        throw new Error("Invalid AI Response");
      }

      await updateProfile(user.id, ai.profile);

      if (ai.nextQuestion === "DONE") {
        await preference.update({ onboardingCompleted: true });
        await memoryService.archiveConversation(user.id, "onboarding");
        ctx.session.mode = null;

        return ctx.reply(
          `🎉 You're all set!\n\nHere's what I can help you with today:\n\n📈 Morning Brief\n📰 Market Updates\n💬 Ask Atlas\n⭐ Watchlist\n⚙ Settings`,
          homeMenu(),
        );
      }

      // 🔹 Save assistant reply before sending it to the user
      await memoryService.saveMessage({
        userId: user.id,
        role: "assistant",
        message: ai.nextQuestion,
        intent: "onboarding",
        metadata: {
          model: "llama-3.3-70b-versatile",
        },
      });

      return ctx.reply(ai.nextQuestion);
    } catch (err) {
      console.error(err);
      return ctx.reply(
        `⚠️ I'm having trouble understanding right now.\nPlease try again in a few seconds.`,
      );
    } finally {
      if (interval) clearInterval(interval);
    }
  }

  async function handleWatchlistMessage(ctx) {
    const user = await getUserByTelegramId(ctx.from.id);
    const company = ctx.message.text.trim();

    if (ctx.session.step === "add_company") {
      await watchlistService.add(user.id, company);
      ctx.session.step = null;
      return ctx.reply(`✅ ${company} added to your watchlist.`);
    }

    if (ctx.session.step === "remove_company") {
      await watchlistService.remove(user.id, company);
      ctx.session.step = null;
      return ctx.reply("✅ Removed.");
    }
  }

  async function handleChatMessage(ctx) {
    let interval;
    try {
      const user = await getUserByTelegramId(ctx.from.id);
      const preference = await createOrUpdatePreference(user.id);

      const history = await memoryService.getMemory(user.id, "chat");
      const trimmedHistory = history.slice(-8);

      const watchlist = await watchlistService.getAll(user.id);
      const watchedCompanies = watchlist.map((c) => c.company);

      interval = await startTyping(ctx);

      const reply = await aiService.generateReply({
        profile: preference.profile,
        history: trimmedHistory,
        question: ctx.message.text,
        watchedCompanies,
      });

      clearInterval(interval);

      if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("Invalid AI Response");
      }

      // Auto-suggest: detect company mentioned but not in watchlist
      const mentioned = watchedCompanies.length
        ? ctx.message.text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g) || []
        : [];
      const notFollowed = mentioned.find(
        (w) => !watchedCompanies.some((c) => c.toLowerCase() === w.toLowerCase()),
      );

      await memoryService.remember({
        userId: user.id,
        userMessage: ctx.message.text,
        assistantMessage: reply,
        intent: "chat",
      });

      await ctx.reply(reply);

      if (notFollowed) {
        ctx.session.suggestedCompany = notFollowed;
        await ctx.reply(
          `Would you like me to follow ${notFollowed}?`,
          Markup.inlineKeyboard([
            [Markup.button.callback("Yes", "watchlist_add_yes"), Markup.button.callback("No", "watchlist_add_no")],
          ]),
        );
      }

      return;
    } catch (err) {
      console.error(err);
      return ctx.reply(
        `⚠️ I'm having trouble answering that right now.\nPlease try again in a few seconds.`,
      );
    } finally {
      if (interval) clearInterval(interval);
    }
  }
};