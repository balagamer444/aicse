import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import DoctorCard from "@/components/doctors/doctor-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  UserRound, 
  Search, 
  Filter, 
  Video, 
  MessageCircle,
  Star,
  MapPin,
  Clock
} from "lucide-react";

const specializations = [
  "All Specializations",
  "Emergency Medicine",
  "Internal Medicine", 
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Psychiatry",
  "Neurology",
  "Oncology",
  "Gynecology",
  "Ophthalmology"
];

export default function Doctors() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

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

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const filteredDoctors = doctors?.filter((doctor: any) => {
    const matchesSearch = searchQuery === "" || 
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospitalAffiliation?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialization = selectedSpecialization === "All Specializations" || 
      doctor.specialization === selectedSpecialization;
    
    const matchesAvailability = availabilityFilter === "all" || 
      (availabilityFilter === "available" && doctor.isAvailable) ||
      (availabilityFilter === "busy" && !doctor.isAvailable);

    return matchesSearch && matchesSpecialization && matchesAvailability;
  }) || [];

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
              Find Doctors
            </h1>
            <p className="text-muted-foreground">
              Connect with verified medical professionals worldwide. 
              Video consultations and real-time chat available 24/7.
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search & Filter</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Input
                    placeholder="Search doctors, specializations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-doctors"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
                
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger data-testid="select-specialization">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger data-testid="select-availability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    <SelectItem value="available">Available Now</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Doctors</p>
                    <p className="text-2xl font-bold" data-testid="text-total-doctors">
                      {doctors?.length || 0}
                    </p>
                  </div>
                  <UserRound className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Now</p>
                    <p className="text-2xl font-bold text-green-600" data-testid="text-available-doctors">
                      {doctors?.filter((d: any) => d.isAvailable).length || 0}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold" data-testid="text-average-rating">4.8</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Video Calls</p>
                    <p className="text-2xl font-bold" data-testid="text-video-calls">24/7</p>
                  </div>
                  <Video className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctorsLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-muted rounded flex-1"></div>
                        <div className="h-8 bg-muted rounded flex-1"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor: any) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-12 text-center">
                    <UserRound className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No doctors found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedSpecialization("All Specializations");
                        setAvailabilityFilter("all");
                      }}
                      data-testid="button-clear-filters"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Featured Specialists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Featured Specialists</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <UserRound className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Emergency Medicine</h4>
                      <p className="text-sm text-muted-foreground">24/7 Critical Care</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Immediate medical attention for life-threatening conditions
                  </p>
                  <Badge className="bg-red-100 text-red-700">Available Now</Badge>
                </div>

                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserRound className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Cardiology</h4>
                      <p className="text-sm text-muted-foreground">Heart Specialists</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Comprehensive cardiovascular care and consultations
                  </p>
                  <Badge className="bg-green-100 text-green-700">5 Available</Badge>
                </div>

                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <UserRound className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Mental Health</h4>
                      <p className="text-sm text-muted-foreground">Psychiatry & Therapy</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Mental health support and psychological counseling
                  </p>
                  <Badge className="bg-purple-100 text-purple-700">Confidential</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
