-- Party Weaver Database Schema
-- Event invitation platform with hosts, co-hosts, and public RSVP system

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohost_user_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_invites table
CREATE TABLE public.event_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  email TEXT,
  phone_number TEXT,
  invite_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('yes', 'no', 'maybe', 'pending')),
  guest_name TEXT,
  guest_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT event_invites_contact_check CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_invites_updated_at
  BEFORE UPDATE ON public.event_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to set responded_at when RSVP status changes
CREATE OR REPLACE FUNCTION public.set_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If RSVP status changed from pending to something else, set responded_at
  IF OLD.rsvp_status = 'pending' AND NEW.rsvp_status != 'pending' THEN
    NEW.responded_at = now();
  END IF;
  -- If status changed back to pending, clear responded_at
  IF NEW.rsvp_status = 'pending' THEN
    NEW.responded_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_event_invites_responded_at
  BEFORE UPDATE ON public.event_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.set_responded_at();

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events table

-- Allow host and co-hosts to read their events
CREATE POLICY "Allow host and cohosts to read event"
  ON public.events
  FOR SELECT
  USING (
    auth.uid() = host_user_id
    OR auth.uid() = ANY(cohost_user_ids)
  );

-- Allow host and co-hosts to update their events
CREATE POLICY "Allow host and cohosts to update event"
  ON public.events
  FOR UPDATE
  USING (
    auth.uid() = host_user_id
    OR auth.uid() = ANY(cohost_user_ids)
  );

-- Allow only host to delete events
CREATE POLICY "Allow host to delete event"
  ON public.events
  FOR DELETE
  USING (auth.uid() = host_user_id);

-- Allow authenticated users to create events (they become the host)
CREATE POLICY "Allow authenticated users to create events"
  ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() = host_user_id);

-- RLS Policies for event_invites table

-- Allow host and co-hosts to read all invites for their events
CREATE POLICY "Allow host and cohosts to read event invites"
  ON public.event_invites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_invites.event_id
      AND (
        auth.uid() = events.host_user_id
        OR auth.uid() = ANY(events.cohost_user_ids)
      )
    )
  );

-- Allow host and co-hosts to insert invites for their events
CREATE POLICY "Allow host and cohosts to create invites"
  ON public.event_invites
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_invites.event_id
      AND (
        auth.uid() = events.host_user_id
        OR auth.uid() = ANY(events.cohost_user_ids)
      )
    )
  );

-- Allow host and co-hosts to update invites for their events
CREATE POLICY "Allow host and cohosts to update invites"
  ON public.event_invites
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_invites.event_id
      AND (
        auth.uid() = events.host_user_id
        OR auth.uid() = ANY(events.cohost_user_ids)
      )
    )
  );

-- Allow host and co-hosts to delete invites for their events
CREATE POLICY "Allow host and cohosts to delete invites"
  ON public.event_invites
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_invites.event_id
      AND (
        auth.uid() = events.host_user_id
        OR auth.uid() = ANY(events.cohost_user_ids)
      )
    )
  );

-- Public access for RSVP functionality (no authentication required)
-- This allows guests to view and update their specific invite using the token

-- Allow public read access to event invites by token (for RSVP pages)
CREATE POLICY "Allow public read access by invite token"
  ON public.event_invites
  FOR SELECT
  USING (true); -- We'll handle token validation in the application layer

-- Allow public update access by token (for RSVP submission)
CREATE POLICY "Allow public RSVP update by token"
  ON public.event_invites
  FOR UPDATE
  USING (true); -- We'll handle token validation in the application layer

-- Create indexes for better performance
CREATE INDEX idx_events_host_user_id ON public.events(host_user_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_event_invites_event_id ON public.event_invites(event_id);
CREATE INDEX idx_event_invites_token ON public.event_invites(invite_token);
CREATE INDEX idx_event_invites_email ON public.event_invites(email);
CREATE INDEX idx_event_invites_rsvp_status ON public.event_invites(rsvp_status);