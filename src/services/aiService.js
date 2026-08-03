const groq = require("../config/groq");
const onboardingPrompt = require("../prompts/onboardingPrompt");
const chatPrompt = require("../prompts/chatPrompt");

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

  async generateReply({ profile = {}, history = [], question }) {
    try {
      const messages = [
        {
          role: "system",
          content: chatPrompt,
        },

        ...history,

        {
          role: "user",
          content: `
User Profile:

${JSON.stringify(profile, null, 2)}

Question:

${question}
`,
        },
      ];

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.5,
      });

      const content = response.choices[0]?.message?.content;

      if (typeof content !== "string" || !content.trim()) {
        throw new Error("Empty response from model");
      }

      return content.trim();
    } catch (error) {
      console.error("AI Service Error (generateReply):", error);

      // Let handleChatMessage's own catch block handle the user-facing
      // fallback message, rather than duplicating that copy here.
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
