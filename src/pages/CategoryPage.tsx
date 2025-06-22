import { useParams } from "react-router-dom";
import { useState } from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsCard from "@/components/NewsCard";
import Header from "@/components/Header";
import GoogleTranslateWidget from "@/components/GoogleTranslateWidget";

const CategoryPage = () => {
  const { category } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const mockArticles = [
    {
      id: 1,
      title: `Latest ${category} Developments in Central Asia`,
      excerpt: `Comprehensive coverage of recent ${category} trends and innovations across the region`,
      category: category || "General",
      readTime: "5 min read",
      trending: true
    },
    {
      id: 2,
      title: `${category} Industry Leaders Share Insights`,
      excerpt: `Expert perspectives on the future of ${category} in Kazakhstan and Uzbekistan`,
      category: category || "General",
      readTime: "8 min read",
      trending: false
    },
    {
      id: 3,
      title: `Investment Opportunities in ${category}`,
      excerpt: `Analysis of emerging opportunities and market trends in the ${category} sector`,
      category: category || "General",
      readTime: "6 min read",
      trending: true
    }
  ];

  const filters = [
    { id: "all", label: "All Articles" },
    { id: "trending", label: "Trending" },
    { id: "recent", label: "Most Recent" },
    { id: "popular", label: "Most Popular" }
  ];

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "trending" && article.trending);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white">
      <GoogleTranslateWidget />
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4 font-poppins capitalize">
            {category} News
          </h1>
          <p className="text-xl text-gray-600 font-roboto">
            Stay updated with the latest {category} news and insights from Central Asia
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-roboto"
            />
          </div>
          
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                onClick={() => setSelectedFilter(filter.id)}
                className={`font-roboto ${
                  selectedFilter === filter.id 
                    ? "bg-black text-white hover:bg-gray-800" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-roboto">
              No articles found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
