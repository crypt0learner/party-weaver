import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Mail, Sparkles, PartyPopper, Gift, Clock, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-celebration.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleSignIn = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PartyPopper className="h-8 w-8 text-primary animate-sparkle" />
            <h1 className="text-2xl font-bold text-foreground">Party Weaver</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleSignIn}>
              {user ? 'Dashboard' : 'Sign In'}
            </Button>
            <Button variant="celebration" size="lg" onClick={handleGetStarted}>
              {user ? 'Create Event' : 'Get Started'}
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-gradient-primary text-white px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Magical Moments
              </Badge>
              <h2 className="text-5xl font-bold text-foreground leading-tight">
                Turn Every Event Into an 
                <span className="text-transparent bg-gradient-celebration bg-clip-text"> Unforgettable Celebration</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Create beautiful invitations, manage RSVPs, and bring people together for moments that matter. 
                From birthday parties to grand celebrations - we make hosting effortless.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="celebration" size="xl" className="flex-1" onClick={handleGetStarted}>
                <PartyPopper className="h-5 w-5 mr-2" />
                {user ? 'Create Your First Event' : 'Get Started Now'}
              </Button>
              <Button variant="outline" size="xl" className="flex-1" onClick={handleSignIn}>
                <Calendar className="h-5 w-5 mr-2" />
                {user ? 'View Dashboard' : 'See How It Works'}
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Events Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Guests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">99%</div>
                <div className="text-sm text-muted-foreground">RSVP Rate</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-celebration animate-float">
              <img 
                src={heroImage} 
                alt="Celebration with balloons and party elements" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h3 className="text-3xl font-bold text-foreground">Everything You Need to Host Amazing Events</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From planning to celebration, we've got every detail covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-card border-0 shadow-card-elevated hover:shadow-celebration transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Beautiful Invitations</CardTitle>
              <CardDescription>
                Create stunning, personalized invitations with our designer templates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-elevated hover:shadow-celebration transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Smart RSVP Management</CardTitle>
              <CardDescription>
                Track responses in real-time and send automatic reminders to guests
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-elevated hover:shadow-celebration transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Multi-Channel Invites</CardTitle>
              <CardDescription>
                Send invitations via email, SMS, or share custom links effortlessly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-elevated hover:shadow-celebration transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Share all the important info - location, time, dress code, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-elevated hover:shadow-celebration transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                Keep everyone informed with instant notifications and updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-elevated hover:shadow-celebration transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Gift Registry</CardTitle>
              <CardDescription>
                Let guests know what you need with integrated gift suggestions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-celebration border-0 text-white text-center p-12 shadow-glow">
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-4xl font-bold">Ready to Create Your First Event?</h3>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Join thousands of hosts who've made their celebrations unforgettable with Party Weaver
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="xl" className="bg-white text-primary hover:bg-white/90" onClick={handleGetStarted}>
                <PartyPopper className="h-5 w-5 mr-2" />
                {user ? 'Create Event Now' : 'Start Planning Now'}
              </Button>
              <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10" onClick={handleSignIn}>
                {user ? 'View Dashboard' : 'View Templates'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PartyPopper className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground">© 2024 Party Weaver. Making celebrations magical.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;