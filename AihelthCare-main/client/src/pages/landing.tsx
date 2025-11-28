import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Bot, 
  Stethoscope, 
  AlertTriangle, 
  UserRound, 
  Droplet,
  ShoppingCart,
  Shield,
  Clock,
  Globe 
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="text-primary-foreground h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI HealthConnect</h1>
                <p className="text-sm text-gray-600">Advanced Healthcare Platform</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'} 
              className="gradient-medical text-white"
              data-testid="button-login"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Your Complete AI-Powered 
              <span className="text-primary"> Healthcare Companion</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get instant medical guidance, connect with doctors worldwide, manage donations, 
              and access emergency care through our comprehensive healthcare ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/api/login'}
                className="gradient-medical text-white text-lg px-8 py-4"
                data-testid="button-start-journey"
              >
                Start Your Health Journey
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">24/7 AI Support</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">HIPAA Compliant</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Global Access</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Emergency Ready</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Healthcare Ecosystem
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for comprehensive healthcare management in one platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Health Chat */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">AI Health Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get instant, intelligent health advice from our advanced AI. 24/7 symptom analysis, 
                  treatment recommendations, and emergency classification.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Real-time symptom analysis</li>
                  <li>• Emergency level classification</li>
                  <li>• Personalized recommendations</li>
                  <li>• Multi-language support</li>
                </ul>
              </CardContent>
            </Card>

            {/* Disease Prediction */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Disease Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Advanced AI-powered disease prediction with confidence scoring. 
                  Input symptoms and get detailed analysis with actionable insights.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• AI-powered predictions</li>
                  <li>• Confidence scoring</li>
                  <li>• Historical tracking</li>
                  <li>• Treatment suggestions</li>
                </ul>
              </CardContent>
            </Card>

            {/* Emergency System */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Emergency Center</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Intelligent emergency classification and response system. 
                  Automatic emergency service contact for critical situations.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Intelligent triage system</li>
                  <li>• Automatic emergency calling</li>
                  <li>• Real-time monitoring</li>
                  <li>• Location-based services</li>
                </ul>
              </CardContent>
            </Card>

            {/* Doctor Network */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <UserRound className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Global Doctor Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Connect with verified doctors worldwide. Video consultations, 
                  real-time chat, and specialist referrals at your fingertips.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Verified medical professionals</li>
                  <li>• Video & chat consultations</li>
                  <li>• Specialist matching</li>
                  <li>• Global availability</li>
                </ul>
              </CardContent>
            </Card>

            {/* Blood Donation */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                  <Droplet className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Blood & Organ Donation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Comprehensive donation management system. Register as a donor, 
                  respond to urgent requests, and help save lives in your community.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Donor registration & tracking</li>
                  <li>• Emergency match alerts</li>
                  <li>• Donation scheduling</li>
                  <li>• Community impact tracking</li>
                </ul>
              </CardContent>
            </Card>

            {/* Health Store */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                  <ShoppingCart className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">AI Health Shopping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Personalized health product recommendations based on your symptoms and health profile. 
                  Curated medical supplies and wellness products.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• AI-powered recommendations</li>
                  <li>• Medical device catalog</li>
                  <li>• Prescription management</li>
                  <li>• Wellness products</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Trusted by Healthcare Professionals</h3>
            <p className="text-xl opacity-90">Making healthcare accessible to everyone, everywhere</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2" data-testid="text-users">50,000+</div>
              <div className="text-lg opacity-90">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" data-testid="text-doctors">1,200+</div>
              <div className="text-lg opacity-90">Verified Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" data-testid="text-consultations">100K+</div>
              <div className="text-lg opacity-90">Consultations</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" data-testid="text-lives">500+</div>
              <div className="text-lg opacity-90">Lives Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Healthcare Experience?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust AI HealthConnect for their healthcare needs. 
            Start your journey to better health today.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="gradient-medical text-white text-lg px-12 py-4"
            data-testid="button-join-now"
          >
            Join AI HealthConnect Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="text-primary-foreground h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold">AI HealthConnect</h4>
                <p className="text-sm text-gray-400">Advanced Healthcare Platform</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Empowering individuals with AI-driven healthcare solutions. 
              Making quality healthcare accessible, affordable, and available to everyone.
            </p>
            <p className="text-sm text-gray-500">
              © 2024 AI HealthConnect. All rights reserved. | HIPAA Compliant | Global Healthcare Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
