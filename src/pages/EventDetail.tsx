import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, MapPin, Users, Plus, Edit, Send, UserPlus, X, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  host_user_id: string;
  cohost_user_ids: string[] | null;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
}

const EventDetail = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [cohosts, setCohosts] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCohost, setAddingCohost] = useState(false);
  const [cohostEmail, setCohostEmail] = useState('');
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load event data
  useEffect(() => {
    if (id && user) {
      loadEvent();
    }
  }, [id, user]);

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

      // Check if user has permission to view
      const isHost = data.host_user_id === user.id;
      const isCohost = data.cohost_user_ids?.includes(user.id);
      
      if (!isHost && !isCohost) {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You don't have permission to view this event.",
        });
        navigate('/dashboard');
        return;
      }

      setEvent(data);
      
      // Load cohost profiles if any
      if (data.cohost_user_ids && data.cohost_user_ids.length > 0) {
        loadCohosts(data.cohost_user_ids);
      }
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

  const loadCohosts = async (cohostIds: string[]) => {
    try {
      // Note: In a real app, you'd have a profiles table
      // For now, we'll just show the user IDs
      const cohostProfiles = cohostIds.map(id => ({ id, email: `user-${id.slice(0, 8)}@example.com` }));
      setCohosts(cohostProfiles);
    } catch (error) {
      console.error('Failed to load cohosts:', error);
    }
  };

  const addCohost = async () => {
    if (!event || !user || !cohostEmail.trim()) return;

    // Only host can add cohosts
    if (event.host_user_id !== user.id) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only the event host can add co-hosts.",
      });
      return;
    }

    setAddingCohost(true);
    try {
      // In a real app, you'd look up user by email
      // For now, we'll simulate adding a cohost
      toast({
        variant: "destructive",
        title: "Feature coming soon",
        description: "Co-host management will be available in the next update.",
      });
      setCohostEmail('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add co-host. Please try again.",
      });
    } finally {
      setAddingCohost(false);
    }
  };

  const removeCohost = async (cohostId: string) => {
    if (!event || !user) return;

    // Only host can remove cohosts
    if (event.host_user_id !== user.id) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only the event host can remove co-hosts.",
      });
      return;
    }

    try {
      const updatedCohostIds = event.cohost_user_ids?.filter(id => id !== cohostId) || [];
      
      const { error } = await supabase
        .from('events')
        .update({ cohost_user_ids: updatedCohostIds })
        .eq('id', event.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error removing co-host",
          description: error.message,
        });
      } else {
        toast({
          title: "Co-host removed",
          description: "The co-host has been successfully removed.",
        });
        loadEvent(); // Refresh data
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove co-host. Please try again.",
      });
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventHost = () => event?.host_user_id === user?.id;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/events/${event.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
              <Button variant="celebration">
                <Send className="h-4 w-4 mr-2" />
                Send Invites
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Event Details */}
          <Card className="bg-gradient-card border-0 shadow-celebration">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {isEventHost() ? (
                      <Badge variant="secondary" className="bg-gradient-primary text-white">
                        You are the Host
                      </Badge>
                    ) : (
                      <Badge variant="outline">You are a Co-host</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {event.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatEventDate(event.start_time)}
                      </p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Co-hosts Management */}
          <Card className="bg-gradient-card border-0 shadow-card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Co-hosts
                  </CardTitle>
                  <CardDescription>
                    Manage who can help you organize this event
                  </CardDescription>
                </div>
                {isEventHost() && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCohostEmail('')}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Co-host
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Cohost Form (if host) */}
              {isEventHost() && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <Label htmlFor="cohost-email">Add Co-host by Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cohost-email"
                      type="email"
                      value={cohostEmail}
                      onChange={(e) => setCohostEmail(e.target.value)}
                      placeholder="cohost@example.com"
                      disabled={addingCohost}
                    />
                    <Button 
                      onClick={addCohost}
                      disabled={addingCohost || !cohostEmail.trim()}
                      variant="default"
                    >
                      {addingCohost ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Cohosts List */}
              {cohosts.length > 0 ? (
                <div className="space-y-2">
                  {cohosts.map((cohost) => (
                    <div key={cohost.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{cohost.email}</span>
                      </div>
                      {isEventHost() && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeCohost(cohost.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No co-hosts added yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;