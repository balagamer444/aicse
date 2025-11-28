import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, 
  Search, 
  Star, 
  Heart, 
  Zap,
  Filter,
  TrendingUp,
  Package,
  Truck
} from "lucide-react";

const categories = [
  "All Categories",
  "Thermometers",
  "Pain Relief",
  "Vitamins",
  "First Aid",
  "Blood Pressure",
  "Diabetes Care",
  "Respiratory",
  "Wound Care",
  "Medical Devices"
];

// Mock product data since we don't want to use real external APIs without user request
const mockProducts = [
  {
    id: "1",
    name: "Digital Thermometer",
    description: "Fast, accurate temperature readings with fever alert",
    category: "Thermometers",
    price: 24.99,
    imageUrl: "/api/placeholder/200/150",
    inStock: true,
    rating: 4.8,
    totalReviews: 128,
    tags: ["fever", "temperature", "medical"],
    isRecommendedForSymptoms: ["fever", "headache"]
  },
  {
    id: "2", 
    name: "Pain Relief Tablets",
    description: "Fast-acting pain relief for headaches and mild fever",
    category: "Pain Relief",
    price: 12.50,
    imageUrl: "/api/placeholder/200/150",
    inStock: true,
    rating: 4.6,
    totalReviews: 89,
    tags: ["pain", "headache", "fever"],
    isRecommendedForSymptoms: ["headache", "muscle pain"]
  },
  {
    id: "3",
    name: "Vitamin C Boost",
    description: "Immune system support supplement with zinc",
    category: "Vitamins",
    price: 18.99,
    imageUrl: "/api/placeholder/200/150", 
    inStock: true,
    rating: 4.9,
    totalReviews: 256,
    tags: ["vitamin", "immunity", "supplement"],
    isRecommendedForSymptoms: ["fatigue", "cold symptoms"]
  },
  {
    id: "4",
    name: "Blood Pressure Monitor",
    description: "Automatic digital blood pressure monitor with large display",
    category: "Blood Pressure",
    price: 89.99,
    imageUrl: "/api/placeholder/200/150",
    inStock: true,
    rating: 4.7,
    totalReviews: 143,
    tags: ["blood pressure", "monitoring", "heart health"],
    isRecommendedForSymptoms: ["hypertension", "heart issues"]
  },
  {
    id: "5",
    name: "First Aid Kit",
    description: "Complete emergency first aid kit for home and travel",
    category: "First Aid",
    price: 35.00,
    imageUrl: "/api/placeholder/200/150",
    inStock: true,
    rating: 4.5,
    totalReviews: 67,
    tags: ["first aid", "emergency", "bandages"],
    isRecommendedForSymptoms: ["cuts", "burns", "injuries"]
  },
  {
    id: "6",
    name: "Pulse Oximeter",
    description: "Fingertip pulse oximeter for oxygen saturation monitoring", 
    category: "Medical Devices",
    price: 45.99,
    imageUrl: "/api/placeholder/200/150",
    inStock: true,
    rating: 4.4,
    totalReviews: 92,
    tags: ["oxygen", "pulse", "monitoring"],
    isRecommendedForSymptoms: ["breathing issues", "respiratory"]
  }
];

export default function HealthStore() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [cartItems, setCartItems] = useState<string[]>([]);

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

  // Use mock data instead of real API call
  const products = mockProducts;
  const recommendedProducts = mockProducts.slice(0, 3);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All Categories" || 
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId: string) => {
    setCartItems(prev => [...prev, productId]);
    toast({
      title: "Added to Cart",
      description: "Product has been added to your cart.",
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(id => id !== productId));
    toast({
      title: "Removed from Cart",
      description: "Product has been removed from your cart.",
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
              AI Health Store
            </h1>
            <p className="text-muted-foreground">
              Personalized health product recommendations based on your symptoms and health profile. 
              Curated medical supplies and wellness products.
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Find Products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge variant="secondary" data-testid="badge-cart-count">
                    {cartItems.length} items
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Input
                    placeholder="Search products, symptoms, conditions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-products"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800">AI Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 mb-3">
                    Based on your recent health interactions and symptoms, we recommend these products to support your wellness journey. 
                    Always consult healthcare professionals before starting new medications.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                      <Package className="h-12 w-12 text-blue-600 opacity-50" />
                    </div>
                    <h4 className="font-medium mb-2" data-testid={`product-name-${product.id}`}>
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">${product.price}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-muted-foreground">
                            {product.rating} ({product.totalReviews})
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToCart(product.id)}
                        disabled={cartItems.includes(product.id)}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        {cartItems.includes(product.id) ? "In Cart" : "Add"}
                      </Button>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 mt-2">
                      AI Recommended
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold" data-testid="text-total-products">
                      {products.length}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Stock</p>
                    <p className="text-2xl font-bold text-green-600" data-testid="text-in-stock">
                      {products.filter(p => p.inStock).length}
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
                    <p className="text-2xl font-bold" data-testid="text-avg-rating">4.7</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Free Shipping</p>
                    <p className="text-sm font-medium" data-testid="text-shipping">Over $50</p>
                    <p className="text-xs text-green-600">Fast Delivery</p>
                  </div>
                  <Truck className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      {product.isRecommendedForSymptoms?.length > 0 && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-medium text-lg" data-testid={`product-title-${product.id}`}>
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.rating} ({product.totalReviews})
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-2xl font-bold">${product.price}</span>
                      <div className="space-x-2">
                        {cartItems.includes(product.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(product.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            data-testid={`button-remove-${product.id}`}
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => addToCart(product.id)}
                            data-testid={`button-add-${product.id}`}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {product.isRecommendedForSymptoms && product.isRecommendedForSymptoms.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-1">Recommended for:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.isRecommendedForSymptoms.slice(0, 2).map((symptom) => (
                            <Badge key={symptom} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or category filter
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Categories");
                  }}
                  data-testid="button-clear-search"
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Health Tips */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <TrendingUp className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-green-800 font-semibold mb-2">Health & Wellness Tips</h3>
                  <div className="text-green-700 text-sm space-y-2">
                    <p>
                      <strong>Medication Safety:</strong> Always consult with your healthcare provider before 
                      starting any new medication or supplement, especially if you have existing conditions.
                    </p>
                    <p>
                      <strong>Product Quality:</strong> All products in our store are sourced from verified 
                      suppliers and meet safety standards. Look for FDA approval when applicable.
                    </p>
                    <p>
                      <strong>Emergency Supplies:</strong> Keep a well-stocked first aid kit at home and in 
                      your car. Replace expired items regularly to ensure effectiveness.
                    </p>
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
