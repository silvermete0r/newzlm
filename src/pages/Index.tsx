
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Globe, Users, BookOpen, Plane, Palette, Film, Microscope, Heart, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import WordCloud from "@/components/WordCloud";
import NewsCard from "@/components/NewsCard";
import Header from "@/components/Header";
import { fetchTopNews, fetchHackerNews, generateWordCloudData, NewsArticle, HackerNewsItem } from "@/services/newsService";

const categories = [
  { name: "Business", icon: TrendingUp, color: "text-gray-800" },
  { name: "Technology", icon: Globe, color: "text-gray-800" },
  { name: "Health", icon: Heart, color: "text-gray-800" },
  { name: "Science", icon: Microscope, color: "text-gray-800" },
  { name: "Sports", icon: Users, color: "text-gray-800" },
  { name: "Entertainment", icon: Film, color: "text-gray-800" },
  { name: "General", icon: BookOpen, color: "text-gray-800" },
];

const Index = () => {
  const [wordCloudData, setWordCloudData] = useState([
    { text: "Technology", value: 100 },
    { text: "Innovation", value: 80 },
    { text: "Central Asia", value: 90 },
    { text: "Education", value: 70 },
    { text: "Startups", value: 85 },
    { text: "Digital", value: 75 },
    { text: "Culture", value: 60 },
    { text: "Travel", value: 65 }
  ]);
  const [trendingNews, setTrendingNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNewsData = async () => {
      try {
        setIsLoading(true);
        const [newsArticles, hackerNewsItems] = await Promise.all([
          fetchTopNews(),
          fetchHackerNews()
        ]);
        
        setTrendingNews(newsArticles.slice(0, 6)); // Show top 6 articles
        
        // Generate word cloud from real news
        const wordData = generateWordCloudData(newsArticles, hackerNewsItems);
        if (wordData.length > 0) {
          setWordCloudData(wordData);
        }
      } catch (error) {
        console.error('Error loading news data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNewsData();
  }, []);

  // Convert NewsArticle to NewsCard format
  const formattedNews = trendingNews.map((article, index) => ({
    id: article.id,
    title: article.title,
    excerpt: article.description || '',
    category: article.category || 'General',
    readTime: `${Math.ceil((article.content || article.description || '').split(' ').length / 200)} min read`,
    trending: index < 3, // First 3 are trending
    url: article.url,
    source: article.source,
    content: article.content
  }));

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-black mb-4 font-poppins">
            NewzLM
          </h1>
          <p className="text-xl text-gray-600 mb-8 font-roboto max-w-3xl mx-auto">
            AI-powered journalism platform powered by LLAMA3. Transform real-time news into engaging content with collaborative intelligence.
          </p>
          <div className="flex justify-center gap-4 mb-12">
            <Link to="/login">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg font-roboto">
                <Sparkles className="h-5 w-5 mr-2" />
                Start Creating
              </Button>
            </Link>
            <Link to="/news">
              <Button variant="outline" className="border-black text-black hover:bg-gray-50 px-8 py-3 text-lg font-roboto">
                Explore News
              </Button>
            </Link>
          </div>
          
          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-black" />
              </div>
              <h3 className="font-semibold text-black font-poppins mb-2">Real-Time News</h3>
              <p className="text-gray-600 font-roboto text-sm">Live news from NewsAPI and tech updates from Hacker News</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-black" />
              </div>
              <h3 className="font-semibold text-black font-poppins mb-2">AI Generation</h3>
              <p className="text-gray-600 font-roboto text-sm">LLAMA3-powered content generation and enhancement</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-black" />
              </div>
              <h3 className="font-semibold text-black font-poppins mb-2">Collaborative</h3>
              <p className="text-gray-600 font-roboto text-sm">Editorial workflow with moderation and publishing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Word Cloud Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-black text-center mb-8 font-poppins">
            Today's Trending Topics
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <div className="text-gray-600 font-roboto">Loading trending topics...</div>
            </div>
          ) : (
            <WordCloud data={wordCloudData} />
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-black text-center mb-12 font-poppins">
            News Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/news?category=${category.name.toLowerCase()}`}
                className="group p-6 border border-gray-200 rounded-lg hover:border-black hover:shadow-lg transition-all duration-300"
              >
                <category.icon className={`h-8 w-8 ${category.color} mb-3 group-hover:scale-110 transition-transform`} />
                <h3 className="font-semibold text-black font-roboto group-hover:text-gray-800">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot & Trending News */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-black font-poppins">
              <Sparkles className="inline-block mr-2 h-8 w-8" />
              Hot & Trending Today
            </h2>
            <Link to="/news" className="text-black hover:text-gray-600 font-roboto">
              View All →
            </Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formattedNews.map((article) => (
                <NewsCard key={article.id} article={article} showEditButton={true} />
              ))}
            </div>
          )}
          
          {!isLoading && formattedNews.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 font-roboto mb-4">
                No news available. Please add your NewsAPI key to see real news data.
              </p>
              <Link to="/news">
                <Button className="bg-black text-white hover:bg-gray-800 font-roboto">
                  Go to News Page
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 font-roboto">
            © 2024 NewzLM. Empowering journalists through AI-powered collaborative intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
