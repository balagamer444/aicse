import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";

export default function Header() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <header className="bg-card border-b border-border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Health Dashboard</h2>
          <p className="text-muted-foreground">Monitor your health and access AI-powered medical assistance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search health topics..."
              className="w-80 pl-10"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {stats?.emergencyCount || 0}
              </span>
            </Button>
            <div className="h-8 w-px bg-border"></div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium" data-testid="text-system-status">All Systems Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
