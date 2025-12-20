import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar, Users, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateStatus(bookingId, newStatus);
      toast.success('Booking status updated successfully!');
      fetchBookings();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update booking status.');
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8" data-testid="manage-bookings-header">
        <h1 className="text-3xl font-bold text-stone-900">Manage Bookings</h1>
        <p className="text-stone-600">Review and update booking status</p>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center text-stone-600">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16" data-testid="no-bookings">
          <p className="text-xl text-stone-600">No bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4" data-testid="bookings-list">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="p-6 border border-stone-200"
              data-testid={`booking-item-${booking.id}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold" data-testid="booking-trip-title">
                      {booking.trip_title}
                    </h3>
                    <Badge className={getStatusColor(booking.status)} data-testid="booking-status">
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span data-testid="booking-user-email">{booking.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span data-testid="booking-travel-date">{booking.travel_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span data-testid="booking-travelers">{booking.travelers} traveler(s)</span>
                    </div>
                  </div>
                  <div className="text-xs text-stone-500 mt-2">
                    Booked: {format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={booking.status}
                    onValueChange={(value) => handleStatusUpdate(booking.id, value)}
                  >
                    <SelectTrigger className="w-40" data-testid="booking-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
