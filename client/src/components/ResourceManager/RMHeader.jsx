import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, X, Zap, Shield, Settings } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/resourcemanager", icon: Zap },
  { label: "Resources", path: "/resourcemanager/resources", icon: Shield },
  { label: "Orders", path: "/resourcemanager/orders", icon: Zap },
];

const RMHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isDarkMode = false;

  return (
    <>
      <header className="w-full h-20 flex items-center px-6 lg:px-12 xl:px-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-2xl sticky top-0 z-50 backdrop-blur-md border-b border-white/10">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-1/3 w-24 h-24 bg-gradient-to-br from-cyan-300/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Enhanced Logo/Brand Section */}
          <div className="flex items-center gap-4 flex-shrink-0 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Sparkles className="w-7 h-7 text-white animate-spin-slow" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            </div>
            
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
                  Inventory pro
                </h1>
              </div>
              <p className="text-sm font-medium text-emerald-100 tracking-wide">
                Smart Inventory Management System
              </p>
            </div>
          </div>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-white to-blue-50 text-emerald-700 shadow-xl ring-2 ring-white/50"
                      : "text-white hover:bg-white/20 hover:shadow-lg"
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <IconComponent className={`w-4 h-4 transition-transform duration-300 ${
                    location.pathname === item.path ? 'text-emerald-600' : 'text-white/80 group-hover:scale-110'
                  }`} />
                  {item.label}
                  
                  {/* Active indicator */}
                  {location.pathname === item.path && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Enhanced Mobile Menu Button */}
          <div className="lg:hidden relative">
            <button
              className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-105 bg-white/10 backdrop-blur-sm border border-white/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-black/50 backdrop-blur-md z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 shadow-2xl mx-4 mt-4 rounded-2xl overflow-hidden border border-white/20">
            <div className="p-6 space-y-3">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-white to-blue-50 text-emerald-700 shadow-xl"
                        : "text-white hover:bg-white/20 hover:shadow-lg"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className={`p-2 rounded-lg ${
                      location.pathname === item.path 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-white/10 text-white'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-lg">{item.label}</span>
                    
                    {location.pathname === item.path && (
                      <div className="ml-auto w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile menu footer */}
            <div className="px-6 py-4 bg-black/20 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">ResourcePro</p>
                  <p className="text-xs text-emerald-200">v2.1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </>
  );
};

export default RMHeader;