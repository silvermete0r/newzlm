
import { useParams } from "react-router-dom";
import { Clock, Share, Bookmark, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const ArticlePage = () => {
  const { id } = useParams();

  const mockArticle = {
    id: Number(id),
    title: "AI Revolution Transforms Central Asian Startups",
    content: `The startup ecosystem across Central Asia is experiencing an unprecedented transformation as artificial intelligence technologies reshape the entrepreneurial landscape.

## Revolutionary Changes

The integration of AI in startup operations has led to significant improvements in efficiency and innovation across the region.

### Key Developments

**Kazakhstan's Tech Hub**
Kazakhstan has emerged as a leading destination for AI-powered startups, with Almaty hosting over 200 technology companies specializing in machine learning and automation.

**Uzbekistan's Digital Revolution**
The Uzbek government's progressive policies have attracted international investors, leading to a surge in AI startup funding exceeding $50 million in 2024.

### Success Stories

Several startups have already made significant impacts:
- **TechCentral**: An AI-powered logistics platform serving the entire region
- **EduBot**: Educational technology company using natural language processing
- **HealthAI**: Medical diagnosis assistance platform

## Future Outlook

Industry experts predict that Central Asian AI startups will continue to grow exponentially, potentially becoming key players in the global technology market by 2030.

The combination of government support, international investment, and local talent creates an ideal environment for continued innovation and growth.`,
    author: "NewzLM Editorial Team",
    publishedDate: "December 22, 2024",
    readTime: "7 min read",
    category: "Startups",
    views: "2.3k"
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-roboto">
              {mockArticle.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 font-poppins leading-tight">
            {mockArticle.title}
          </h1>
          
          <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-gray-600 font-roboto">
            <div className="flex items-center space-x-4">
              <span>By {mockArticle.author}</span>
              <span>•</span>
              <span>{mockArticle.publishedDate}</span>
              <span>•</span>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {mockArticle.readTime}
              </div>
              <span>•</span>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {mockArticle.views} views
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="font-roboto">
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="font-roboto">
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none font-roboto">
          {mockArticle.content.split('\n').map((line, index) => {
            if (line.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl font-bold text-black mb-4 mt-8 font-poppins">
                  {line.substring(3)}
                </h2>
              );
            }
            if (line.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl font-semibold text-black mb-3 mt-6 font-poppins">
                  {line.substring(4)}
                </h3>
              );
            }
            if (line.startsWith('**') && line.endsWith('**')) {
              return (
                <p key={index} className="text-black font-semibold mb-2 mt-4">
                  {line.substring(2, line.length - 2)}
                </p>
              );
            }
            if (line.startsWith('- ')) {
              return (
                <li key={index} className="text-gray-700 mb-1 ml-4">
                  {line.substring(2)}
                </li>
              );
            }
            if (line.trim() === '') {
              return <br key={index} />;
            }
            return (
              <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-roboto">
              Generated with NewzLM AI assistance • Reviewed by editorial team
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="font-roboto">
                <Share className="h-4 w-4 mr-1" />
                Share Article
              </Button>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default ArticlePage;
