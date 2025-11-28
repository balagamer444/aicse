import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Users, 
  MapPin, 
  Calendar, 
  Activity,
  Shield,
  Star,
  AlertCircle
} from "lucide-react";

interface OrganDonationMatch {
  id: string;
  donorId: string;
  recipientId: string;
  organType: string;
  matchScore?: string;
  status: string;
  hospitalId?: string;
  medicalNotes?: string;
  createdAt: string;
  transplantedAt?: string;
}

interface OrganDonationCardProps {
  match: OrganDonationMatch;
  type: 'donor' | 'recipient';
}

export default function OrganDonationCard({ match, type }: OrganDonationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'potential': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'transplanted': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'potential': return <Activity className="h-4 w-4" />;
      case 'under_review': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <Star className="h-4 w-4" />;
      case 'transplanted': return <Heart className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getOrganIcon = (organType: string) => {
    switch (organType.toLowerCase()) {
      case 'heart': return '❤️';
      case 'liver': return '🫀';
      case 'kidney': return '🫘';
      case 'lung': return '🫁';
      case 'pancreas': return '🩸';
      case 'cornea': return '👁️';
      default: return '🏥';
    }
  };

  const formatMatchScore = (score?: string) => {
    if (!score) return 'Calculating...';
    const numScore = parseFloat(score);
    if (numScore >= 90) return 'Excellent';
    if (numScore >= 80) return 'Very Good';
    if (numScore >= 70) return 'Good';
    return 'Fair';
  };

  const getMatchScoreColor = (score?: string) => {
    if (!score) return 'text-gray-600';
    const numScore = parseFloat(score);
    if (numScore >= 90) return 'text-green-600';
    if (numScore >= 80) return 'text-blue-600';
    if (numScore >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white">
              <span className="text-sm">{getOrganIcon(match.organType)}</span>
            </div>
            <div>
              <span className="text-lg font-semibold capitalize" data-testid={`organ-type-${match.id}`}>
                {match.organType}
              </span>
              <p className="text-sm text-muted-foreground">
                {type === 'donor' ? 'Donation Match' : 'Recipient Match'}
              </p>
            </div>
          </CardTitle>
          <Badge className={getStatusColor(match.status)}>
            {getStatusIcon(match.status)}
            <span className="ml-1 capitalize">{match.status.replace('_', ' ')}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match Score */}
        {match.matchScore && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Compatibility Score:</span>
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${getMatchScoreColor(match.matchScore)}`} data-testid={`match-score-${match.id}`}>
                {formatMatchScore(match.matchScore)}
              </span>
              <Badge variant="outline" className="text-xs">
                {match.matchScore}%
              </Badge>
            </div>
          </div>
        )}

        {/* Match Details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Match ID: <span className="font-mono">{match.id.slice(-8)}</span>
            </span>
          </div>

          {match.hospitalId && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Hospital: {match.hospitalId.slice(-8)}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {match.transplantedAt 
                ? `Transplanted: ${new Date(match.transplantedAt).toLocaleDateString()}`
                : `Matched: ${new Date(match.createdAt).toLocaleDateString()}`
              }
            </span>
          </div>
        </div>

        {/* Medical Notes */}
        {match.medicalNotes && (
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Medical Notes:</p>
            <p className="text-sm" data-testid={`medical-notes-${match.id}`}>{match.medicalNotes}</p>
          </div>
        )}

        {/* Status-specific information */}
        {match.status === 'potential' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">
                Potential Match Identified
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Medical teams are reviewing compatibility for potential transplant.
            </p>
          </div>
        )}

        {match.status === 'under_review' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 font-medium">
                Under Medical Review
              </span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Detailed medical evaluation and testing in progress.
            </p>
          </div>
        )}

        {match.status === 'approved' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                Approved for Transplant
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Medical teams have approved this match. Scheduling in progress.
            </p>
          </div>
        )}

        {match.status === 'transplanted' && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-800 font-medium">
                Transplant Completed
              </span>
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Successful transplant procedure. Thank you for your contribution to saving a life.
            </p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>
              All donation information is HIPAA protected and handled with strict confidentiality.
            </span>
          </div>
        </div>

        {/* Action Button */}
        {match.status === 'potential' && (
          <Button 
            variant="outline" 
            className="w-full"
            data-testid={`button-contact-${match.id}`}
          >
            Contact Medical Team
          </Button>
        )}

        {match.status === 'under_review' && (
          <Button 
            variant="outline" 
            className="w-full"
            disabled
            data-testid={`button-pending-${match.id}`}
          >
            Awaiting Medical Review
          </Button>
        )}

        {match.status === 'approved' && (
          <Button 
            className="w-full gradient-medical text-white"
            data-testid={`button-schedule-${match.id}`}
          >
            View Schedule Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
