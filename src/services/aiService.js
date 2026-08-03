const groq = require("../config/groq");
const onboardingPrompt = require("../prompts/onboardingPrompt");

async function analyzeConversation({ profile, history, message }) {
  const messages = [
    {
      role: "system",
      content: onboardingPrompt,
    },

    ...history,

    {
      role: "user",
      content: `Current Profile:
${JSON.stringify(profile)}

Latest Message:
${message}`,
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

  return JSON.parse(response.choices[0].message.content);
}

module.exports = {
  analyzeConversation,
};
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