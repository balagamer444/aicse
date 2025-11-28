import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, AlertTriangle, UserRound, Droplet } from "lucide-react";
import type { DashboardStats } from "@shared/schema";

export default function StatsGrid() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Active AI Chats",
      value: stats?.activeChatCount || 0,
      change: "+12% from yesterday",
      changeColor: "text-green-600",
      icon: MessageCircle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Emergency Cases",
      value: stats?.emergencyCount || 0,
      change: `${stats?.emergencyCount || 0} high priority`,
      changeColor: "text-red-600",
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Available Doctors",
      value: stats?.availableDoctorCount || 0,
      change: "24/7 coverage",
      changeColor: "text-green-600",
      icon: UserRound,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Blood Donors",
      value: stats?.bloodDonorCount || 0,
      change: "45 new this week",
      changeColor: "text-blue-600",
      icon: Droplet,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground" data-testid={`text-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value.toLocaleString()}
                </p>
                <p className={`text-sm mt-1 ${stat.changeColor}`}>{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
