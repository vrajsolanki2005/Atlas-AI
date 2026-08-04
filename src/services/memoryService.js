const conversationService = require("../services/ConversationService");

class MemoryService {
  // Save a single message (used by onboarding, which saves user and
  // assistant turns separately rather than as a pair).
  async saveMessage({ userId, role, message, intent = "chat", metadata = null }) {
    return conversationService.saveMessage({
      userId,
      role,
      message,
      intent,
      metadata,
    });
  }

  // Save a user+assistant turn together (used by chat mode).
  async rememberMessage({
    userId,
    userMessage,
    assistantMessage,
    intent = "chat",
    metadata = null,
  }) {
    await conversationService.saveMessage({
      userId,
      role: "user",
      message: userMessage,
      intent,
      metadata,
    });
    await conversationService.saveMessage({
      userId,
      role: "assistant",
      message: assistantMessage,
      intent,
      metadata,
    });
  }

  // Alias so handlers.js's memoryService.remember(...) calls work without
  // renaming everything to rememberMessage.
  async remember(args) {
    return this.rememberMessage(args);
  }

  // FIX: previously called conversationService.getRecentMessages(userId, 10, intent),
  // which put the limit and intent in the wrong argument slots and caused
  // "intent = 10 ... LIMIT 'chat'" SQL errors. Correct order is
  // (userId, intent, limit).
  async getMemory(userId, intent = "chat", limit = 10) {
    const history = await conversationService.getRecentMessages(
      userId,
      intent,
      limit,
    );

    return history.map((msg) => ({
      role: msg.role,
      content: msg.message,
    }));
  }

  // Archive a user's messages, scoped to a single intent so archiving
  // onboarding history doesn't also wipe out unrelated chat history.
  async archiveConversation(userId, intent) {
    return conversationService.archiveMessages(userId, intent);
  }
}

module.exports = new MemoryService();