import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8" data-testid="login-header">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="p-2 bg-teal-700 rounded-lg group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-stone-900">TripCraft</span>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-stone-600">Sign in to continue your journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm" data-testid="login-form">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                data-testid="login-email-input"
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
                data-testid="login-password-input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-6 text-lg font-medium transition-transform hover:scale-105"
              data-testid="login-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200" data-testid="login-demo-info">
            <p className="text-sm font-semibold text-stone-700 mb-2">Demo Credentials:</p>
            <p className="text-xs text-stone-600">Admin: admin@tripplanner.com / admin123</p>
            <p className="text-xs text-stone-600">Or create a new user account below</p>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-stone-600" data-testid="login-register-link">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-700 font-semibold hover:text-teal-800">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
