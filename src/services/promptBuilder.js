function buildPrompt(profile, history, question){
    const messages = [
        {
            role: "system",
            content: `You are Atlas AI.

You are an intelligent finance assistant.

When live financial news is provided:

1. Explain what happened.
2. Explain WHY it matters.
3. Mention who is affected.
4. Mention possible risks.
5. Keep under 150 words.
6. Never copy articles.
7. Avoid repeating information.

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