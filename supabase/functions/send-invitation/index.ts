import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  eventId: string;
  guestName: string;
  email?: string;
  phoneNumber?: string;
  inviteToken: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, guestName, email, phoneNumber, inviteToken }: InvitationRequest = await req.json();

    console.log('Processing invitation:', { eventId, guestName, email: !!email, phoneNumber: !!phoneNumber });

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, start_time, location')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Event not found:', eventError);
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rsvpUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/rsvp/${inviteToken}`;
    const eventDate = new Date(event.start_time).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    if (email) {
      // Send email invitation
      const emailResult = await resend.emails.send({
        from: 'Party Weaver <invitations@resend.dev>',
        to: [email],
        subject: `You're invited to ${event.title}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">You're Invited!</h1>
            <h2 style="color: #6366f1;">${event.title}</h2>
            <p><strong>When:</strong> ${eventDate}</p>
            <p><strong>Where:</strong> ${event.location || 'Location TBD'}</p>
            <p>Hi ${guestName},</p>
            <p>You've been invited to join us for this special event. We'd love to have you there!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${rsvpUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">RSVP Now</a>
            </div>
            <p>Or copy and paste this link: ${rsvpUrl}</p>
            <p>Looking forward to celebrating with you!</p>
          </div>
        `,
      });

      console.log('Email sent:', emailResult);
    }

    if (phoneNumber) {
      // Send SMS invitation using Vonage
      const vonageApiKey = Deno.env.get('VONAGE_API_KEY');
      const vonageApiSecret = Deno.env.get('VONAGE_API_SECRET');
      
      if (!vonageApiKey || !vonageApiSecret) {
        console.error('Vonage API credentials not found');
        return new Response(
          JSON.stringify({ error: 'SMS service not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const smsMessage = `Hi ${guestName}! You're invited to ${event.title} on ${eventDate}. RSVP here: ${rsvpUrl}`;

      const smsResponse = await fetch('https://rest.nexmo.com/sms/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: vonageApiKey,
          api_secret: vonageApiSecret,
          from: 'PartyWeaver',
          to: phoneNumber.replace(/\D/g, ''), // Remove non-digits
          text: smsMessage,
        }),
      });

      const smsResult = await smsResponse.json();
      console.log('SMS sent:', smsResult);

      if (smsResult.messages?.[0]?.status !== '0') {
        console.error('SMS sending failed:', smsResult);
        return new Response(
          JSON.stringify({ error: 'Failed to send SMS' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending invitation:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send invitation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});