const { Markup } = require("telegraf");

function homeMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🌅 Morning Brief", "brief")],
    [Markup.button.callback("💬 Ask Atlas", "ask")],
    [Markup.button.callback("📅 My Agenda", "agenda")],
    [Markup.button.callback("⭐ Watchlist", "watchlist")],
    [Markup.button.callback("⚙️ Settings", "settings")],
    [Markup.button.callback("❓ Help", "help")],
  ]);
}

module.exports = homeMenu;
