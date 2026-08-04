const cron = require("node-cron");

const User = require("../models/User");
const Preference = require("../models/Preference");
const BriefingLog = require("../models/BriefingLog");

const briefingService = require("../services/briefing/briefingService");

const { bot } = require("../bot/bot");

cron.schedule("0 18 * * *", async () => {
  console.log("Evening Brief Running");

  const users = await User.findAll({ include: [Preference] });

  for (const user of users) {
    try {
      const pref = user.Preference;
      if (!pref) continue;

      const profile = pref.profile || {};
      if (profile.briefing !== "evening" && profile.briefing !== "both") continue;

      const briefing = await briefingService.generate(pref.profile || {}, user.id);

      await BriefingLog.create({ UserId: user.id, content: briefing });

      await bot.telegram.sendMessage(user.telegramId, briefing, { parse_mode: "Markdown" });
    } catch (err) {
      console.error(err);
    }
  }
});
