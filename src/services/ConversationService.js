const Conversation = require("../models/Conversation");

class ConversationService {
    async saveMessage({ userId, message, role, intent, metadata = {} }) {
        return Conversation.create({
            userId,
            role,
            message,
            intent,
            metadata,
        });
    }

    async getRecentMessages(userId, intent = null, limit = 10) {
        const where = {
            userId,
            isArchived: false,
        };
        if (intent) {
            where.intent = intent;
        }
        const messages = await Conversation.findAll({
            where,
            order: [["createdAt", "DESC"]],
            limit,
        });
        return messages.reverse(); // Return in chronological order
    }

    async archiveMessages(userId, intent = null) {
        const where = { userId };
        if (intent) {
            where.intent = intent;
        }
        return Conversation.update(
            { isArchived: true },
            { where }
        );
    }

    async clearConversation(userId) {
        return Conversation.destroy({
            where: { userId },
        });
    }
}

module.exports = new ConversationService();