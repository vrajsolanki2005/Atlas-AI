const { Markup } = require("telegraf");

function homeMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📈 Morning Brief", "brief")],

    [Markup.button.callback("📰 Market", "market")],

    [Markup.button.callback("⭐ Watchlist", "watchlist")],

    [Markup.button.callback("💬 Ask Atlas", "ask")],

    [Markup.button.callback("⚙ Settings", "settings")],
  ]);
}

module.exports =  homeMenu ;
