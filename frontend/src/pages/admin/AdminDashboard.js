import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import { Card } from '../../components/ui/card';
import { Package, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Trips',
      value: stats?.total_trips || 0,
      icon: Package,
      color: 'bg-teal-100 text-teal-700',
      link: '/admin/trips',
    },
    {
      title: 'Total Bookings',
      value: stats?.total_bookings || 0,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-700',
      link: '/admin/bookings',
    },
    {
      title: 'Pending Bookings',
      value: stats?.pending_bookings || 0,
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-700',
      link: '/admin/bookings',
    },
    {
      title: 'Contact Messages',
      value: stats?.total_contacts || 0,
      icon: MessageSquare,
      color: 'bg-pink-100 text-pink-700',
      link: '/admin/contacts',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* Header */}
        <div className="mb-12" data-testid="admin-dashboard-header">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Admin Dashboard
          </h1>
          <p className="text-stone-600">Manage your travel platform</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center text-stone-600">Loading dashboard...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" data-testid="admin-dashboard-stats">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link key={index} to={stat.link}>
                  <Card
                    className="p-6 border border-stone-200 hover:shadow-lg transition-all cursor-pointer group"
                    data-testid={`stat-card-${index}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-stone-900 mb-1" data-testid="stat-value">
                      {stat.value}
                    </div>
                    <div className="text-sm text-stone-600">{stat.title}</div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6" data-testid="admin-dashboard-actions">
          <Link to="/admin/trips">
            <Card className="p-8 border border-stone-200 hover:shadow-lg transition-all cursor-pointer group">
              <Package className="w-12 h-12 text-teal-700 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Manage Trips</h3>
              <p className="text-stone-600">Add, edit, or remove trip listings</p>
            </Card>
          </Link>
          <Link to="/admin/bookings">
            <Card className="p-8 border border-stone-200 hover:shadow-lg transition-all cursor-pointer group">
              <Calendar className="w-12 h-12 text-blue-700 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Manage Bookings</h3>
              <p className="text-stone-600">Review and update booking status</p>
            </Card>
          </Link>
          <Link to="/admin/contacts">
            <Card className="p-8 border border-stone-200 hover:shadow-lg transition-all cursor-pointer group">
              <MessageSquare className="w-12 h-12 text-pink-700 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Contact Messages</h3>
              <p className="text-stone-600">Respond to customer inquiries</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
