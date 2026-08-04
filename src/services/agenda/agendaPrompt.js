function buildMeetingPrepPrompt(event) {
  return `
The user has a meeting coming up.

Meeting: ${event.title}
Time: ${event.time}

Prepare them with:

1. Summary — What this meeting is likely about based on the title.
2. Goals — What they should aim to achieve.
3. Things to remember — Key points to keep in mind going in.
4. Potential discussion points — Questions or topics likely to come up.

Be concise. Format for Telegram. No markdown headings.
`;
}

module.exports = { buildMeetingPrepPrompt };
