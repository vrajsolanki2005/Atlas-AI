function buildPrompt(profile, history, question){
    const messages = [
        {
            role: "system",
            content: `You are Atlas AI.

You are an intelligent finance assistant.

When live financial context is available:

• Never copy articles.

• Summarize information.

• Explain WHY it matters.

• Mention possible impact.

Keep answers under 200 words.

Always prioritize user preferences.

If no finance context exists,
answer normally.

User Profile:

${JSON.stringify(profile)}
`,
    },
  ];

  history.forEach((msg) => {
    messages.push({
      role: msg.role,
      content: msg.message,
    });
  });

  messages.push({
    role: "user",
    content: question,
  });

  return messages;
}
module.exports = {
  buildPrompt,
};