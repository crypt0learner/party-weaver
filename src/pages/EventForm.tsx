import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, MapPin, FileText, Save, PartyPopper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EventFormData {
  title: string;
  description: string;
  location: string;
  start_time: string;
}

const EventForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    start_time: '',
  });
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load event data if editing
  useEffect(() => {
    if (isEditing && user) {
      loadEvent();
    }
  }, [isEditing, user, id]);

  const loadEvent = async () => {
    if (!id || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading event",
          description: error.message,
        });
        navigate('/dashboard');
        return;
      }

      // Check if user has permission to edit
      const isHost = data.host_user_id === user.id;
      const isCohost = data.cohost_user_ids?.includes(user.id);
      
      if (!isHost && !isCohost) {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You don't have permission to edit this event.",
        });
        navigate('/dashboard');
        return;
      }

      // Format datetime for input
      const formattedDateTime = new Date(data.start_time).toISOString().slice(0, 16);

      setFormData({
        title: data.title,
        description: data.description || '',
        location: data.location || '',
        start_time: formattedDateTime,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load event. Please try again.",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const eventData = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        host_user_id: user.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', id);

        if (error) {
          toast({
            variant: "destructive",
            title: "Error updating event",
            description: error.message,
          });
          return;
        }

        toast({
          title: "Event updated!",
          description: "Your event has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) {
          toast({
            variant: "destructive",
            title: "Error creating event",
            description: error.message,
          });
          return;
        }

        toast({
          title: "Event created!",
          description: "Your event has been successfully created.",
        });
      }

      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save event. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || (isEditing && loading)) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <PartyPopper className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-0 shadow-celebration">
            <CardHeader>
              <CardTitle className="text-2xl">
                {isEditing ? 'Edit Your Event' : 'Create a New Event'}
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? 'Update your event details below'
                  : 'Fill in the details below to create your event'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Birthday Party, Wedding, Conference..."
                    required
                    disabled={loading}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell your guests what this event is about..."
                    disabled={loading}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="123 Main St, City, State or Online"
                      disabled={loading}
                      className="h-12 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Event Date & Time *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 pl-10"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="celebration"
                    size="lg"
                    disabled={loading || !formData.title || !formData.start_time}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditing ? 'Update Event' : 'Create Event'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EventForm;