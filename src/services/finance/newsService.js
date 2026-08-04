const axios = require('axios');

class NewsService {
    constructor() {
        this.baseURL = 'https://gnews.io/api/v4';
        this.apiKey = process.env.GNEWS_API_KEY;
    }

    async getTopFinanceNews(limit=5) {
        try {
            const {data} = await axios.get(`${this.baseURL}/top-headlines`, {
                params: {
                    category: 'business',
                    lang: 'en',
                    country: 'india',
                    max: limit,
                    token: this.apiKey,
                },
            }
            );
            const news = data.articles || [];
            console.log(news);
            return news;
        } catch (error) {
            console.error("News Service Error:", error);
            return [];
        }
    }
    async searchCompaniesNews(query, limit=5) {
        try {
            const {data} = await axios.get(`${this.baseURL}/search`, {
                params: {
                    q: query,
                    lang: 'en',
                    country: 'india',
                    max: limit,
                    token: this.apiKey,
                },
            });
            console.log("GNews response:", data);
            const news = data.articles || [];
            console.log(news);
            return news;
        } catch (error) {
            console.error("News Service Error:", error);
            return [];
        }
    }
}
module.exports = new NewsService();