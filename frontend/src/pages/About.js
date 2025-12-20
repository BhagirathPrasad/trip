import React from 'react';
import { MapPin, Users, Award, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden" data-testid="about-hero">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1758599669009-5a9002c09487?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxoYXBweSUyMGRpdmVyc2UlMjB0cmF2ZWxlcnMlMjBncm91cCUyMGhpa2luZ3xlbnwwfHx8fDE3NjYyNjQ4ODZ8MA&ixlib=rb-4.1.0&q=85"
            alt="Group of diverse travelers"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-teal-800/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight" data-testid="about-hero-title">
            About TripCraft
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Creating unforgettable travel experiences since 2020
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-white" data-testid="about-story">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-8 text-center">
            Our Story
          </h2>
          <div className="space-y-6 text-base md:text-lg leading-relaxed text-stone-600">
            <p>
              TripCraft was born from a simple belief: travel should be accessible, authentic, and transformative.
              Founded by a team of passionate travelers and industry veterans, we set out to revolutionize how people
              discover and experience the world.
            </p>
            <p>
              What started as a small collection of curated trips has grown into a comprehensive travel platform serving
              thousands of adventurers worldwide. We partner with local guides, sustainable tourism operators, and
              cultural ambassadors to ensure every journey is both meaningful and memorable.
            </p>
            <p>
              Today, we continue to expand our offerings while staying true to our core values: authenticity,
              sustainability, and exceptional service. Every trip we design is a testament to our commitment to
              creating experiences that enrich lives and broaden perspectives.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-stone-50" data-testid="about-values">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-16 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-testid="value-card-1">
              <div className="inline-flex p-4 bg-teal-100 rounded-2xl mb-4">
                <MapPin className="w-10 h-10 text-teal-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Authentic Experiences</h3>
              <p className="text-stone-600 leading-relaxed">
                We connect you with genuine local culture and hidden gems off the beaten path.
              </p>
            </div>
            <div className="text-center" data-testid="value-card-2">
              <div className="inline-flex p-4 bg-orange-100 rounded-2xl mb-4">
                <Users className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community First</h3>
              <p className="text-stone-600 leading-relaxed">
                Supporting local communities and responsible tourism is at the heart of what we do.
              </p>
            </div>
            <div className="text-center" data-testid="value-card-3">
              <div className="inline-flex p-4 bg-pink-100 rounded-2xl mb-4">
                <Heart className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Passion for Travel</h3>
              <p className="text-stone-600 leading-relaxed">
                Every member of our team is a traveler at heart, bringing expertise and enthusiasm.
              </p>
            </div>
            <div className="text-center" data-testid="value-card-4">
              <div className="inline-flex p-4 bg-blue-100 rounded-2xl mb-4">
                <Award className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-stone-600 leading-relaxed">
                We maintain the highest standards in safety, service, and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gradient-to-br from-teal-700 to-teal-800 text-white" data-testid="about-stats">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">150+</div>
              <div className="text-white/80 text-lg">Destinations</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-white/80 text-lg">Happy Travelers</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9★</div>
              <div className="text-white/80 text-lg">Average Rating</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/80 text-lg">Support Available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
