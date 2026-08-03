function buildPrompt(profile, history, question){
    const messages = [
        {
            role: "system",
            content: `You are Atlas AI.

You are a helpful financial assistant.

Keep answers concise.

Explain WHY something matters.

Use user preferences whenever possible.

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