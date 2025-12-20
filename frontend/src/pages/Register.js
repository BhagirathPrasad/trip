import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.name);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8" data-testid="register-header">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="p-2 bg-teal-700 rounded-lg group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-stone-900">TripCraft</span>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Start Your Journey</h1>
          <p className="text-stone-600">Create an account to book amazing trips</p>
        </div>

        {/* Register Form */}
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm" data-testid="register-form">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base mb-2 block">
                Full Name
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
                data-testid="register-name-input"
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
                placeholder="your@email.com"
                required
                data-testid="register-email-input"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-base mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="h-12 rounded-lg border-stone-200 focus:border-teal-600"
                placeholder="••••••••"
                required
                data-testid="register-password-input"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-base mb-2 block">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="h-12 rounded-lg border-stone-200 focus:border-teal-600"
                placeholder="••••••••"
                required
                data-testid="register-confirm-password-input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-6 text-lg font-medium transition-transform hover:scale-105"
              data-testid="register-submit-btn"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-stone-600" data-testid="register-login-link">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-700 font-semibold hover:text-teal-800">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
