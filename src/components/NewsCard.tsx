import { Clock, TrendingUp, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NewsCardProps {
  article: {
    id: number | string;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    trending: boolean;
    url?: string;
    source?: { name: string };
    content?: string;
  };
  showEditButton?: boolean;
}

const NewsCard = ({ article, showEditButton = true }: NewsCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Navigate to editor with article data
    navigate(`/editor/new?source=${encodeURIComponent(JSON.stringify({
      title: article.title,
      description: article.excerpt,
      url: article.url,
      source: article.source,
      content: article.content
    }))}`);
  };

  // When user clicks the news block, open editorial with article data
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/editor/new?source=${encodeURIComponent(JSON.stringify({
      title: article.title,
      description: article.excerpt,
      url: article.url,
      source: article.source,
      content: article.content
    }))}`);
  };

  return (
    <div className="group relative">
      <div onClick={handleCardClick} className="block cursor-pointer">
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-roboto">{article.category}</span>
            {article.trending && (
              <div className="flex items-center text-black">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-xs font-roboto">Trending</span>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-black mb-3 font-poppins group-hover:text-gray-800">
            {article.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 font-roboto line-clamp-3">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500 font-roboto">
              <Clock className="h-4 w-4 mr-1" />
              {article.readTime}
            </div>
            
            {article.source && (
              <span className="text-xs text-gray-400 font-roboto">
                {article.source.name}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {showEditButton && (
        <Button
          onClick={handleEditClick}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white hover:bg-gray-800 p-2 h-8 w-8"
          size="sm"
        >
          <Edit className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default NewsCard;
