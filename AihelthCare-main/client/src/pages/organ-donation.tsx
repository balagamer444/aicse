import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import OrganDonationCard from "@/components/donation/organ-donation-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  Users, 
  Shield, 
  Activity,
  CheckCircle,
  AlertCircle,
  Star,
  Clock
} from "lucide-react";

const organTypes = [
  { id: "heart", name: "Heart", icon: Heart },
  { id: "liver", name: "Liver", icon: Activity },
  { id: "kidney", name: "Kidneys", icon: Users },
  { id: "lung", name: "Lungs", icon: Activity },
  { id: "pancreas", name: "Pancreas", icon: Activity },
  { id: "intestine", name: "Intestines", icon: Activity },
  { id: "cornea", name: "Corneas", icon: Activity },
  { id: "tissue", name: "Tissue", icon: Activity }
];

export default function OrganDonation() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedOrgans, setSelectedOrgans] = useState<string[]>([]);

  // Initialize selected organs from user profile
  useEffect(() => {
    if (user?.organDonationPreferences) {
      setSelectedOrgans(user.organDonationPreferences);
    }
  }, [user]);

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

  const { data: donorMatches } = useQuery({
    queryKey: ["/api/organ-donation/matches", "donor"],
    queryFn: () => 
      fetch('/api/organ-donation/matches?type=donor', { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
          return res.json();
        }),
  });

  const { data: recipientMatches } = useQuery({
    queryKey: ["/api/organ-donation/matches", "recipient"],
    queryFn: () => 
      fetch('/api/organ-donation/matches?type=recipient', { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
          return res.json();
        }),
  });

  const updateDonorMutation = useMutation({
    mutationFn: async (data: { isOrganDonor: boolean; organDonationPreferences?: string[] }) => {
      const response = await apiRequest("PUT", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Donation Preferences Updated",
        description: "Your organ donation preferences have been saved successfully.",
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
        description: "Failed to update organ donation preferences.",
        variant: "destructive",
      });
    },
  });

  const handleOrganToggle = (organId: string) => {
    setSelectedOrgans(prev => 
      prev.includes(organId) 
        ? prev.filter(id => id !== organId)
        : [...prev, organId]
    );
  };

  const handleBecomeDonor = () => {
    if (selectedOrgans.length === 0) {
      toast({
        title: "No Organs Selected",
        description: "Please select at least one organ to donate.",
        variant: "destructive",
      });
      return;
    }

    updateDonorMutation.mutate({
      isOrganDonor: true,
      organDonationPreferences: selectedOrgans,
    });
  };

  const handleUpdatePreferences = () => {
    updateDonorMutation.mutate({
      isOrganDonor: user?.isOrganDonor || false,
      organDonationPreferences: selectedOrgans,
    });
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
              Organ Donation Registry
            </h1>
            <p className="text-muted-foreground">
              Give the gift of life through organ donation. Register as a donor and help save lives 
              through transplant medicine.
            </p>
          </div>

          {/* Donation Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Your Status</p>
                    <p className="text-lg font-bold text-purple-800" data-testid="text-organ-donor-status">
                      {user?.isOrganDonor ? 'Registered Donor' : 'Not Registered'}
                    </p>
                    {user?.isOrganDonor && (
                      <Badge className="bg-purple-100 text-purple-700 mt-1">
                        {user.organDonationPreferences?.length || 0} Organs
                      </Badge>
                    )}
                  </div>
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Potential Matches</p>
                    <p className="text-2xl font-bold" data-testid="text-matches">
                      {donorMatches?.length || 0}
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
                    <p className="text-sm text-muted-foreground">Registry Status</p>
                    <p className="text-sm font-medium text-green-600" data-testid="text-registry-status">
                      HIPAA Protected
                    </p>
                    <p className="text-xs text-muted-foreground">Secure & Private</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Impact Score</p>
                    <p className="text-2xl font-bold" data-testid="text-impact-score">
                      {user?.isOrganDonor ? '8.5' : '0.0'}
                    </p>
                    <p className="text-xs text-orange-600">Lives Saved Potential</p>
                  </div>
                  <Star className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organ Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span>Organ Donation Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {organTypes.map((organ) => (
                    <div key={organ.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={organ.id}
                        checked={selectedOrgans.includes(organ.id)}
                        onCheckedChange={() => handleOrganToggle(organ.id)}
                        data-testid={`checkbox-${organ.id}`}
                      />
                      <Label
                        htmlFor={organ.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <organ.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{organ.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>

                {selectedOrgans.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Selected for Donation:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrgans.map((organId) => {
                        const organ = organTypes.find(o => o.id === organId);
                        return organ ? (
                          <Badge key={organId} className="bg-blue-100 text-blue-700">
                            {organ.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {!user?.isOrganDonor ? (
                    <Button
                      onClick={handleBecomeDonor}
                      disabled={updateDonorMutation.isPending || selectedOrgans.length === 0}
                      className="w-full gradient-medical text-white"
                      size="lg"
                      data-testid="button-register-donor"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {updateDonorMutation.isPending ? "Registering..." : "Register as Organ Donor"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleUpdatePreferences}
                      disabled={updateDonorMutation.isPending}
                      className="w-full"
                      variant="outline"
                      data-testid="button-update-preferences"
                    >
                      {updateDonorMutation.isPending ? "Updating..." : "Update Donation Preferences"}
                    </Button>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Your organ donation registration is secure, confidential, and can be updated at any time.
                    This information is protected under HIPAA regulations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Donation Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Donation Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-800">8</div>
                    <div className="text-sm text-green-700">Lives Can Be Saved</div>
                    <div className="text-xs text-green-600">Per Donor</div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-800">50+</div>
                    <div className="text-sm text-blue-700">Tissues Can Help</div>
                    <div className="text-xs text-blue-600">Improve Lives</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Heart Donation</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Can save a life suffering from end-stage heart disease
                    </p>
                  </div>
                  
                  <div className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Liver Donation</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Can be split to save two lives from liver failure
                    </p>
                  </div>
                  
                  <div className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Kidney Donation</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Two kidneys can end dialysis for two patients
                    </p>
                  </div>
                  
                  <div className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Cornea Donation</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Can restore sight to two people with corneal blindness
                    </p>
                  </div>
                </div>

                {user?.isOrganDonor && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Thank You!</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      You're registered as an organ donor. Your generosity can transform and save lives.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Matches and Compatibility */}
          {user?.isOrganDonor && (donorMatches?.length > 0 || recipientMatches?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Compatibility Matches</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {donorMatches?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">As a Donor</h4>
                      <div className="space-y-3">
                        {donorMatches.slice(0, 3).map((match: any) => (
                          <OrganDonationCard key={match.id} match={match} type="donor" />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {recipientMatches?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">As a Recipient</h4>
                      <div className="space-y-3">
                        {recipientMatches.slice(0, 3).map((match: any) => (
                          <OrganDonationCard key={match.id} match={match} type="recipient" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information and Resources */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-800 font-semibold mb-2">Important Information</h3>
                  <div className="text-blue-700 text-sm space-y-2">
                    <p>
                      <strong>Privacy & Security:</strong> Your organ donation information is protected under HIPAA 
                      and only accessible to authorized medical professionals for transplant matching.
                    </p>
                    <p>
                      <strong>Medical Eligibility:</strong> Final donation eligibility is determined at the time 
                      of death by medical professionals based on medical and tissue compatibility criteria.
                    </p>
                    <p>
                      <strong>Family Consent:</strong> While registration indicates your wishes, family consent 
                      may still be required. Please discuss your decision with your family.
                    </p>
                    <div className="flex items-center space-x-4 mt-4">
                      <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                        <Clock className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                      <div className="text-xs text-blue-600">
                        Updated organ allocation policies ensure fair distribution
                      </div>
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
