import { useState, useEffect } from "react";
import { Search, Filter, TrendingUp, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsCard from "@/components/NewsCard";
import Header from "@/components/Header";
import GoogleTranslateWidget from "@/components/GoogleTranslateWidget";
import { fetchTopNews, searchNews, NewsArticle } from "@/services/newsService";
import { useToast } from "@/hooks/use-toast";

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const categories = [
    "all", "business", "entertainment", "health", "science", 
    "sports", "technology", "general"
  ];

  const sortOptions = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "recent", label: "Most Recent", icon: Calendar },
    { id: "popular", label: "Most Popular", icon: Star }
  ];

  const loadNews = async (category: string = selectedCategory) => {
    try {
      setIsLoading(true);
      const newsData = await fetchTopNews(category === 'all' ? undefined : category);
      setArticles(newsData);
    } catch (error) {
      console.error('Error loading news:', error);
      toast({
        title: "Error Loading News",
        description: "Failed to load news articles. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadNews();
      return;
    }

    try {
      setIsSearching(true);
      const searchResults = await searchNews(searchTerm);
      setArticles(searchResults);
      
      if (searchResults.length === 0) {
        toast({
          title: "No Results",
          description: "No articles found for your search query.",
        });
      }
    } catch (error) {
      console.error('Error searching news:', error);
      toast({
        title: "Search Error",
        description: "Failed to search articles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const filteredNews = articles.filter(article => {
    if (searchTerm) return true; // If searching, show search results
    const matchesCategory = selectedCategory === "all" || 
                           (article.category && article.category.toLowerCase() === selectedCategory);
    return matchesCategory;
  });

  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
    if (sortBy === "popular") {
      return (b.source?.name || '').localeCompare(a.source?.name || '');
    }
    return 0; // trending - keep original order
  });

  // Convert NewsArticle to NewsCard format
  const formattedNews = sortedNews.map(article => ({
    id: article.id,
    title: article.title,
    excerpt: article.description || '',
    category: article.category || 'General',
    readTime: `${Math.ceil((article.content || article.description || '').split(' ').length / 200)} min read`,
    trending: Math.random() > 0.7, // Random trending for demo
    url: article.url,
    source: article.source,
    content: article.content
  }));

  return (
    <div className="min-h-screen bg-white">
      <GoogleTranslateWidget />
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4 font-poppins">
            Live News Feed
          </h1>
          <p className="text-xl text-gray-600 font-roboto">
            Real-time news from around the world powered by NewsAPI
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={sortBy === option.id ? "default" : "outline"}
                  onClick={() => setSortBy(option.id)}
                  className={`flex-1 font-roboto ${
                    sortBy === option.id 
                      ? "bg-black text-white hover:bg-gray-800" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <option.icon className="h-4 w-4 mr-1" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* API Key Notice */}
        {articles.length === 0 && !isLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-roboto">
              <strong>Note:</strong> To see real news data, please add your NewsAPI key to the newsService.ts file. 
              Get your free API key at <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" className="underline">newsapi.org</a>
            </p>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 font-roboto">
            {isLoading ? "Loading..." : `Showing ${formattedNews.length} articles`}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {!isLoading && formattedNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-roboto text-lg">
              No articles found matching your criteria.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSortBy("trending");
                loadNews("all");
              }}
              className="mt-4 bg-black text-white hover:bg-gray-800 font-roboto"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
