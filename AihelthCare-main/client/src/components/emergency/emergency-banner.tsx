import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function EmergencyBanner() {
  const { data: emergencies } = useQuery({
    queryKey: ["/api/emergency/active"],
  });

  if (!emergencies || emergencies.length === 0) {
    return null;
  }

  const highPriorityEmergencies = emergencies.filter(
    (e: any) => e.emergencyType === 'high'
  );

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="text-red-500 h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold" data-testid="text-alert-title">Emergency Alert System Active</h3>
          <p className="text-red-700 text-sm" data-testid="text-alert-message">
            {highPriorityEmergencies.length} high-priority cases require immediate attention. 
            AI has automatically contacted emergency services.
          </p>
        </div>
        <Button className="gradient-emergency text-white" data-testid="button-view-details">
          View Details
        </Button>
      </div>
    </div>
  );
}
