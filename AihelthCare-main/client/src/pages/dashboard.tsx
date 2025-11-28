import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsGrid from "@/components/dashboard/stats-grid";
import EmergencyBanner from "@/components/emergency/emergency-banner";
import AIChatInterface from "@/components/ai/chat-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Video, 
  ClipboardCheck, 
  ArrowRight, 
  Calendar,
  Activity,
  Users,
  TrendingUp 
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header />
        
        <div className="p-6 space-y-6">
          {/* Emergency Alert Banner */}
          <EmergencyBanner />
          
          {/* Dashboard Stats */}
          <StatsGrid />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Health Chat Interface */}
            <div className="lg:col-span-2">
              <AIChatInterface />
            </div>
            
            {/* Right Sidebar - Quick Actions & Status */}
            <div className="space-y-6">
              {/* Emergency Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-red-500" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full gradient-emergency text-white" 
                    size="lg"
                    data-testid="button-emergency-call"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Call
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    data-testid="button-video-consultation"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video Consultation
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    data-testid="button-symptom-checker"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Symptom Checker
                  </Button>
                </CardContent>
              </Card>

              {/* Available Doctors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Available Doctors</span>
                    <Button variant="ghost" size="sm" data-testid="link-view-doctors">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      SC
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm" data-testid="text-doctor-name">Dr. Sarah Chen</h4>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Emergency Medicine</p>
                      <p className="text-xs text-green-600">Available now</p>
                    </div>
                    <Button size="sm" data-testid="button-chat-doctor">
                      Chat
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                      MR
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm" data-testid="text-doctor-name">Dr. Michael Rodriguez</h4>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Internal Medicine</p>
                      <p className="text-xs text-yellow-600">Busy - 5 min wait</p>
                    </div>
                    <Button size="sm" variant="secondary" data-testid="button-queue-doctor">
                      Queue
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white font-medium">
                      EW
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm" data-testid="text-doctor-name">Dr. Emily Watson</h4>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-xs text-muted-foreground">Cardiology</p>
                      <p className="text-xs text-green-600">Available now</p>
                    </div>
                    <Button size="sm" data-testid="button-chat-doctor">
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-foreground" data-testid="text-activity">Blood donation scheduled</p>
                        <p className="text-muted-foreground text-xs">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-foreground" data-testid="text-activity">AI health check completed</p>
                        <p className="text-muted-foreground text-xs">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-foreground" data-testid="text-activity">Doctor consultation booked</p>
                        <p className="text-muted-foreground text-xs">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-foreground" data-testid="text-activity">Health products ordered</p>
                        <p className="text-muted-foreground text-xs">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold" data-testid="text-week-consultations">3</p>
                    <p className="text-xs text-green-600">+2 from last week</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Health Score</p>
                    <p className="text-2xl font-bold" data-testid="text-health-score">85</p>
                    <p className="text-xs text-green-600">Excellent</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Donations</p>
                    <p className="text-2xl font-bold" data-testid="text-donations">5</p>
                    <p className="text-xs text-blue-600">Lifetime total</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="text-2xl font-bold" data-testid="text-streak">12</p>
                    <p className="text-xs text-orange-600">Days active</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Floating Emergency Button */}
      <Button
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full gradient-emergency text-white shadow-lg hover:scale-110 transition-transform"
        size="lg"
        data-testid="button-floating-emergency"
      >
        <Phone className="h-6 w-6" />
      </Button>
    </div>
  );
}
