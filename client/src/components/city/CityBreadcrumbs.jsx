import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const CityBreadcrumbs = ({ city }) => {
  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center space-x-2 text-sm">
          <Link 
            to="/" 
            className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link 
            to="/discover" 
            className="text-gray-600 hover:text-pink-600 transition-colors"
          >
            Discover
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">
            Dating in {city}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default CityBreadcrumbs;
