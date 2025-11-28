import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BloodDonationCard from "@/components/donation/blood-donation-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Droplet, 
  Heart, 
  MapPin, 
  Clock, 
  Phone,
  AlertCircle,
  Plus,
  Calendar,
  Users
} from "lucide-react";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels = ["low", "medium", "high", "critical"];

export default function BloodDonation() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState("");

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

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/blood-donation/requests", selectedBloodType],
    queryFn: ({ queryKey }) => {
      const bloodType = queryKey[1] as string;
      return fetch(bloodType ? `/api/blood-donation/requests?bloodType=${bloodType}` : '/api/blood-donation/requests', {
        credentials: 'include'
      }).then(res => {
        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
        return res.json();
      });
    },
  });

  const { data: myResponses } = useQuery({
    queryKey: ["/api/blood-donation/responses"],
  });

  const requestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/blood-donation/request", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Created",
        description: "Blood donation request has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blood-donation/requests"] });
      setIsRequestDialogOpen(false);
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
        title: "Request Failed",
        description: "Failed to create blood donation request.",
        variant: "destructive",
      });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async (data: { requestId: string; scheduledDate?: string; notes?: string }) => {
      const response = await apiRequest("POST", "/api/blood-donation/respond", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Response Sent",
        description: "Your donation response has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blood-donation/responses"] });
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
        title: "Response Failed",
        description: "Failed to respond to donation request.",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { isBloodDonor: boolean; bloodType?: string; lastBloodDonation?: string }) => {
      const response = await apiRequest("PUT", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your donation profile has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        title: "Update Failed",
        description: "Failed to update donation profile.",
        variant: "destructive",
      });
    },
  });

  const handleRequestSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    requestMutation.mutate({
      bloodType: formData.get('bloodType'),
      urgencyLevel: formData.get('urgencyLevel'),
      unitsNeeded: parseInt(formData.get('unitsNeeded') as string),
      hospitalName: formData.get('hospitalName'),
      location: formData.get('location'),
      contactInfo: formData.get('contactInfo'),
      medicalReason: formData.get('medicalReason'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
  };

  const handleBecomeDonor = () => {
    updateProfileMutation.mutate({
      isBloodDonor: true,
      bloodType: user?.bloodType || 'O+', // Default if not set
    });
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
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
              Blood Donation Center
            </h1>
            <p className="text-muted-foreground">
              Save lives through blood donation. Find urgent requests or register as a donor to help your community.
            </p>
          </div>

          {/* Donation Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700">Active Requests</p>
                    <p className="text-2xl font-bold text-red-800" data-testid="text-active-requests">
                      {requests?.length || 0}
                    </p>
                  </div>
                  <Droplet className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Your Status</p>
                    <p className="text-lg font-bold text-green-800" data-testid="text-donor-status">
                      {user?.isBloodDonor ? 'Active Donor' : 'Not Registered'}
                    </p>
                    {user?.bloodType && (
                      <Badge className="bg-green-100 text-green-700 mt-1">
                        {user.bloodType}
                      </Badge>
                    )}
                  </div>
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Donations</p>
                    <p className="text-2xl font-bold" data-testid="text-donation-count">
                      {myResponses?.filter((r: any) => r.status === 'completed').length || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Donation</p>
                    <p className="text-sm font-medium" data-testid="text-last-donation">
                      {user?.lastBloodDonation 
                        ? new Date(user.lastBloodDonation).toLocaleDateString()
                        : 'Never'
                      }
                    </p>
                    <p className="text-xs text-green-600">Eligible to donate</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {!user?.isBloodDonor ? (
              <Button
                onClick={handleBecomeDonor}
                disabled={updateProfileMutation.isPending}
                className="gradient-medical text-white"
                data-testid="button-become-donor"
              >
                <Heart className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Registering..." : "Become a Blood Donor"}
              </Button>
            ) : (
              <Badge className="bg-green-100 text-green-700 px-4 py-2">
                <Heart className="h-4 w-4 mr-2" />
                Registered Donor
              </Badge>
            )}
            
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-create-request">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blood Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Blood Donation Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bloodType">Blood Type *</Label>
                      <Select name="bloodType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="urgencyLevel">Urgency Level *</Label>
                      <Select name="urgencyLevel" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          {urgencyLevels.map(level => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unitsNeeded">Units Needed *</Label>
                      <Input
                        id="unitsNeeded"
                        name="unitsNeeded"
                        type="number"
                        min="1"
                        max="10"
                        required
                        placeholder="Number of units"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hospitalName">Hospital Name *</Label>
                      <Input
                        id="hospitalName"
                        name="hospitalName"
                        required
                        placeholder="Hospital or clinic name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        required
                        placeholder="City, State"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contactInfo">Contact Information *</Label>
                      <Input
                        id="contactInfo"
                        name="contactInfo"
                        required
                        placeholder="Phone number or email"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="medicalReason">Medical Reason</Label>
                    <Textarea
                      id="medicalReason"
                      name="medicalReason"
                      placeholder="Brief description of the medical situation (optional)"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsRequestDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={requestMutation.isPending}
                      className="gradient-emergency text-white"
                    >
                      {requestMutation.isPending ? "Creating..." : "Create Request"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="flex items-center space-x-2">
              <Label htmlFor="bloodTypeFilter" className="text-sm">Filter by blood type:</Label>
              <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {bloodTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Blood Donation Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {requestsLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-6 bg-muted rounded w-20"></div>
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                      <div className="h-10 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : requests && requests.length > 0 ? (
              requests.map((request: any) => (
                <BloodDonationCard 
                  key={request.id} 
                  request={request}
                  onRespond={(requestId, data) => respondMutation.mutate({ requestId, ...data })}
                  isResponding={respondMutation.isPending}
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Droplet className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No blood donation requests</h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedBloodType 
                        ? `No requests found for blood type ${selectedBloodType}`
                        : "There are currently no active blood donation requests"
                      }
                    </p>
                    {selectedBloodType && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedBloodType("")}
                      >
                        View All Requests
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Emergency Alert */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-semibold mb-2">Emergency Blood Needed</h3>
                  <p className="text-red-700 text-sm mb-4">
                    Critical blood shortage in emergency departments. Your donation can save lives immediately.
                    O-negative donors are especially needed for emergency trauma cases.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Button className="gradient-emergency text-white" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Emergency Hotline
                    </Button>
                    <div className="text-sm text-red-600">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Nearby blood centers available 24/7
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
