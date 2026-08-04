const financeService = require("../finance/financeService");


class AIRouter {
  route(question) {
    const q = question.toLowerCase();

    if (financeService.isFinanceQuestion(q)) {
      return "finance";
    }

    if (q.includes("compare") || q.includes("difference")) {
      return "comparison";
    }

    if (q.includes("today") || q.includes("latest") || q.includes("current")) {
      return "live";
    }

    return "chat";
  }
}

module.exports = new AIRouter();
