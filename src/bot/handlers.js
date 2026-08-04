const { Markup } = require("telegraf");
const homeMenu = require("../utils/menu");
const handleError = require("../utils/errorHandler");

const {
  createOrFindUser,
  getUserByTelegramId,
} = require("../services/userServices");

const aiService = require("../services/aiService");
const memoryService = require("../services/memoryService");
const briefingService = require("../services/briefing/briefingService");
const conversationService = require("../services/ConversationService");
const WatchlistService = require("../services/watchlist/watchlistService");
const watchlistService = new WatchlistService();

const {
  createOrUpdatePreference,
  updateProfile,
} = require("../services/preferenceService");

const DONE_MSG = `✅ Done!\n\nYour preferences have been updated.\nAtlas will personalize future briefings accordingly.`;

const HELP_TEXT = `You can ask me things like:\n\n• What happened today?\n• Compare Apple and Microsoft\n• Explain Nvidia earnings\n• What changed since yesterday?\n• Give me today's market summary\n• What's happening in AI?`;

module.exports = (bot) => {
  bot.start(async (ctx) => {
    const user = await createOrFindUser(ctx);
    const preference = await createOrUpdatePreference(user.id);

    if (preference.onboardingCompleted) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
      const emoji = hour < 12 ? "🌅" : hour < 18 ? "🌞" : "🌆";
      return ctx.reply(
        `${emoji} ${greeting}, ${user.firstName}!\n\nReady for today's insights?`,
        homeMenu(),
      );
    }

    await ctx.reply(
      `👋 Hi, I'm Atlas.\n\nThink of me as your personal intelligence assistant. I'll help you stay updated on what matters most without overwhelming you.\n\nTo personalize your experience, let's begin.`,
      Markup.inlineKeyboard([
        [Markup.button.callback("🚀 Let's Start", "start_onboarding")],
        [Markup.button.callback("Skip", "skip")],
      ]),
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(HELP_TEXT);
  });

  bot.command("reset", async (ctx) => {
    const user = await getUserByTelegramId(ctx.from.id);
    await conversationService.clearConversation(user.id);
    await updateProfile(user.id, {});
    ctx.session.mode = null;
    ctx.session.step = null;
    await ctx.reply("✅ Atlas has forgotten your profile and conversation history.");
  });

  bot.action("start_onboarding", async (ctx) => {
    await ctx.answerCbQuery();
    if (ctx.session.mode === "onboarding") {
      return ctx.answerCbQuery("You're already onboarding 😊");
    }
    ctx.session.mode = "onboarding";

    await ctx.reply(
      `Awesome!\n\nLet's keep this conversational.\n\nTell me a little about yourself.\n\nFor example:\n\n"I'm a backend developer who follows Nvidia and Tesla."`,
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

  bot.action("settings", async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.mode = "settings";
    await ctx.reply(
      "⚙️ Settings",
      Markup.inlineKeyboard([
        [Markup.button.callback("👤 Profile", "profile")],
        [Markup.button.callback("🕗 Briefing Time", "briefing_time")],
        [Markup.button.callback("🔔 Notifications", "notifications")],
        [Markup.button.callback("🏭 Industries", "industries")],
        [Markup.button.callback("⭐ Watchlist", "watchlist")],
        [Markup.button.callback("🏠 Home", "home")],
      ]),
    );
  });

  bot.action("profile", async (ctx) => {
    await ctx.answerCbQuery();
    const user = await getUserByTelegramId(ctx.from.id);
    const pref = await createOrUpdatePreference(user.id);
    const p = pref.profile || {};
    await ctx.reply(
      `👤 Profile\n\nProfession:\n${p.profession || "Not set"}\n\nIndustries:\n${(p.industries || []).join(", ") || "None"}\n\nCompanies:\n${(p.companies || []).join(", ") || "None"}\n\nBriefing:\n${p.briefing || "Morning"}`,
    );
  });

  bot.action("briefing_time", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      "Choose briefing time",
      Markup.inlineKeyboard([
        [Markup.button.callback("🌅 Morning", "brief_morning")],
        [Markup.button.callback("🌆 Evening", "brief_evening")],
        [Markup.button.callback("🌞 Both", "brief_both")],
      ]),
    );
  });

  ["morning", "evening", "both"].forEach((time) => {
    bot.action(`brief_${time}`, async (ctx) => {
      await ctx.answerCbQuery();
      const user = await getUserByTelegramId(ctx.from.id);
      await updateProfile(user.id, { briefing: time });
      await ctx.reply(DONE_MSG);
    });
  });

  bot.action("notifications", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      "Notification preference",
      Markup.inlineKeyboard([
        [Markup.button.callback("Only Important", "notify_important")],
        [Markup.button.callback("All Updates", "notify_all")],
        [Markup.button.callback("Mute", "notify_none")],
      ]),
    );
  });

  ["important", "all", "none"].forEach((level) => {
    bot.action(`notify_${level}`, async (ctx) => {
      await ctx.answerCbQuery();
      const user = await getUserByTelegramId(ctx.from.id);
      await updateProfile(user.id, { notification: level });
      await ctx.reply(DONE_MSG);
    });
  });

  bot.action("industries", async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.mode = "industries";
    await ctx.reply(
      "Type industries separated by commas.\n\nExample:\nFinance, AI, Technology",
    );
  });

  bot.action("home", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("What would you like to do today?", homeMenu());
  });

  bot.action("help", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(`❓ Help\n\n${HELP_TEXT}`);
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
    if (!list.length) {
      return ctx.reply(
        "⭐ Your watchlist is empty.\n\nStart following companies like:\n\n• Nvidia\n• Tesla\n• Apple\n• Microsoft",
      );
    }
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
    let loading;
    try {
      await ctx.answerCbQuery();

      const user = await getUserByTelegramId(ctx.from.id);
      const pref = await createOrUpdatePreference(user.id);

      loading = await ctx.reply("🧠 Atlas is thinking...");

      const briefing = await briefingService.generate(pref.profile || {}, user.id);

      await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id);

      await ctx.reply(briefing);
    } catch (err) {
      if (loading) await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id).catch(() => {});
      return handleError(ctx, err);
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
      case "industries":
        return handleIndustriesMessage(ctx);
      default:
        return;
    }
  });

  async function handleOnboardingMessage(ctx) {
    let loading;
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

      loading = await ctx.reply("🧠 Atlas is thinking...");

      const ai = await aiService.analyzeConversation({
        profile: preference.profile,
        history,
        message: ctx.message.text,
      });

      await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id);

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
        metadata: { model: "llama-3.3-70b-versatile" },
      });

      return ctx.reply(ai.nextQuestion);
    } catch (err) {
      if (loading) await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id).catch(() => {});
      return handleError(ctx, err);
    }
  }

  async function handleIndustriesMessage(ctx) {
    const user = await getUserByTelegramId(ctx.from.id);
    const industries = ctx.message.text.split(",").map((i) => i.trim()).filter(Boolean);
    await updateProfile(user.id, { industries });
    ctx.session.mode = null;
    return ctx.reply(DONE_MSG);
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
    let loading;
    try {
      const user = await getUserByTelegramId(ctx.from.id);
      const preference = await createOrUpdatePreference(user.id);

      const history = await memoryService.getMemory(user.id, "chat");
      const trimmedHistory = history.slice(-8);

      const watchlist = await watchlistService.getAll(user.id);
      const watchedCompanies = watchlist.map((c) => c.company);

      loading = await ctx.reply("🧠 Atlas is thinking...");

      const reply = await aiService.generateReply({
        profile: preference.profile,
        history: trimmedHistory,
        question: ctx.message.text,
        watchedCompanies,
      });

      await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id);

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
      if (loading) await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id).catch(() => {});
      return handleError(ctx, err);
    }
  }
};
