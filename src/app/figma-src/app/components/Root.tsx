import { Outlet, Link, useLocation } from "react-router";
import { Home, Compass, Settings } from "lucide-react";

export function Root() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Outlet />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
                isActive("/") ? "" : "text-zinc-400 hover:text-zinc-200"
              }`}
              style={isActive("/") ? { color: 'hsl(25 85% 60%)' } : {}}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs">Now Playing</span>
            </Link>
            
            <Link
              to="/discovery"
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
                isActive("/discovery") ? "" : "text-zinc-400 hover:text-zinc-200"
              }`}
              style={isActive("/discovery") ? { color: 'hsl(25 85% 60%)' } : {}}
            >
              <Compass className="w-6 h-6" />
              <span className="text-xs">Discovery</span>
            </Link>
            
            <Link
              to="/settings"
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
                isActive("/settings") ? "" : "text-zinc-400 hover:text-zinc-200"
              }`}
              style={isActive("/settings") ? { color: 'hsl(25 85% 60%)' } : {}}
            >
              <Settings className="w-6 h-6" />
              <span className="text-xs">Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}