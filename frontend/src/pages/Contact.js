import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { contactAPI } from '../services/api';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.submit(formData);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-testid="contact-header">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Get In <span className="text-teal-700">Touch</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-stone-600 max-w-2xl mx-auto">
            Have questions about your next adventure? We're here to help plan your perfect trip.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-stone-200" data-testid="contact-form">
            <h2 className="text-3xl font-semibold mb-8">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base mb-2 block">
                  Your Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-12 rounded-lg border-stone-200 focus:border-teal-600"
                  placeholder="John Doe"
                  required
                  data-testid="contact-name-input"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-base mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 rounded-lg border-stone-200 focus:border-teal-600"
                  placeholder="john@example.com"
                  required
                  data-testid="contact-email-input"
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-base mb-2 block">
                  Your Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="min-h-40 rounded-lg border-stone-200 focus:border-teal-600 resize-none"
                  placeholder="Tell us about your travel plans or any questions you have..."
                  required
                  data-testid="contact-message-input"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-6 text-lg font-medium transition-transform hover:scale-105 gap-2"
                data-testid="contact-submit-btn"
              >
                {loading ? 'Sending...' : (
                  <>
                    Send Message <Send className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8" data-testid="contact-info">
            <div className="bg-white p-8 rounded-2xl border border-stone-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <Mail className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                  <p className="text-stone-600">support@tripcraft.com</p>
                  <p className="text-stone-600">info@tripcraft.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Phone className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                  <p className="text-stone-600">+1 (555) 123-4567</p>
                  <p className="text-stone-500 text-sm mt-1">Mon-Fri: 9AM - 6PM EST</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <MapPin className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
                  <p className="text-stone-600">
                    123 Travel Street<br />
                    Adventure City, AC 12345<br />
                    United States
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
