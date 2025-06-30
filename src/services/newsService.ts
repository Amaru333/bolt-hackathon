import { NewsArticle } from "../types/news";

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    source: {
      id?: string;
      name: string;
    };
    author?: string;
    title: string;
    description?: string;
    url: string;
    urlToImage?: string;
    publishedAt: string;
    content?: string;
  }>;
}

interface GeocodingResult {
  lat: number;
  lon: number;
  country: string;
  state?: string;
  city?: string;
}

class NewsService {
  private apiKey = import.meta.env.VITE_NEWS_API_KEY || "";
  private geocodingCache = new Map<string, GeocodingResult>();
  
  // Major world cities with coordinates for fallback location mapping
  private cityCoordinates = new Map([
    ["new york", { lat: 40.7128, lng: -74.0060, country: "United States", region: "New York" }],
    ["london", { lat: 51.5074, lng: -0.1278, country: "United Kingdom", region: "London" }],
    ["paris", { lat: 48.8566, lng: 2.3522, country: "France", region: "Paris" }],
    ["tokyo", { lat: 35.6762, lng: 139.6503, country: "Japan", region: "Tokyo" }],
    ["beijing", { lat: 39.9042, lng: 116.4074, country: "China", region: "Beijing" }],
    ["moscow", { lat: 55.7558, lng: 37.6176, country: "Russia", region: "Moscow" }],
    ["delhi", { lat: 28.7041, lng: 77.1025, country: "India", region: "Delhi" }],
    ["mumbai", { lat: 19.0760, lng: 72.8777, country: "India", region: "Mumbai" }],
    ["sydney", { lat: -33.8688, lng: 151.2093, country: "Australia", region: "Sydney" }],
    ["toronto", { lat: 43.6532, lng: -79.3832, country: "Canada", region: "Toronto" }],
    ["berlin", { lat: 52.5200, lng: 13.4050, country: "Germany", region: "Berlin" }],
    ["madrid", { lat: 40.4168, lng: -3.7038, country: "Spain", region: "Madrid" }],
    ["rome", { lat: 41.9028, lng: 12.4964, country: "Italy", region: "Rome" }],
    ["cairo", { lat: 30.0444, lng: 31.2357, country: "Egypt", region: "Cairo" }],
    ["lagos", { lat: 6.5244, lng: 3.3792, country: "Nigeria", region: "Lagos" }],
    ["johannesburg", { lat: -26.2041, lng: 28.0473, country: "South Africa", region: "Johannesburg" }],
    ["buenos aires", { lat: -34.6118, lng: -58.3960, country: "Argentina", region: "Buenos Aires" }],
    ["mexico city", { lat: 19.4326, lng: -99.1332, country: "Mexico", region: "Mexico City" }],
    ["sao paulo", { lat: -23.5505, lng: -46.6333, country: "Brazil", region: "São Paulo" }],
    ["seoul", { lat: 37.5665, lng: 126.9780, country: "South Korea", region: "Seoul" }],
    ["bangkok", { lat: 13.7563, lng: 100.5018, country: "Thailand", region: "Bangkok" }],
    ["singapore", { lat: 1.3521, lng: 103.8198, country: "Singapore", region: "Singapore" }],
    ["dubai", { lat: 25.2048, lng: 55.2708, country: "United Arab Emirates", region: "Dubai" }],
    ["istanbul", { lat: 41.0082, lng: 28.9784, country: "Turkey", region: "Istanbul" }],
    ["washington", { lat: 38.9072, lng: -77.0369, country: "United States", region: "Washington DC" }],
    ["los angeles", { lat: 34.0522, lng: -118.2437, country: "United States", region: "Los Angeles" }],
    ["chicago", { lat: 41.8781, lng: -87.6298, country: "United States", region: "Chicago" }],
    ["miami", { lat: 25.7617, lng: -80.1918, country: "United States", region: "Miami" }],
    ["san francisco", { lat: 37.7749, lng: -122.4194, country: "United States", region: "San Francisco" }],
  ]);

  private countryCoordinates = new Map([
    ["united states", { lat: 39.8283, lng: -98.5795, country: "United States", region: "United States" }],
    ["china", { lat: 35.8617, lng: 104.1954, country: "China", region: "China" }],
    ["india", { lat: 20.5937, lng: 78.9629, country: "India", region: "India" }],
    ["russia", { lat: 61.5240, lng: 105.3188, country: "Russia", region: "Russia" }],
    ["brazil", { lat: -14.2350, lng: -51.9253, country: "Brazil", region: "Brazil" }],
    ["united kingdom", { lat: 55.3781, lng: -3.4360, country: "United Kingdom", region: "United Kingdom" }],
    ["france", { lat: 46.2276, lng: 2.2137, country: "France", region: "France" }],
    ["germany", { lat: 51.1657, lng: 10.4515, country: "Germany", region: "Germany" }],
    ["japan", { lat: 36.2048, lng: 138.2529, country: "Japan", region: "Japan" }],
    ["canada", { lat: 56.1304, lng: -106.3468, country: "Canada", region: "Canada" }],
    ["australia", { lat: -25.2744, lng: 133.7751, country: "Australia", region: "Australia" }],
    ["italy", { lat: 41.8719, lng: 12.5674, country: "Italy", region: "Italy" }],
    ["spain", { lat: 40.4637, lng: -3.7492, country: "Spain", region: "Spain" }],
    ["mexico", { lat: 23.6345, lng: -102.5528, country: "Mexico", region: "Mexico" }],
    ["south korea", { lat: 35.9078, lng: 127.7669, country: "South Korea", region: "South Korea" }],
    ["turkey", { lat: 38.9637, lng: 35.2433, country: "Turkey", region: "Turkey" }],
    ["argentina", { lat: -38.4161, lng: -63.6167, country: "Argentina", region: "Argentina" }],
    ["south africa", { lat: -30.5595, lng: 22.9375, country: "South Africa", region: "South Africa" }],
    ["egypt", { lat: 26.8206, lng: 30.8025, country: "Egypt", region: "Egypt" }],
    ["nigeria", { lat: 9.0820, lng: 8.6753, country: "Nigeria", region: "Nigeria" }],
  ]);

  async fetchTrendingNews(): Promise<NewsArticle[]> {
    try {
      if (!this.apiKey) {
        console.warn("News API key not configured. Using fallback news data.");
        return this.getFallbackNewsData();
      }

      // Fetch top headlines from multiple categories
      const categories = ["general", "business", "technology", "health", "science", "sports", "entertainment"];
      const allArticles: NewsArticle[] = [];

      for (const category of categories) {
        try {
          const response = await fetch(
            `https://newsapi.org/v2/top-headlines?category=${category}&pageSize=10&apiKey=${this.apiKey}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "User-Agent": "WorldInAMap/1.0",
              },
              signal: AbortSignal.timeout(10000),
            }
          );

          if (response.ok) {
            const data = (await response.json()) as NewsAPIResponse;
            
            if (data.articles && data.articles.length > 0) {
              const processedArticles = await Promise.all(
                data.articles.slice(0, 8).map(async (article, index) => {
                  const location = await this.extractLocationFromArticle(article);
                  const trendingScore = this.calculateTrendingScore(article, category, index);
                  
                  return {
                    id: `news-${category}-${index}-${Date.now()}`,
                    title: article.title,
                    description: article.description || "No description available",
                    content: article.content,
                    url: article.url,
                    urlToImage: article.urlToImage,
                    publishedAt: article.publishedAt,
                    source: article.source,
                    author: article.author,
                    location,
                    trendingScore,
                    category,
                    language: "en",
                  } as NewsArticle;
                })
              );
              
              allArticles.push(...processedArticles);
            }
          } else {
            console.warn(`News API error for category ${category}: ${response.status}`);
          }
        } catch (categoryError) {
          console.warn(`Error fetching news for category ${category}:`, categoryError);
        }
      }

      // If we got some real data, return it; otherwise use fallback
      if (allArticles.length > 0) {
        return allArticles.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 50);
      } else {
        console.log("No news data available, using fallback data");
        return this.getFallbackNewsData();
      }
    } catch (error) {
      console.error("Error fetching trending news:", error);
      return this.getFallbackNewsData();
    }
  }

  private async extractLocationFromArticle(article: any): Promise<NewsArticle["location"]> {
    // Try to extract location from title and description
    const text = `${article.title} ${article.description || ""}`.toLowerCase();
    
    // Check for city mentions first
    for (const [city, coords] of this.cityCoordinates) {
      if (text.includes(city)) {
        return coords;
      }
    }
    
    // Check for country mentions
    for (const [country, coords] of this.countryCoordinates) {
      if (text.includes(country)) {
        return coords;
      }
    }
    
    // Check source name for location hints
    const sourceName = article.source.name.toLowerCase();
    for (const [location, coords] of this.cityCoordinates) {
      if (sourceName.includes(location) || sourceName.includes(coords.country.toLowerCase())) {
        return coords;
      }
    }
    
    // Default to a random major city if no location found
    const cities = Array.from(this.cityCoordinates.values());
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private calculateTrendingScore(article: any, category: string, index: number): number {
    let score = 100 - (index * 10); // Base score based on position in results
    
    // Boost score based on category importance
    const categoryBoosts = {
      general: 20,
      business: 15,
      technology: 15,
      health: 10,
      science: 10,
      sports: 5,
      entertainment: 5,
    };
    
    score += categoryBoosts[category as keyof typeof categoryBoosts] || 0;
    
    // Boost based on recency
    const publishedDate = new Date(article.publishedAt);
    const hoursAgo = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 6) score += 20;
    else if (hoursAgo < 24) score += 10;
    else if (hoursAgo < 48) score += 5;
    
    // Boost based on title length and content quality
    if (article.title && article.title.length > 50) score += 5;
    if (article.description && article.description.length > 100) score += 5;
    if (article.urlToImage) score += 5;
    
    return Math.min(Math.max(score, 1), 100);
  }

  private getFallbackNewsData(): NewsArticle[] {
    const fallbackNews = [
      {
        title: "Global Climate Summit Reaches Historic Agreement",
        description: "World leaders unite on ambitious climate targets for 2030, marking a significant step in environmental policy.",
        category: "general",
        location: this.cityCoordinates.get("paris")!,
        trendingScore: 95,
        source: { name: "Global News Network" },
      },
      {
        title: "Breakthrough in Quantum Computing Technology",
        description: "Scientists achieve new milestone in quantum processing, potentially revolutionizing computing industry.",
        category: "technology",
        location: this.cityCoordinates.get("tokyo")!,
        trendingScore: 90,
        source: { name: "Tech Today" },
      },
      {
        title: "Major Economic Policy Changes Announced",
        description: "Central banks coordinate new monetary policies affecting global markets and trade relationships.",
        category: "business",
        location: this.cityCoordinates.get("new york")!,
        trendingScore: 85,
        source: { name: "Financial Times" },
      },
      {
        title: "Revolutionary Medical Treatment Shows Promise",
        description: "Clinical trials demonstrate significant success in treating previously incurable conditions.",
        category: "health",
        location: this.cityCoordinates.get("london")!,
        trendingScore: 80,
        source: { name: "Medical Journal" },
      },
      {
        title: "Space Exploration Mission Achieves New Milestone",
        description: "International space station receives new research modules, expanding scientific capabilities.",
        category: "science",
        location: this.cityCoordinates.get("moscow")!,
        trendingScore: 75,
        source: { name: "Space News" },
      },
      {
        title: "International Sports Championship Breaks Records",
        description: "Athletes from around the world compete in record-breaking performances at global championship.",
        category: "sports",
        location: this.cityCoordinates.get("beijing")!,
        trendingScore: 70,
        source: { name: "Sports World" },
      },
      {
        title: "Cultural Festival Celebrates Global Diversity",
        description: "Annual international festival showcases art, music, and traditions from cultures worldwide.",
        category: "entertainment",
        location: this.cityCoordinates.get("berlin")!,
        trendingScore: 65,
        source: { name: "Culture Today" },
      },
      {
        title: "Renewable Energy Project Powers Entire City",
        description: "Innovative solar and wind project successfully provides clean energy to major metropolitan area.",
        category: "science",
        location: this.cityCoordinates.get("sydney")!,
        trendingScore: 85,
        source: { name: "Green Energy News" },
      },
      {
        title: "International Trade Agreement Signed",
        description: "Multiple nations agree on new trade policies promoting economic cooperation and growth.",
        category: "business",
        location: this.cityCoordinates.get("singapore")!,
        trendingScore: 80,
        source: { name: "Trade Weekly" },
      },
      {
        title: "Archaeological Discovery Rewrites History",
        description: "Ancient artifacts found in excavation provide new insights into early human civilization.",
        category: "science",
        location: this.cityCoordinates.get("cairo")!,
        trendingScore: 75,
        source: { name: "Archaeology Today" },
      },
      {
        title: "Tech Giants Announce AI Safety Initiative",
        description: "Major technology companies collaborate on artificial intelligence safety standards and regulations.",
        category: "technology",
        location: this.cityCoordinates.get("san francisco")!,
        trendingScore: 88,
        source: { name: "AI Weekly" },
      },
      {
        title: "Global Education Reform Shows Positive Results",
        description: "International education programs demonstrate improved learning outcomes across participating countries.",
        category: "general",
        location: this.cityCoordinates.get("toronto")!,
        trendingScore: 70,
        source: { name: "Education Global" },
      },
      {
        title: "Sustainable Agriculture Initiative Expands",
        description: "Farmers worldwide adopt new sustainable practices, increasing crop yields while protecting environment.",
        category: "science",
        location: this.cityCoordinates.get("sao paulo")!,
        trendingScore: 72,
        source: { name: "Agriculture News" },
      },
      {
        title: "International Film Festival Showcases Emerging Talent",
        description: "Young filmmakers from around the world present innovative stories at prestigious film festival.",
        category: "entertainment",
        location: this.cityCoordinates.get("rome")!,
        trendingScore: 60,
        source: { name: "Cinema World" },
      },
      {
        title: "Global Health Initiative Reduces Disease Rates",
        description: "Coordinated international health programs show significant reduction in preventable diseases.",
        category: "health",
        location: this.cityCoordinates.get("delhi")!,
        trendingScore: 78,
        source: { name: "World Health Report" },
      },
      {
        title: "Ocean Conservation Project Protects Marine Life",
        description: "International marine protection initiative successfully establishes new protected areas for endangered species.",
        category: "science",
        location: this.cityCoordinates.get("miami")!,
        trendingScore: 74,
        source: { name: "Ocean Conservation" },
      },
      {
        title: "Digital Currency Adoption Reaches New Heights",
        description: "Central bank digital currencies gain widespread acceptance, transforming financial transactions globally.",
        category: "business",
        location: this.cityCoordinates.get("seoul")!,
        trendingScore: 82,
        source: { name: "Crypto Finance" },
      },
      {
        title: "International Youth Summit Addresses Global Challenges",
        description: "Young leaders from around the world propose innovative solutions to climate and social issues.",
        category: "general",
        location: this.cityCoordinates.get("madrid")!,
        trendingScore: 68,
        source: { name: "Youth Voice" },
      },
      {
        title: "Smart City Technology Improves Urban Living",
        description: "Advanced IoT systems and AI integration enhance quality of life in major metropolitan areas.",
        category: "technology",
        location: this.cityCoordinates.get("dubai")!,
        trendingScore: 76,
        source: { name: "Smart Cities Today" },
      },
      {
        title: "Global Music Festival Unites Artists Worldwide",
        description: "Musicians from diverse cultures collaborate in unprecedented international music celebration.",
        category: "entertainment",
        location: this.cityCoordinates.get("lagos")!,
        trendingScore: 62,
        source: { name: "Music Global" },
      },
    ];

    return fallbackNews.map((news, index) => ({
      id: `fallback-news-${index}`,
      title: news.title,
      description: news.description,
      content: `${news.description} This is a sample news article for demonstration purposes.`,
      url: "#",
      urlToImage: `https://images.pexels.com/photos/${1000000 + index}/pexels-photo-${1000000 + index}.jpeg?auto=compress&cs=tinysrgb&w=800`,
      publishedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      source: news.source,
      author: "World News Team",
      location: news.location,
      trendingScore: news.trendingScore,
      category: news.category,
      language: "en",
    }));
  }
}

export const newsService = new NewsService();