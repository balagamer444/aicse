import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Droplet, 
  MapPin, 
  Phone, 
  Clock, 
  AlertTriangle,
  Heart,
  Calendar,
  Hospital
} from "lucide-react";

interface BloodDonationRequest {
  id: string;
  requesterId: string;
  bloodType: string;
  urgencyLevel: string;
  unitsNeeded: number;
  hospitalName: string;
  location: string;
  contactInfo: string;
  medicalReason?: string;
  isActive: boolean;
  isFulfilled: boolean;
  expiresAt?: string;
  createdAt: string;
  fulfilledAt?: string;
}

interface BloodDonationCardProps {
  request: BloodDonationRequest;
  onRespond: (requestId: string, data: { scheduledDate?: string; notes?: string }) => void;
  isResponding: boolean;
}

export default function BloodDonationCard({ request, onRespond, isResponding }: BloodDonationCardProps) {
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  const getTimeUntilExpiry = () => {
    if (!request.expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(request.expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
  };

  const handleRespond = () => {
    onRespond(request.id, {
      scheduledDate: scheduledDate || undefined,
      notes: notes || undefined,
    });
    setIsResponseDialogOpen(false);
    setScheduledDate("");
    setNotes("");
  };

  const timeRemaining = getTimeUntilExpiry();
  const isExpiringSoon = timeRemaining && (timeRemaining === 'Expired' || timeRemaining.includes('1 day'));

  return (
    <Card className={`hover:shadow-lg transition-shadow ${
      request.urgencyLevel === 'critical' ? 'border-red-200 bg-red-50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              request.urgencyLevel === 'critical' 
                ? 'bg-red-500'
                : request.urgencyLevel === 'high'
                ? 'bg-orange-500'
                : 'bg-blue-500'
            }`}>
              <Droplet className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-red-600">{request.bloodType}</span>
          </CardTitle>
          <Badge className={getUrgencyColor(request.urgencyLevel)}>
            {getUrgencyIcon(request.urgencyLevel)}
            <span className="ml-1">{request.urgencyLevel.toUpperCase()}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Request Details */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Hospital className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium" data-testid={`hospital-${request.id}`}>
              {request.hospitalName}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{request.location}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{request.contactInfo}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplet className="h-4 w-4 text-red-500" />
              <span className="font-medium" data-testid={`units-needed-${request.id}`}>
                {request.unitsNeeded} unit{request.unitsNeeded !== 1 ? 's' : ''} needed
              </span>
            </div>
            {timeRemaining && (
              <div className={`flex items-center space-x-1 text-xs ${
                isExpiringSoon ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                <Clock className="h-3 w-3" />
                <span data-testid={`time-remaining-${request.id}`}>{timeRemaining}</span>
              </div>
            )}
          </div>
        </div>

        {/* Medical Reason */}
        {request.medicalReason && (
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Medical Situation:</p>
            <p className="text-sm" data-testid={`medical-reason-${request.id}`}>
              {request.medicalReason}
            </p>
          </div>
        )}

        {/* Urgency Alert */}
        {(request.urgencyLevel === 'critical' || request.urgencyLevel === 'high') && (
          <div className={`p-3 rounded-lg border ${
            request.urgencyLevel === 'critical' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`h-4 w-4 ${
                request.urgencyLevel === 'critical' ? 'text-red-600' : 'text-orange-600'
              }`} />
              <span className={`text-sm font-medium ${
                request.urgencyLevel === 'critical' ? 'text-red-800' : 'text-orange-800'
              }`}>
                {request.urgencyLevel === 'critical' 
                  ? 'CRITICAL: Immediate donation needed'
                  : 'URGENT: Blood needed within 24 hours'
                }
              </span>
            </div>
          </div>
        )}

        {/* Request Info */}
        <div className="text-xs text-muted-foreground">
          <p>Posted: {new Date(request.createdAt).toLocaleDateString()}</p>
          <p>Request ID: {request.id.slice(-8)}</p>
        </div>

        {/* Action Button */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className={`w-full ${
                request.urgencyLevel === 'critical' 
                  ? 'gradient-emergency text-white'
                  : request.urgencyLevel === 'high'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'gradient-medical text-white'
              }`}
              disabled={!request.isActive || request.isFulfilled}
              data-testid={`button-respond-${request.id}`}
            >
              {!request.isActive 
                ? 'Request Inactive'
                : request.isFulfilled 
                ? 'Already Fulfilled'
                : 'Offer to Donate'
              }
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Droplet className="h-5 w-5 text-red-500" />
                <span>Donate {request.bloodType} Blood</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Donation Details</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <p><strong>Hospital:</strong> {request.hospitalName}</p>
                  <p><strong>Location:</strong> {request.location}</p>
                  <p><strong>Units Needed:</strong> {request.unitsNeeded}</p>
                  <p><strong>Urgency:</strong> {request.urgencyLevel.toUpperCase()}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledDate">Preferred Donation Date (Optional)</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information or preferences..."
                  rows={3}
                />
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important Reminder:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Ensure you meet donation eligibility criteria</li>
                      <li>• Avoid alcohol 24 hours before donation</li>
                      <li>• Eat a healthy meal before donating</li>
                      <li>• Bring valid ID and stay hydrated</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsResponseDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRespond}
                  disabled={isResponding}
                  className="flex-1 gradient-medical text-white"
                >
                  {isResponding ? 'Responding...' : 'Confirm Donation'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contact Information Note */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          <p>
            💡 By responding, your contact information will be shared with the hospital 
            to coordinate the donation process.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
