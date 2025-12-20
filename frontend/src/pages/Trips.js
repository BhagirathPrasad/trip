import React, { useEffect, useState } from 'react';
import { TripCard } from '../components/TripCard';
import { tripAPI } from '../services/api';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = trips.filter(
        (trip) =>
          trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trip.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTrips(filtered);
    } else {
      setFilteredTrips(trips);
    }
  }, [searchQuery, trips]);

  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getAll();
      setTrips(response.data);
      setFilteredTrips(response.data);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-testid="trips-header">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Explore <span className="text-teal-700">Destinations</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-stone-600 max-w-2xl mx-auto mb-8">
            Browse through our collection of handpicked travel experiences designed for every type of adventurer.
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search destinations, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-full border-stone-200 focus:border-teal-600 focus:ring-teal-600/20 bg-white"
              data-testid="trips-search-input"
            />
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="text-center text-stone-600" data-testid="trips-loading">
            Loading trips...
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center text-stone-600" data-testid="trips-no-results">
            {searchQuery ? 'No trips found matching your search.' : 'No trips available at the moment.'}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="trips-grid">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trips;
