import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { LayoutDashboard, Package, Calendar, MessageSquare, ArrowLeft, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/trips', label: 'Trips', icon: Package },
    { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { path: '/admin/contacts', label: 'Messages', icon: MessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 fixed h-full" data-testid="admin-sidebar">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-stone-900 mb-8">Admin Panel</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-teal-100 text-teal-700 font-semibold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                  data-testid={`admin-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 space-y-2">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full justify-start gap-3 text-stone-600"
              data-testid="admin-back-to-site"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Site
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-stone-600"
              data-testid="admin-logout"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
