import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { MapPin, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/trips', label: 'Trips' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
            <div className="p-2 bg-teal-700 rounded-lg group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-stone-900">TripCraft</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={`text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-teal-700'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Button
                    onClick={() => navigate('/admin/dashboard')}
                    variant="ghost"
                    className="gap-2"
                    data-testid="nav-admin-dashboard"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                )}
                <Button
                  onClick={() => navigate('/my-bookings')}
                  variant="ghost"
                  className="gap-2"
                  data-testid="nav-my-bookings"
                >
                  <User className="w-4 h-4" />
                  My Bookings
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="gap-2 text-stone-600 hover:text-stone-900"
                  data-testid="nav-logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  data-testid="nav-login"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                  data-testid="nav-register"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-stone-900"
            data-testid="nav-mobile-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200" data-testid="nav-mobile-menu">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium ${
                    isActive(link.path) ? 'text-teal-700' : 'text-stone-600'
                  }`}
                  data-testid={`nav-mobile-link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('/admin/dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-base font-medium text-stone-600"
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigate('/my-bookings');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-base font-medium text-stone-600"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-base font-medium text-stone-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-base font-medium text-stone-600"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-base font-medium text-orange-500"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
