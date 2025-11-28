import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Home, 
  Bot, 
  Stethoscope, 
  AlertTriangle, 
  UserRound, 
  Droplet, 
  ShoppingCart, 
  Settings,
  Shield 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "AI Health Chat", href: "/ai-chat", icon: Bot, badge: "Live", badgeColor: "bg-green-500" },
  { name: "Disease Prediction", href: "/disease-prediction", icon: Stethoscope },
  { name: "Emergency Center", href: "/emergency", icon: AlertTriangle, badge: "3", badgeColor: "bg-red-500" },
  { name: "Find Doctors", href: "/doctors", icon: UserRound },
  { name: "Blood Donation", href: "/blood-donation", icon: Droplet },
  { name: "Organ Donation", href: "/organ-donation", icon: Heart },
  { name: "Health Store", href: "/health-store", icon: ShoppingCart },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="text-primary-foreground h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-app-name">AI HealthConnect</h1>
            <p className="text-sm text-muted-foreground">Healthcare Platform</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <button
                className={cn(
                  "flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium transition-colors text-left",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={cn("text-white text-xs px-2 py-1 rounded-full", item.badgeColor)}>
                    {item.badge}
                  </span>
                )}
              </button>
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent">
          <div className="relative">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover"
                data-testid="img-user-avatar"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm" data-testid="text-user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || 'User'
              }
            </p>
            <p className="text-xs text-muted-foreground">Premium Member</p>
          </div>
          <Button variant="ghost" size="sm" data-testid="button-settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-3 flex items-center justify-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">HIPAA Protected</span>
        </div>
      </div>
    </aside>
  );
}
