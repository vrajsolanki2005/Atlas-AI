const groq = require("../config/groq");
const onboardingPrompt = require("../prompts/onboardingPrompt");
const chatPrompt = require("../prompts/chatPrompt");
const financeService = require("../services/finance/finanaceService");

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
          content: `
Current User Profile:

${JSON.stringify(profile, null, 2)}

Latest User Message:

${message}
`,
        },
      ];

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.3,
        response_format: {
          type: "json_object",
        },
      });

      const content = response.choices[0].message.content;

      return JSON.parse(content);
    } catch (error) {
      console.error("AI Service Error:", error);

      return {
        profile: {},
        missingFields: [],
        nextQuestion:
          "Sorry, I couldn't understand that. Could you rephrase it?",
      };
    }
  }

  async generateReply({
    profile = {},
    history = [],
    question,
    financeNews = [],
    watchedCompanies = [],
  }) {
    try {
      let financeContext = financeNews
        .map(
          (article) => `

      Title:
      ${article.title}

      Summary:
      ${article.description}

      `,
        )
        .join("\n");

      console.log("Question:", question);
      console.log("Finance?", financeService.isFinanceQuestion(question));

      if (financeService.isFinanceQuestion(question)) {
        const financeData = await financeService.getContext(question);

        console.log("financeData:", financeData);

        if (financeData.news.length) {
          financeContext = financeData.news
            .map(
              (article) => `
Title:
${article.title}

Summary:
${article.description}

Source:
${article.source?.name}

Published:
${article.publishedAt}
`,
            )
            .join("\n");
        }
      }

      console.log("Finance Context:", financeContext);

      const formattedHistory = history.map((msg) => ({
        role: msg.role,
        content: msg.content ?? msg.message,
      }));

      const messages = [
        {
          role: "system",
          content: chatPrompt,
        },
        {
          role: "system",
          content: `User Profile:
${JSON.stringify(profile, null, 2)}

${watchedCompanies.length ? `Companies followed by user: ${watchedCompanies.join(", ")}\nReference these naturally when relevant.` : ""}

${
  financeContext
    ? `Live Financial Context:
${financeContext}`
    : ""
}`,
        },
        ...formattedHistory,
        {
          role: "user",
          content: question,
        },
      ];

      console.log("Messages:", JSON.stringify(messages, null, 2));

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.5,
      });

      const content = response.choices[0]?.message?.content;

      if (!content?.trim()) {
        throw new Error("Empty response");
      }

      return content.trim();
    } catch (error) {
      console.error("AI Service Error (generateReply):", error);

      throw error;
    }
  }
}

module.exports = new AIService();
// const openai = require("../config/openai");
// const prompt = require("../prompts/onboardingPrompt");

// async function analyzeConversation(profile, message){
//     const response = await  openai.responses.create({
//         model: "gpt-4.1-mini",
//         input: [
//             {
//                 role: "system",
//                 content: prompt
//             },
//             {
//                 role: "user",
//                 content:
//                 `Current Profile: ${JSON.stringify(profile)}
//                 User: ${message}`
//             }
//         ]
//     });
//     return JSON.parse(response.output_text);
// }

// module.exports = {analyzeConversation};
