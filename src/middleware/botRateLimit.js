const requests = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

module.exports = async (ctx, next) => {
  const userId = ctx.from?.id;
  if (!userId) return next();

  const now = Date.now();
  const userRequests = requests.get(userId) || [];

  const recent = userRequests.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    return ctx.reply(
      "⚠️ You're sending requests too quickly.\n\nPlease wait a moment before trying again.",
    );
  }

  recent.push(now);
  requests.set(userId, recent);

  return next();
};
