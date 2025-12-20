import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { TripCard } from '../components/TripCard';
import { tripAPI } from '../services/api';
import { ArrowRight, Globe, Shield, Heart } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getAll();
      setFeaturedTrips(response.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden" data-testid="home-hero">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1764706202040-a42f03f8fffa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxzY2VuaWMlMjBtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHN1bnNldHxlbnwwfHx8fDE3NjYyNjQ4Nzl8MA&ixlib=rb-4.1.0&q=85"
            alt="Dramatic mountains at sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-none" data-testid="home-hero-title">
            Your Journey
            <br />
            <span className="text-orange-400">Begins Here</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover extraordinary destinations and create unforgettable memories with expertly curated travel experiences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/trips')}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-10 py-7 text-lg font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
              data-testid="home-hero-explore-btn"
            >
              Explore Trips <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              className="bg-white text-stone-900 border border-white/20 hover:bg-stone-50 rounded-full px-10 py-7 text-lg font-medium"
              data-testid="home-hero-contact-btn"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-stone-50" data-testid="home-features">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              Why Choose TripCraft
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-stone-600 max-w-2xl mx-auto">
              We make travel planning effortless with our comprehensive services and expert guidance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-shadow" data-testid="feature-card-1">
              <div className="p-3 bg-teal-100 rounded-xl w-fit mb-4">
                <Globe className="w-8 h-8 text-teal-700" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Worldwide Destinations</h3>
              <p className="text-stone-600 leading-relaxed">
                Access hundreds of curated destinations across the globe, from pristine beaches to mountain peaks.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-shadow" data-testid="feature-card-2">
              <div className="p-3 bg-orange-100 rounded-xl w-fit mb-4">
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Secure Booking</h3>
              <p className="text-stone-600 leading-relaxed">
                Book with confidence using our secure platform with transparent pricing and instant confirmation.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white border border-stone-200 hover:shadow-lg transition-shadow" data-testid="feature-card-3">
              <div className="p-3 bg-pink-100 rounded-xl w-fit mb-4">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Personalized Service</h3>
              <p className="text-stone-600 leading-relaxed">
                Receive dedicated support from our travel experts to ensure your trip exceeds expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trips Section */}
      <section className="py-24 bg-white" data-testid="home-featured-trips">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              Featured Destinations
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-stone-600 max-w-2xl mx-auto">
              Handpicked adventures that promise unforgettable experiences.
            </p>
          </div>
          {loading ? (
            <div className="text-center text-stone-600">Loading trips...</div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {featuredTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
              <div className="text-center">
                <Button
                  onClick={() => navigate('/trips')}
                  className="bg-teal-700 hover:bg-teal-800 text-white rounded-full px-10 py-6 text-lg font-medium"
                  data-testid="home-view-all-trips"
                >
                  View All Trips <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-teal-700 to-teal-800 text-white" data-testid="home-cta">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join thousands of travelers who have discovered their dream destinations with TripCraft.
          </p>
          <Button
            onClick={() => navigate('/register')}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-12 py-7 text-lg font-medium transition-transform hover:scale-105 shadow-2xl"
            data-testid="home-cta-register"
          >
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
