import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InviteGuestFormProps {
  eventId: string;
  onInviteSent: () => void;
}

export const InviteGuestForm: React.FC<InviteGuestFormProps> = ({ eventId, onInviteSent }) => {
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guestName.trim()) {
      toast({
        title: "Error",
        description: "Guest name is required",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim() && !phoneNumber.trim()) {
      toast({
        title: "Error", 
        description: "Please provide either an email or phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create invite record in database
      const { data: invite, error: inviteError } = await supabase
        .from('event_invites')
        .insert({
          event_id: eventId,
          guest_name: guestName.trim(),
          email: email.trim() || null,
          phone_number: phoneNumber.trim() || null,
        })
        .select()
        .single();

      if (inviteError) {
        console.error('Error creating invite:', inviteError);
        toast({
          title: "Error",
          description: "Failed to create invitation",
          variant: "destructive",
        });
        return;
      }

      // Send invitation via edge function
      const { error: sendError } = await supabase.functions.invoke('send-invitation', {
        body: {
          eventId,
          guestName: guestName.trim(),
          email: email.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          inviteToken: invite.invite_token,
        },
      });

      if (sendError) {
        console.error('Error sending invitation:', sendError);
        toast({
          title: "Warning",
          description: "Invitation created but failed to send. Please try sending manually.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Invitation sent successfully!",
        });
      }

      // Reset form
      setGuestName('');
      setEmail('');
      setPhoneNumber('');
      onInviteSent();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite a Guest</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="guestName">Guest Name *</Label>
            <Input
              id="guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter guest name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guest@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            * Provide either email or phone number (or both)
          </p>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};