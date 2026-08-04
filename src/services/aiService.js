const groq = require("../config/groq");
const onboardingPrompt = require("../prompts/onboardingPrompt");
const chatPrompt = require("../prompts/chatPrompt");
const financeService = require("./finance/financeService");
const router = require("./router/aiRouter");

class AIService {
  async analyzeConversation({ profile = {}, history = [], message }) {
    try {
      const messages = [
        {
          role: "system",
          content: onboardingPrompt,
        },
        ...history,
        {
          role: "user",
          content: `\nCurrent User Profile:\n\n${JSON.stringify(profile, null, 2)}\n\nLatest User Message:\n\n${message}\n`,
        },
      ];

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("AI Service Error:", error);
      return {
        profile: {},
        missingFields: [],
        nextQuestion: "Sorry, I couldn't understand that. Could you rephrase it?",
      };
    }
  }

  async generateReply({ profile = {}, history = [], question, watchedCompanies = [] }) {
    const route = router.route(question);

    switch (route) {
      case "finance":
        return this.generateFinanceReply({ profile, history, question, watchedCompanies });
      case "comparison":
        return this.generateComparisonReply({ profile, history, question, watchedCompanies });
      case "live":
        return this.generateFinanceReply({ profile, history, question, watchedCompanies });
      default:
        return this.generateNormalReply({ profile, history, question, watchedCompanies });
    }
  }

  async generateFinanceReply({ profile, history, question, watchedCompanies = [] }) {
    const finance = await financeService.getContext(question);

    if (!finance.news.length) {
      return this.generateNormalReply({ profile, history, question, watchedCompanies });
    }

    const financeContext = finance.news
      .map(
        (a) => `Title:\n${a.title}\n\nSummary:\n${a.description}\n\nSource:\n${a.source?.name}\n\nPublished:\n${a.publishedAt}`,
      )
      .join("\n\n");

    return this._callGroq({
      profile,
      history,
      watchedCompanies,
      userContent: `Live Financial News:\n\n${financeContext}\n\nQuestion:\n${question}`,
    });
  }

  async generateComparisonReply({ profile, history, question, watchedCompanies = [] }) {
    return this._callGroq({
      profile,
      history,
      watchedCompanies,
      userContent: `Compare these companies. Use the latest information available.\n\nQuestion:\n${question}`,
    });
  }

  async generateNormalReply({ profile, history, question, watchedCompanies = [] }) {
    return this._callGroq({ profile, history, watchedCompanies, userContent: question });
  }

  async _callGroq({ profile, history, watchedCompanies = [], userContent }) {
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content ?? msg.message,
    }));

    const messages = [
      { role: "system", content: chatPrompt },
      {
        role: "system",
        content: `User Profile:\n${JSON.stringify(profile, null, 2)}\n\n${
          watchedCompanies.length
            ? `Companies followed by user: ${watchedCompanies.join(", ")}\nReference these naturally when relevant.`
            : ""
        }`,
      },
      ...formattedHistory,
      { role: "user", content: userContent },
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;

    if (!content?.trim()) throw new Error("Empty response");

    return content.trim();
  }
}

module.exports = new AIService();
