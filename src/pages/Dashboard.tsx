import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Plus, Settings, LogOut, PartyPopper, Edit, Trash2 } from 'lucide-react';
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

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch user's events
  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`host_user_id.eq.${user.id},cohost_user_ids.cs.{${user.id}}`)
        .order('start_time', { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading events",
          description: error.message,
        });
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load events. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error deleting event",
          description: error.message,
        });
      } else {
        toast({
          title: "Event deleted",
          description: "The event has been successfully deleted.",
        });
        fetchEvents(); // Refresh the list
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event. Please try again.",
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

  const isEventHost = (event: Event) => event.host_user_id === user?.id;

  if (authLoading || loading) {
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
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PartyPopper className="h-8 w-8 text-primary animate-sparkle" />
              <h1 className="text-2xl font-bold text-foreground">Party Weaver</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Your Events</h2>
              <p className="text-muted-foreground">
                Manage your hosted and co-hosted events
              </p>
            </div>
            <Button 
              variant="celebration" 
              size="lg"
              onClick={() => navigate('/events/new')}
              className="w-fit"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Event
            </Button>
          </div>

          {/* Events Grid */}
          {events.length === 0 ? (
            <Card className="bg-gradient-card border-0 shadow-card-elevated text-center py-12">
              <CardContent>
                <PartyPopper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-xl mb-2">No events yet</CardTitle>
                <CardDescription className="mb-6">
                  Create your first event to start bringing people together!
                </CardDescription>
                <Button 
                  variant="celebration" 
                  onClick={() => navigate('/events/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className="bg-gradient-card border-0 shadow-card-elevated hover:shadow-celebration transition-all duration-300 hover:scale-105"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {isEventHost(event) ? (
                            <Badge variant="secondary" className="bg-gradient-primary text-white">
                              Host
                            </Badge>
                          ) : (
                            <Badge variant="outline">Co-host</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/events/${event.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isEventHost(event) && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatEventDate(event.start_time)}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      
                      {event.cohost_user_ids && event.cohost_user_ids.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{event.cohost_user_ids.length} co-host(s)</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Event
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;