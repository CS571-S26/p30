import { Outlet, NavLink } from 'react-router';
import { MapPin, TrendingUp, Bookmark } from 'lucide-react';

export default function Root() {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* Bottom navigation */}
      <nav className="border-t border-gray-200 bg-white">
        <div className="flex justify-around items-center h-16">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-6 py-2 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <MapPin className="size-6" />
            <span className="text-xs">Map</span>
          </NavLink>

          <NavLink
            to="/trends"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-6 py-2 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <TrendingUp className="size-6" />
            <span className="text-xs">Trends</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-6 py-2 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <Bookmark className="size-6" />
            <span className="text-xs">Saved</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
