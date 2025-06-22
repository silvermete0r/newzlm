
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "bg-gray-100" : "";
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-black font-poppins">
              NewzLM
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-roboto ${isActive("/")}`}
            >
              Home
            </Link>
            <Link
              to="/news"
              className={`text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-roboto ${isActive("/news")}`}
            >
              News
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-roboto ${isActive("/dashboard")}`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 font-roboto">{user?.email}</span>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="border-black text-black hover:bg-gray-50 font-roboto"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" className="border-black text-black hover:bg-gray-50 font-roboto">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
