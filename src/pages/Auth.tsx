import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, PartyPopper, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message,
        });
      } else {
        setMagicLinkSent(true);
        toast({
          title: "Magic Link Sent!",
          description: "Check your email for the login link.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card border-0 shadow-celebration">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Check Your Email!</CardTitle>
            <CardDescription>
              We've sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Click the link in your email to sign in to Party Weaver. The link will expire in 1 hour.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                onClick={() => setMagicLinkSent(false)}
                className="w-full"
              >
                Try Different Email
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleBackToHome}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-0 shadow-celebration">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 animate-sparkle">
            <PartyPopper className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to Party Weaver</CardTitle>
          <CardDescription>
            Sign in with your email to start creating amazing events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMagicLink} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              variant="celebration"
              size="lg"
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Magic Link...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Magic Link
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={handleBackToHome}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;