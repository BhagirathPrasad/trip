import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { MapPin, Clock, DollarSign, Users, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(1);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await tripAPI.getById(id);
      setTrip(response.data);
    } catch (error) {
      console.error('Failed to fetch trip:', error);
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to book a trip');
      navigate('/login');
      return;
    }

    if (!travelDate || travelers < 1) {
      toast.error('Please fill in all booking details');
      return;
    }

    setBookingLoading(true);
    try {
      await bookingAPI.create({
        trip_id: trip.id,
        travel_date: travelDate,
        travelers: parseInt(travelers),
      });
      toast.success('Booking request submitted successfully!');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-stone-600">Loading trip details...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Trip not found</h2>
          <Button onClick={() => navigate('/trips')}>Browse Trips</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/trips')}
          variant="ghost"
          className="mb-6 gap-2"
          data-testid="trip-details-back-btn"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Trips
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Trip Image */}
          <div className="space-y-6" data-testid="trip-details-info">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={trip.image}
                alt={trip.title}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-stone-600 mb-3">
                <MapPin className="w-5 h-5 text-teal-700" />
                <span className="text-lg">{trip.destination}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="trip-details-title">
                {trip.title}
              </h1>
              <p className="text-base md:text-lg leading-relaxed text-stone-600">
                {trip.description}
              </p>
            </div>

            {/* Trip Info */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-stone-200">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-stone-400" />
                <div>
                  <div className="text-sm text-stone-500">Duration</div>
                  <div className="font-semibold text-stone-900">{trip.duration}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-stone-400" />
                <div>
                  <div className="text-sm text-stone-500">Price</div>
                  <div className="font-semibold text-teal-700 text-xl" data-testid="trip-details-price">
                    ${trip.price}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white p-8 rounded-2xl border border-stone-200" data-testid="trip-details-booking-form">
              <h3 className="text-2xl font-semibold mb-6">Book This Trip</h3>
              <form onSubmit={handleBooking} className="space-y-6">
                <div>
                  <Label htmlFor="travel-date" className="text-base mb-2 block">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Travel Date
                  </Label>
                  <Input
                    id="travel-date"
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-12 rounded-lg border-stone-200 focus:border-teal-600"
                    required
                    data-testid="trip-details-date-input"
                  />
                </div>
                <div>
                  <Label htmlFor="travelers" className="text-base mb-2 block">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Travelers
                  </Label>
                  <Input
                    id="travelers"
                    type="number"
                    min="1"
                    max="20"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="h-12 rounded-lg border-stone-200 focus:border-teal-600"
                    required
                    data-testid="trip-details-travelers-input"
                  />
                </div>
                <div className="pt-4 border-t border-stone-200">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-stone-600">Total Price</span>
                    <span className="text-3xl font-bold text-teal-700" data-testid="trip-details-total-price">
                      ${(trip.price * travelers).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-6 text-lg font-medium transition-transform hover:scale-105"
                    data-testid="trip-details-book-btn"
                  >
                    {bookingLoading ? 'Processing...' : 'Book Now'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
