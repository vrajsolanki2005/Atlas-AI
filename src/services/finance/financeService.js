const newsService = require("./newsService");
const intelligence = require("./intelligenceService");

class FinanceService {
  isFinanceQuestion(question) {
    const keywords = [
      "news",
      "today",
      "latest",
      "market",
      "stock",
      "stocks",
      "share",
      "shares",
      "company",
      "companies",
      "earnings",
      "finance",
      "investment",
      "invest",
      "economy",
      "inflation",
      "google",
      "alphabet",
      "apple",
      "microsoft",
      "tesla",
      "nvidia",
      "amazon",
      "meta",
      "openai",
    ];
    const text = question.toLowerCase();
    return keywords.some((k) => text.includes(k));
  }

  extractCompanies(question) {
    const companies = [
      "nvidia",
      "apple",
      "google",
      "microsoft",
      "amazon",
      "tesla",
      "facebook",
      "netflix",
      "ibm",
      "oracle",
      "sap",
      "goldman sachs",
      "jpmorgan chase",
      "morgan stanley",
      "citigroup",
      "bank of america",
      "wells fargo",
      "hsbc",
      "barclays",
      "credit suisse",
      "deutsche bank",
      "ubs",
      "robinhood",
      "coinbase",
      "paypal",
      "square",
      "tcs",
      "hdfc",
      "icici",
      "sbi",
      "axis bank",
      "kotak mahindra",
      "hdfc bank",
      "icici bank",
      "sbi bank",
    ];

    return companies.filter((company) =>
      question.toLowerCase().includes(company),
    );
  }

  async getContext(question) {
    const companies = this.extractCompanies(question);

    const companyAliases = {
      google: "Alphabet Inc",
      meta: "Meta Platforms",
      facebook: "Meta Platforms",
      tesla: "Tesla Inc",
      apple: "Apple Inc",
      microsoft: "Microsoft",
      nvidia: "NVIDIA",
      amazon: "Amazon",
    };

    let news = [];
    if (companies.length > 0) {
      const searchQuery =
        companyAliases[companies[0].toLowerCase()] || companies[0];
      news = await newsService.searchCompaniesNews(searchQuery);
    } else {
      news = await newsService.getTopFinanceNews();
    }
    const cleanNews = intelligence.removeDuplicates(news);

    const ranked = intelligence.rankArticles(cleanNews);

    return {
      companies,news: ranked.slice(0, 5),
    };
  }
}
module.exports = new FinanceService();
