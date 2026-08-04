const financeService = require("../finance/finanaceService");
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
            "stock market"
        );

        const articles = context.news;

        const question = `
Generate today's morning briefing for this user.

Rules:
- Maximum 5 updates
- Only include important information
- Explain WHY each update matters
- Do not repeat news
- Do not copy articles
- Use emojis sparingly
- Format for Telegram: use ━━━━━━━━━━━━━━ as a divider between sections
- Start with: 🌅 Good Morning!\n\nHere's today's personalized briefing.
- End with: What would you like to explore further?
`;

        return aiService.generateReply({

            profile,

            history: [],

            question,

            financeNews: articles

        });

    }

}

module.exports = new BriefingService();