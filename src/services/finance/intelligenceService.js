class IntelligenceService {
  removeDuplicates(articles = []) {
    const seen = new Set();

    return articles.filter((article) => {
      const title = article.title?.trim()?.toLowerCase();

      if (!title) return false;

      if (seen.has(title)) return false;

      seen.add(title);

      return true;
    });
  }

  rankArticles(articles = []) {
    return articles.sort((a, b) => {
      const scoreA = this.calculateScore(a);

      const scoreB = this.calculateScore(b);

      return scoreB - scoreA;
    });
  }

  calculateScore(article) {
    let score = 0;

    const text = `${article.title} ${article.description}`.toLowerCase();

    if (text.includes("earnings")) score += 5;

    if (text.includes("acquisition")) score += 5;

    if (text.includes("ai")) score += 4;

    if (text.includes("market")) score += 3;

    if (text.includes("stock")) score += 3;

    if (text.includes("revenue")) score += 4;

    if (text.includes("profit")) score += 4;

    if (text.includes("guidance")) score += 4;

    return score;
  }
}

module.exports = new IntelligenceService();
