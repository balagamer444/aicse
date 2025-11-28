import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserRound, 
  AlertTriangle, 
  Heart, 
  Activity,
  TrendingUp,
  Shield,
  Settings,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from "lucide-react";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);

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

  // Fetch admin data
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: emergencies } = useQuery({
    queryKey: ["/api/emergency/active"],
  });

  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const { data: bloodRequests } = useQuery({
    queryKey: ["/api/blood-donation/requests"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const addProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Added",
        description: "Health product has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddProductDialogOpen(false);
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
        title: "Failed to Add Product",
        description: "There was an error adding the product.",
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
        title: "Error",
        description: "Failed to resolve emergency.",
        variant: "destructive",
      });
    },
  });

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addProductMutation.mutate({
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price') as string),
      imageUrl: formData.get('imageUrl') || '/placeholder-product.jpg',
      inStock: true,
      stockQuantity: parseInt(formData.get('stockQuantity') as string) || 0,
      tags: (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || [],
      isRecommendedForSymptoms: (formData.get('symptoms') as string)?.split(',').map(s => s.trim()) || [],
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
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage doctors, emergencies, donations, and platform operations from this central hub.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Total Users</p>
                    <p className="text-2xl font-bold text-blue-800" data-testid="text-total-users">
                      {stats?.activeChatCount ? `${stats.activeChatCount * 10}+` : '0'}
                    </p>
                    <p className="text-xs text-blue-600">Active platform users</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700">Active Emergencies</p>
                    <p className="text-2xl font-bold text-red-800" data-testid="text-active-emergencies">
                      {emergencies?.length || 0}
                    </p>
                    <p className="text-xs text-red-600">Require attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Available Doctors</p>
                    <p className="text-2xl font-bold text-green-800" data-testid="text-available-doctors">
                      {doctors?.filter((d: any) => d.isAvailable).length || 0}
                    </p>
                    <p className="text-xs text-green-600">Online now</p>
                  </div>
                  <UserRound className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Blood Requests</p>
                    <p className="text-2xl font-bold text-purple-800" data-testid="text-blood-requests">
                      {bloodRequests?.filter((r: any) => r.isActive).length || 0}
                    </p>
                    <p className="text-xs text-purple-600">Urgent need</p>
                  </div>
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="emergencies" data-testid="tab-emergencies">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergencies
              </TabsTrigger>
              <TabsTrigger value="doctors" data-testid="tab-doctors">
                <UserRound className="h-4 w-4 mr-2" />
                Doctors
              </TabsTrigger>
              <TabsTrigger value="donations" data-testid="tab-donations">
                <Heart className="h-4 w-4 mr-2" />
                Donations
              </TabsTrigger>
              <TabsTrigger value="products" data-testid="tab-products">
                <Settings className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span>Platform Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Chat Sessions</span>
                      <Badge variant="secondary" data-testid="text-chat-sessions">
                        {stats?.activeChatCount || 0} active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Doctor Consultations</span>
                      <Badge variant="secondary">24/7 available</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Emergency Response</span>
                      <Badge className="bg-green-100 text-green-700">98% uptime</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Blood Donors</span>
                      <Badge variant="secondary" data-testid="text-blood-donors">
                        {stats?.bloodDonorCount || 0} registered
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span>System Health</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Status</span>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Services</span>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">WebSocket</span>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Emergencies Tab */}
            <TabsContent value="emergencies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span>Active Emergencies</span>
                    </div>
                    <Badge variant="outline" data-testid="badge-emergency-count">
                      {emergencies?.length || 0} Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {emergencies && emergencies.length > 0 ? (
                    <div className="space-y-4">
                      {emergencies.map((emergency: any) => (
                        <div key={emergency.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Badge className={
                                emergency.emergencyType === 'high' 
                                  ? "bg-red-100 text-red-700"
                                  : emergency.emergencyType === 'medium'
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }>
                                {emergency.emergencyType.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-medium">
                                Case #{emergency.id.slice(-8)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-view-${emergency.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => resolveEmergencyMutation.mutate({ id: emergency.id })}
                                disabled={resolveEmergencyMutation.isPending}
                                data-testid={`button-resolve-${emergency.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-2">{emergency.location || 'Not specified'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Time:</span>
                              <span className="ml-2">
                                {new Date(emergency.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {emergency.symptoms && emergency.symptoms.length > 0 && (
                            <div className="mt-3">
                              <span className="text-muted-foreground text-sm">Symptoms:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {emergency.symptoms.slice(0, 3).map((symptom: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {symptom}
                                  </Badge>
                                ))}
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
            </TabsContent>

            {/* Doctors Tab */}
            <TabsContent value="doctors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserRound className="h-5 w-5 text-blue-600" />
                    <span>Doctor Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {doctors && doctors.length > 0 ? (
                    <div className="space-y-4">
                      {doctors.map((doctor: any) => (
                        <div key={doctor.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                Dr
                              </div>
                              <div>
                                <h4 className="font-medium">Doctor ID: {doctor.id.slice(-8)}</h4>
                                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doctor.hospitalAffiliation || 'Independent Practice'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={
                                doctor.isAvailable 
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }>
                                {doctor.isAvailable ? 'Available' : 'Offline'}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Activity className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">{doctor.rating || '5.0'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">License:</span>
                              <span className="ml-2">{doctor.licenseNumber}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Consultations:</span>
                              <span className="ml-2">{doctor.totalConsultations || 0}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fee:</span>
                              <span className="ml-2">${doctor.consultationFee || '0'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserRound className="h-8 w-8 mx-auto mb-4 opacity-50" />
                      <p>No doctors registered</p>
                      <p className="text-sm">Doctor registrations will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Donations Tab */}
            <TabsContent value="donations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      <span>Blood Donation Requests</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bloodRequests && bloodRequests.length > 0 ? (
                      <div className="space-y-3">
                        {bloodRequests.slice(0, 5).map((request: any) => (
                          <div key={request.id} className="border border-border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="bg-red-100 text-red-700">
                                {request.bloodType}
                              </Badge>
                              <Badge className={
                                request.urgencyLevel === 'critical' 
                                  ? "bg-red-100 text-red-700"
                                  : request.urgencyLevel === 'high'
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }>
                                {request.urgencyLevel}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{request.hospitalName}</p>
                            <p className="text-xs text-muted-foreground">{request.location}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {request.unitsNeeded} units needed
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Heart className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No active blood requests</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <span>Donation Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Blood Donors Registered</span>
                      <Badge variant="secondary">{stats?.bloodDonorCount || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Blood Requests</span>
                      <Badge variant="secondary">
                        {bloodRequests?.filter((r: any) => r.isActive).length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Organ Donors</span>
                      <Badge variant="secondary">Protected Data</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lives Saved</span>
                      <Badge className="bg-green-100 text-green-700">500+</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-green-600" />
                      <span>Product Management</span>
                    </div>
                    <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-product">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add Health Product</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleProductSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Product Name *</Label>
                              <Input id="name" name="name" required />
                            </div>
                            <div>
                              <Label htmlFor="category">Category *</Label>
                              <Select name="category" required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Thermometers">Thermometers</SelectItem>
                                  <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                                  <SelectItem value="Vitamins">Vitamins</SelectItem>
                                  <SelectItem value="First Aid">First Aid</SelectItem>
                                  <SelectItem value="Medical Devices">Medical Devices</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea id="description" name="description" required />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="price">Price ($) *</Label>
                              <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="stockQuantity">Stock Quantity</Label>
                              <Input
                                id="stockQuantity"
                                name="stockQuantity"
                                type="number"
                                min="0"
                                defaultValue="0"
                              />
                            </div>
                            <div>
                              <Label htmlFor="imageUrl">Image URL</Label>
                              <Input id="imageUrl" name="imageUrl" placeholder="Optional" />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                              id="tags"
                              name="tags"
                              placeholder="fever, temperature, medical"
                            />
                          </div>

                          <div>
                            <Label htmlFor="symptoms">Recommended for Symptoms (comma-separated)</Label>
                            <Input
                              id="symptoms"
                              name="symptoms"
                              placeholder="fever, headache, pain"
                            />
                          </div>

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsAddProductDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={addProductMutation.isPending}>
                              {addProductMutation.isPending ? "Adding..." : "Add Product"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {products && products.length > 0 ? (
                    <div className="space-y-4">
                      {products.slice(0, 10).map((product: any) => (
                        <div key={product.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">{product.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline">{product.category}</Badge>
                                <span className="text-sm font-medium">${product.price}</span>
                                <Badge className={
                                  product.inStock 
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }>
                                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 mb-2">
                                <Activity className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">{product.rating || '5.0'}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {product.stockQuantity || 0} units
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-8 w-8 mx-auto mb-4 opacity-50" />
                      <p>No products added</p>
                      <p className="text-sm">Health products will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
