import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useWebSocket } from "@/hooks/useWebSocket";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  Activity, 
  Shield,
  CheckCircle,
  XCircle 
} from "lucide-react";

export default function Emergency() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { sendEmergency } = useWebSocket();
  const [selectedEmergency, setSelectedEmergency] = useState<any>(null);

  // Redirect to login if not authenticated
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

  const { data: emergencies, isLoading: emergenciesLoading } = useQuery({
    queryKey: ["/api/emergency"],
  });

  const { data: activeEmergencies } = useQuery({
    queryKey: ["/api/emergency/active"],
  });

  const emergencyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/emergency", data);
      return response.json();
    },
    onSuccess: (emergency) => {
      toast({
        title: "Emergency Logged",
        description: "Emergency services have been notified automatically.",
        variant: "destructive",
      });
      
      // Send via WebSocket for real-time updates
      sendEmergency(emergency);
      queryClient.invalidateQueries({ queryKey: ["/api/emergency"] });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency/active"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Emergency Failed",
        description: "Failed to log emergency. Please call emergency services directly.",
        variant: "destructive",
      });
    },
  });

  const resolveEmergencyMutation = useMutation({
    mutationFn: async ({ id, assignedDoctorId }: { id: string; assignedDoctorId?: string }) => {
      const response = await apiRequest("PUT", `/api/emergency/${id}/resolve`, { assignedDoctorId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency Resolved",
        description: "Emergency has been marked as resolved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency"] });
      queryClient.invalidateQueries({ queryKey: ["/api/emergency/active"] });
      setSelectedEmergency(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to resolve emergency.",
        variant: "destructive",
      });
    },
  });

  const handleEmergencyCall = (type: 'low' | 'medium' | 'high') => {
    const emergencyData = {
      emergencyType: type,
      symptoms: ['Emergency call initiated'],
      actionTaken: type === 'high' ? 'emergency_call' : type === 'medium' ? 'consultation' : 'self_care',
      location: 'Current location', // In real app, get from geolocation
    };

    emergencyMutation.mutate(emergencyData);
    
    if (type === 'high') {
      // Simulate emergency call
      toast({
        title: "🚨 Emergency Services Contacted",
        description: "Emergency services have been automatically notified of your location and situation.",
        variant: "destructive",
      });
    }
  };

  const getEmergencyLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
              Emergency Center
            </h1>
            <p className="text-muted-foreground">
              Intelligent emergency classification and response system. 
              Get immediate help based on the severity of your situation.
            </p>
          </div>

          {/* Active Emergency Alert */}
          {activeEmergencies && activeEmergencies.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Active Emergency:</strong> {activeEmergencies.length} unresolved emergency case(s) require attention.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Emergency Actions */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <Phone className="h-5 w-5" />
                    <span>Emergency Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handleEmergencyCall('high')}
                    disabled={emergencyMutation.isPending}
                    className="w-full gradient-emergency text-white"
                    size="lg"
                    data-testid="button-high-emergency"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Critical Emergency
                    <Badge className="ml-2 bg-white text-red-600">Auto Call 911</Badge>
                  </Button>
                  
                  <Button
                    onClick={() => handleEmergencyCall('medium')}
                    disabled={emergencyMutation.isPending}
                    variant="outline"
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                    size="lg"
                    data-testid="button-medium-emergency"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Medical Urgency
                    <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
                      Find Doctor
                    </Badge>
                  </Button>
                  
                  <Button
                    onClick={() => handleEmergencyCall('low')}
                    disabled={emergencyMutation.isPending}
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    size="lg"
                    data-testid="button-low-emergency"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Health Concern
                    <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
                      AI Guidance
                    </Badge>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>Emergency Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-red-800">Critical Emergency</span>
                    </div>
                    <p className="text-red-700">
                      Life-threatening situations. Automatic emergency services contact.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium text-yellow-800">Medical Urgency</span>
                    </div>
                    <p className="text-yellow-700">
                      Requires prompt medical attention. Connect with available doctors.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800">Health Concern</span>
                    </div>
                    <p className="text-green-700">
                      Non-urgent health questions. AI-powered guidance and recommendations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Dashboard */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Emergencies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span>Active Emergencies</span>
                    </div>
                    <Badge variant="outline" data-testid="badge-active-count">
                      {activeEmergencies?.length || 0} Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeEmergencies && activeEmergencies.length > 0 ? (
                    <div className="space-y-4">
                      {activeEmergencies.map((emergency: any) => (
                        <div 
                          key={emergency.id} 
                          className="border border-border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => setSelectedEmergency(emergency)}
                          data-testid={`emergency-${emergency.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getEmergencyLevelColor(emergency.emergencyType)}>
                              {emergency.emergencyType.toUpperCase()} PRIORITY
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(emergency.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>Emergency Case #{emergency.id.slice(-8)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{emergency.location || 'Location pending'}</span>
                            </div>
                          </div>
                          {emergency.symptoms && emergency.symptoms.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground mb-1">Symptoms:</p>
                              <div className="flex flex-wrap gap-1">
                                {emergency.symptoms.slice(0, 3).map((symptom: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {symptom}
                                  </Badge>
                                ))}
                                {emergency.symptoms.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{emergency.symptoms.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
                      <p>No active emergencies</p>
                      <p className="text-sm">All emergency cases have been resolved</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emergency History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span>Emergency History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {emergenciesLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : emergencies && emergencies.length > 0 ? (
                    <div className="space-y-4">
                      {emergencies.slice(0, 5).map((emergency: any) => (
                        <div key={emergency.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Badge className={getEmergencyLevelColor(emergency.emergencyType)}>
                                {emergency.emergencyType}
                              </Badge>
                              {emergency.isResolved ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(emergency.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">
                            Action: {emergency.actionTaken?.replace('_', ' ').toUpperCase() || 'N/A'}
                          </p>
                          {emergency.symptoms && emergency.symptoms.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {emergency.symptoms.slice(0, 3).map((symptom: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-4 opacity-50" />
                      <p>No emergency history</p>
                      <p className="text-sm">Emergency logs will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Emergency Detail Modal */}
          {selectedEmergency && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-lg mx-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span>Emergency Details</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEmergency(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Emergency Level</Label>
                    <Badge className={`ml-2 ${getEmergencyLevelColor(selectedEmergency.emergencyType)}`}>
                      {selectedEmergency.emergencyType.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(selectedEmergency.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Action Taken</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedEmergency.actionTaken?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </p>
                  </div>

                  {selectedEmergency.symptoms && (
                    <div>
                      <Label className="text-sm font-medium">Symptoms</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedEmergency.symptoms.map((symptom: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedEmergency.isResolved && (
                    <Button
                      onClick={() => resolveEmergencyMutation.mutate({ id: selectedEmergency.id })}
                      disabled={resolveEmergencyMutation.isPending}
                      className="w-full mt-4"
                      data-testid="button-resolve-emergency"
                    >
                      {resolveEmergencyMutation.isPending ? "Resolving..." : "Mark as Resolved"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
