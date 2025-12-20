import React, { useEffect, useState } from 'react';
import { tripAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ManageTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    duration: '',
    price: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getAll();
      setTrips(response.data);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, price: parseFloat(formData.price) };
      if (editingTrip) {
        await tripAPI.update(editingTrip.id, data);
        toast.success('Trip updated successfully!');
      } else {
        await tripAPI.create(data);
        toast.success('Trip created successfully!');
      }
      setDialogOpen(false);
      resetForm();
      fetchTrips();
    } catch (error) {
      console.error('Failed to save trip:', error);
      toast.error('Failed to save trip. Please try again.');
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title,
      destination: trip.destination,
      duration: trip.duration,
      price: trip.price.toString(),
      description: trip.description,
      image: trip.image,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await tripAPI.delete(tripId);
      toast.success('Trip deleted successfully!');
      fetchTrips();
    } catch (error) {
      console.error('Failed to delete trip:', error);
      toast.error('Failed to delete trip.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      destination: '',
      duration: '',
      price: '',
      description: '',
      image: '',
    });
    setEditingTrip(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8" data-testid="manage-trips-header">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Manage Trips</h1>
          <p className="text-stone-600">Add, edit, or remove trip listings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full gap-2"
              data-testid="add-trip-btn"
            >
              <Plus className="w-5 h-5" /> Add Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="trip-dialog">
            <DialogHeader>
              <DialogTitle>{editingTrip ? 'Edit Trip' : 'Add New Trip'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Trip Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Paradise Beach Getaway"
                  required
                  data-testid="trip-title-input"
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g., Maldives"
                  required
                  data-testid="trip-destination-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 7 days"
                    required
                    data-testid="trip-duration-input"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., 1299.99"
                    required
                    data-testid="trip-price-input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  required
                  data-testid="trip-image-input"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the trip experience..."
                  className="min-h-32 resize-none"
                  required
                  data-testid="trip-description-input"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  data-testid="trip-save-btn"
                >
                  {editingTrip ? 'Update Trip' : 'Create Trip'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  data-testid="trip-cancel-btn"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Trips List */}
      {loading ? (
        <div className="text-center text-stone-600">Loading trips...</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16" data-testid="no-trips">
          <p className="text-xl text-stone-600 mb-4">No trips added yet.</p>
          <p className="text-stone-500">Click "Add Trip" to create your first listing.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="trips-list">
          {trips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden border border-stone-200" data-testid={`trip-item-${trip.id}`}>
              <div className="h-48 overflow-hidden">
                <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-3">
                <h3 className="text-xl font-semibold" data-testid="trip-item-title">{trip.title}</h3>
                <p className="text-stone-600 text-sm">{trip.destination}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">{trip.duration}</span>
                  <span className="text-teal-700 font-semibold" data-testid="trip-item-price">${trip.price}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleEdit(trip)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    data-testid="trip-edit-btn"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(trip.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 text-red-600 hover:text-red-700"
                    data-testid="trip-delete-btn"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTrips;
