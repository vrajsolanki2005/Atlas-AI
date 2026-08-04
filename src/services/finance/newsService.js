const axios = require("axios");
const newsCache = require("../cache/newsCache");

class NewsService {
  constructor() {
    this.baseURL = "https://gnews.io/api/v4";
    this.apiKey = process.env.GNEWS_API_KEY;
  }

  async getTopFinanceNews(limit = 5) {
    const cacheKey = `top_finance_${limit}`;
    const cached = newsCache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await axios.get(`${this.baseURL}/top-headlines`, {
        params: {
          category: "business",
          lang: "en",
          max: limit,
          token: this.apiKey,
        },
      });
      const news = data.articles || [];
      newsCache.set(cacheKey, news);
      return news;
    } catch (error) {
      console.error("News Service Error:", error);
      return [];
    }
  }

  async searchCompaniesNews(query, limit = 5) {
    const cacheKey = `search_${query}_${limit}`;
    const cached = newsCache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await axios.get(`${this.baseURL}/search`, {
        params: {
          q: query,
          lang: "en",
          max: limit,
          token: this.apiKey,
        },
      });
      const news = data.articles || [];
      newsCache.set(cacheKey, news);
      return news;
    } catch (error) {
      console.error("News Service Error:", error);
      return [];
    }
  }
}

module.exports = new NewsService();
