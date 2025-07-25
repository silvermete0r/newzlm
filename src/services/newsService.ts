import axios from 'axios';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  category?: string;
  content?: string;
}

export interface HackerNewsItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
  descendants?: number;
}

// NewsAPI configuration
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Optionally, throw if NEWS_API_KEY is not set
if (!NEWS_API_KEY) {
  throw new Error('VITE_NEWS_API_KEY environment variable is not set.');
}

export const fetchTopNews = async (category?: string): Promise<NewsArticle[]> => {
  if (!NEWS_API_KEY) {
    return getMockNews();
  }
  try {
    const endpoint = category && category !== 'all' 
      ? `${NEWS_API_BASE_URL}/top-headlines`
      : `${NEWS_API_BASE_URL}/top-headlines`;
    
    const params: any = {
      apiKey: NEWS_API_KEY,
      language: 'en',
      pageSize: 20,
    };

    if (category && category !== 'all') {
      params.category = category;
    } else {
      params.country = 'us';
    }

    const response = await axios.get(endpoint, { params });
    
    return response.data.articles.map((article: any, index: number) => ({
      id: `news-${index}-${Date.now()}`,
      title: article.title,
      description: article.description || '',
      url: article.url,
      urlToImage: article.urlToImage || '/placeholder.svg',
      publishedAt: article.publishedAt,
      source: article.source,
      category: category || 'General',
      content: article.content || article.description || ''
    }));
  } catch (error) {
    console.error('Error fetching NewsAPI:', error);
    // Fallback to mock data
    return getMockNews();
  }
};

export const searchNews = async (query: string): Promise<NewsArticle[]> => {
  if (!NEWS_API_KEY) {
    // Use mock data if API key is missing
    return getMockNews();
  }
  try {
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        apiKey: NEWS_API_KEY,
        q: query,
        language: 'en',
        sortBy: 'relevancy',
        pageSize: 20,
      }
    });
    
    return response.data.articles.map((article: any, index: number) => ({
      id: `search-${index}-${Date.now()}`,
      title: article.title,
      description: article.description || '',
      url: article.url,
      urlToImage: article.urlToImage || '/placeholder.svg',
      publishedAt: article.publishedAt,
      source: article.source,
      category: 'Search Result',
      content: article.content || article.description || ''
    }));
  } catch (error) {
    console.error('Error searching news:', error);
    return [];
  }
};

export const fetchHackerNews = async (): Promise<HackerNewsItem[]> => {
  try {
    const topStoriesResponse = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topStoryIds = topStoriesResponse.data.slice(0, 10);
    
    const stories = await Promise.all(
      topStoryIds.map(async (id: number) => {
        const storyResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return storyResponse.data;
      })
    );
    
    return stories.filter(story => story && story.title);
  } catch (error) {
    console.error('Error fetching Hacker News:', error);
    return [];
  }
};

export const generateWordCloudData = (articles: NewsArticle[], hackerNews: HackerNewsItem[]) => {
  const words: { [key: string]: number } = {};
  
  // Process NewsAPI articles
  articles.forEach(article => {
    const text = `${article.title} ${article.description || ''}`.toLowerCase();
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    
    const wordArray = text.match(/\b[a-z]{3,}\b/g) || [];
    wordArray.forEach(word => {
      if (!commonWords.includes(word)) {
        words[word] = (words[word] || 0) + 1;
      }
    });
  });
  
  // Process Hacker News articles
  hackerNews.forEach(item => {
    const text = item.title.toLowerCase();
    const wordArray = text.match(/\b[a-z]{3,}\b/g) || [];
    wordArray.forEach(word => {
      if (!['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word)) {
        words[word] = (words[word] || 0) + 1;
      }
    });
  });
  
  return Object.entries(words)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([text, value]) => ({ text: text.charAt(0).toUpperCase() + text.slice(1), value }));
};

// AI Generation using LLAMA3 (now via local API)
export const generateArticleWithAI = async (
  newsArticle: NewsArticle,
  prompt?: string
): Promise<{ title: string; content: string }> => {
  try {
    const systemPrompt =
      prompt ||
      `You are a professional journalist. Generate a comprehensive article based on the provided news information. 
      Focus on Central Asian perspectives and regional relevance when possible. 
      Write in a clear, engaging style suitable for NewzLM publication.`;

    let url = "";
    if (newsArticle.url && typeof newsArticle.url === "string" && newsArticle.url.startsWith("http")) {
      url = newsArticle.url;
    } else if (
      newsArticle.content &&
      typeof newsArticle.content === "string" &&
      newsArticle.content.startsWith("http")
    ) {
      url = newsArticle.content;
    }

    const queryUrl = `http://localhost:8000/generate_article?system_prompt=${encodeURIComponent(systemPrompt)}&url=${encodeURIComponent(url)}`;
    console.log("[AI DEBUG] Query URL:", queryUrl);

    const response = await fetch(queryUrl, { method: "GET" });
    console.log("[AI DEBUG] Response status:", response.status, response.statusText);

    const text = await response.text();
    console.log("[AI DEBUG] Response text:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.error("[AI DEBUG] Failed to parse JSON:", jsonErr);
      throw new Error("AI backend did not return valid JSON. See console for details.");
    }

    return {
      title: data.title || newsArticle.title,
      content: data.content || ""
    };
  } catch (error) {
    console.error("Error generating article:", error);
    throw new Error("Failed to generate article. Please try again.");
  }
};

// Mock data fallback
const getMockNews = (): NewsArticle[] => [
  {
    id: '1',
    title: 'AI Revolution Transforms Central Asian Tech Startups',
    description: 'Kazakhstan and Uzbekistan lead the region in AI adoption for business transformation.',
    url: 'https://example.com/ai-central-asia',
    urlToImage: '/placeholder.svg',
    publishedAt: new Date().toISOString(),
    source: { name: 'Tech Central Asia' },
    category: 'Technology'
  },
  {
    id: '2',
    title: 'Digital Education Reform Launches Across Kyrgyzstan',
    description: 'New digital learning initiatives aim to modernize education infrastructure.',
    url: 'https://example.com/education-reform',
    urlToImage: '/placeholder.svg',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: 'Education Today' },
    category: 'Education'
  },
  {
    id: '3',
    title: 'Renewable Energy Projects Expand in Turkmenistan',
    description: 'Turkmenistan invests in solar and wind energy to diversify its energy sector.',
    url: 'https://example.com/renewable-turkmenistan',
    urlToImage: '/placeholder.svg',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: 'Energy News' },
    category: 'Energy'
  },
  {
    id: '4',
    title: 'Uzbekistan Hosts Regional Tech Conference',
    description: 'Leaders from Central Asia gather to discuss digital transformation and innovation.',
    url: 'https://example.com/uzbekistan-tech-conference',
    urlToImage: '/placeholder.svg',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    source: { name: 'Central Asia Times' },
    category: 'Technology'
  },
  {
    id: '5',
    title: 'Kazakhstan Launches New Space Satellite',
    description: 'The new satellite aims to improve telecommunications and internet access.',
    url: 'https://example.com/kazakhstan-satellite',
    urlToImage: '/placeholder.svg',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    source: { name: 'Space Daily' },
    category: 'Science'
  },
  {
    id: '6',
    title: 'Tajikistan Improves Water Management Systems',
    description: 'Modern irrigation and water-saving technologies introduced in rural areas.',
    url: 'https://example.com/tajikistan-water',
    urlToImage: '/placeholder.svg',
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    source: { name: 'Agri News' },
    category: 'Environment'
  }
];