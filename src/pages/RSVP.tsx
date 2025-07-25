import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventInvite {
  id: string;
  guest_name: string;
  rsvp_status: string;
  responded_at: string | null;
  events: {
    title: string;
    description: string;
    location: string;
    start_time: string;
  };
}

export const RSVP: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [invite, setInvite] = useState<EventInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      loadInvite();
    }
  }, [token]);

  const loadInvite = async () => {
    try {
      const { data, error } = await supabase
        .from('event_invites')
        .select(`
          id,
          guest_name,
          rsvp_status,
          responded_at,
          events (
            title,
            description,
            location,
            start_time
          )
        `)
        .eq('invite_token', token)
        .single();

      if (error) {
        console.error('Error loading invite:', error);
        toast({
          title: "Error",
          description: "Invalid invitation link",
          variant: "destructive",
        });
        return;
      }

      setInvite(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (status: 'attending' | 'not_attending' | 'maybe') => {
    if (!invite) return;
    
    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from('event_invites')
        .update({ 
          rsvp_status: status,
          responded_at: new Date().toISOString()
        })
        .eq('invite_token', token);

      if (error) {
        console.error('Error updating RSVP:', error);
        toast({
          title: "Error",
          description: "Failed to update RSVP",
          variant: "destructive",
        });
        return;
      }

      setInvite(prev => prev ? {
        ...prev,
        rsvp_status: status,
        responded_at: new Date().toISOString()
      } : null);

      toast({
        title: "Success",
        description: "Your RSVP has been updated!",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'attending': return 'default';
      case 'not_attending': return 'destructive';
      case 'maybe': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'attending': return 'Attending';
      case 'not_attending': return 'Not Attending';
      case 'maybe': return 'Maybe';
      default: return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Invitation Not Found</h1>
            <p className="text-muted-foreground">
              This invitation link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary mb-2">
              You're Invited!
            </CardTitle>
            <h2 className="text-2xl font-semibold">{invite.events.title}</h2>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Invited Guest</p>
                  <p className="text-muted-foreground">{invite.guest_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">When</p>
                  <p className="text-muted-foreground">{formatEventDate(invite.events.start_time)}</p>
                </div>
              </div>
              
              {invite.events.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Where</p>
                    <p className="text-muted-foreground">{invite.events.location}</p>
                  </div>
                </div>
              )}
            </div>

            {invite.events.description && (
              <div>
                <h3 className="font-medium mb-2">Event Details</h3>
                <p className="text-muted-foreground">{invite.events.description}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Your RSVP Status</h3>
                <Badge variant={getStatusBadgeVariant(invite.rsvp_status)}>
                  {getStatusText(invite.rsvp_status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleRSVP('attending')}
                  disabled={updating}
                  variant={invite.rsvp_status === 'attending' ? 'default' : 'outline'}
                  className="w-full"
                >
                  Yes, I'll be there
                </Button>
                
                <Button
                  onClick={() => handleRSVP('maybe')}
                  disabled={updating}
                  variant={invite.rsvp_status === 'maybe' ? 'default' : 'outline'}
                  className="w-full"
                >
                  Maybe
                </Button>
                
                <Button
                  onClick={() => handleRSVP('not_attending')}
                  disabled={updating}
                  variant={invite.rsvp_status === 'not_attending' ? 'destructive' : 'outline'}
                  className="w-full"
                >
                  Can't make it
                </Button>
              </div>
              
              {invite.responded_at && (
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Last updated: {new Date(invite.responded_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};