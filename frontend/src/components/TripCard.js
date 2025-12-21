import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Clock, DollarSign } from 'lucide-react';

export const TripCard = ({ trip }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl border-0 shadow-none hover:shadow-2xl transition-all duration-500 cursor-pointer"
      onClick={() => navigate(`/trips/${trip._id || trip.id}`)}
      data-testid={`trip-card-${trip._id || trip.id}`}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={trip.image}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
            <MapPin className="w-4 h-4" />
            <span>{trip.destination}</span>
          </div>
          <h3 className="text-2xl font-bold text-white" data-testid="trip-card-title">
            {trip.title}
          </h3>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-stone-600 text-sm line-clamp-2">{trip.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-stone-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{trip.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-teal-700 font-semibold">
              <DollarSign className="w-4 h-4" />
              <span data-testid="trip-card-price">${trip.price}</span>
            </div>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trips/${trip._id || trip.id}`);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 transition-transform hover:scale-105"
            data-testid="trip-card-view-details"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};
