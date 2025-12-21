import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../services/api';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMy();
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="mb-12" data-testid="my-bookings-header">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            My <span className="text-teal-700">Bookings</span>
          </h1>
          <p className="text-base md:text-lg text-stone-600">
            Manage and track your upcoming adventures
          </p>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center text-stone-600" data-testid="my-bookings-loading">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16" data-testid="my-bookings-empty">
            <p className="text-xl text-stone-600 mb-4">You haven't made any bookings yet.</p>
            <a href="/trips" className="text-teal-700 font-semibold hover:text-teal-800">
              Browse Trips
            </a>
          </div>
        ) : (
          <div className="space-y-6" data-testid="my-bookings-list">
            {bookings.map((booking) => (
              <Card
                key={booking._id || booking.id}
                className="p-6 border border-stone-200 hover:shadow-lg transition-shadow"
                data-testid={`booking-card-${booking._id || booking.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold" data-testid="booking-trip-title">
                        {booking.trip_title}
                      </h3>
                      <Badge className={getStatusColor(booking.status)} data-testid="booking-status">
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span data-testid="booking-travel-date">{booking.travel_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span data-testid="booking-travelers">{booking.travelers} traveler(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-stone-500 mb-1">Booked on</div>
                    <div className="text-stone-700 font-medium">
                      {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
