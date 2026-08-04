const financeService = require("../finance/financeService");
const aiService = require("../aiService");
const WatchlistService = require("../watchlist/watchlistService");
const watchlistService = new WatchlistService();

class BriefingService {

  async generate(profile, userId = null) {
    let companies = profile.companies || [];

    if (userId) {
      const watchlist = await watchlistService.getAll(userId);
      if (watchlist.length) companies = watchlist.map((c) => c.company);
    }

    const context = await financeService.getContext(
      companies.join(" ") ||
      profile.industries?.join(" ") ||
      "stock market",
    );

    const question = `
Generate today's morning briefing. Structure it exactly like this:

🌅 Good Morning!

Here's today's personalized briefing.

━━━━━━━━━━━━━━
📊 Markets
Brief overview of overall market sentiment today.

━━━━━━━━━━━━━━
🏢 Companies You Follow
Key updates on: ${companies.join(", ") || "major companies"}.
Only include if there is something meaningful to report.

━━━━━━━━━━━━━━
🔄 What Changed
The most important development since yesterday.

━━━━━━━━━━━━━━
💡 Why It Matters
One clear explanation of the biggest story's impact.

━━━━━━━━━━━━━━
👁 One Thing To Watch Today
A single forward-looking insight the user should keep an eye on.

━━━━━━━━━━━━━━

End with: What would you like to explore further?

Rules:
- Do not copy articles
- Do not repeat information
- Maximum 5 updates total
- Use only the live news provided
`;

    return aiService.generateReply({
      profile,
      history: [],
      question,
      financeNews: context.news,
    });
  }
}

module.exports = new BriefingService();
