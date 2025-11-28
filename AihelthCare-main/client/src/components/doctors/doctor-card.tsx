import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Video, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock,
  CheckCircle,
  User
} from "lucide-react";

interface Doctor {
  id: string;
  userId: string;
  specialization: string;
  licenseNumber: string;
  hospitalAffiliation?: string;
  isAvailable: boolean;
  consultationFee?: string;
  rating?: string;
  totalConsultations?: number;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const formatFee = (fee?: string) => {
    if (!fee) return 'Free consultation';
    return `$${parseFloat(fee).toFixed(2)}`;
  };

  const getAvailabilityColor = (isAvailable: boolean) => {
    return isAvailable 
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getSpecializationIcon = (specialization: string) => {
    // Return appropriate icon based on specialization
    switch (specialization.toLowerCase()) {
      case 'emergency medicine':
        return '🚑';
      case 'cardiology':
        return '❤️';
      case 'pediatrics':
        return '👶';
      case 'neurology':
        return '🧠';
      case 'orthopedics':
        return '🦴';
      case 'dermatology':
        return '🔬';
      default:
        return '👨‍⚕️';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Doctor Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {getSpecializationIcon(doctor.specialization)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full ${
              doctor.isAvailable ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>

          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg truncate" data-testid={`doctor-name-${doctor.id}`}>
                  Dr. {doctor.id.slice(-8)} {/* Using ID since we don't have actual names */}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">{doctor.specialization}</p>
                {doctor.hospitalAffiliation && (
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {doctor.hospitalAffiliation}
                  </div>
                )}
              </div>
              <Badge className={getAvailabilityColor(doctor.isAvailable)}>
                {doctor.isAvailable ? 'Available' : 'Busy'}
              </Badge>
            </div>

            {/* Rating and Consultations */}
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{doctor.rating || '5.0'}</span>
                <span className="text-xs text-muted-foreground">
                  ({doctor.totalConsultations || 0} reviews)
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>{formatFee(doctor.consultationFee)}</span>
              </div>
            </div>

            {/* License Info */}
            <div className="flex items-center text-xs text-muted-foreground mb-4">
              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
              <span>Licensed: {doctor.licenseNumber}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                disabled={!doctor.isAvailable}
                className="flex-1"
                data-testid={`button-chat-${doctor.id}`}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {doctor.isAvailable ? 'Chat Now' : 'Unavailable'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                disabled={!doctor.isAvailable}
                className="flex-1"
                data-testid={`button-video-${doctor.id}`}
              >
                <Video className="h-4 w-4 mr-1" />
                Video Call
              </Button>

              <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" data-testid={`button-profile-${doctor.id}`}>
                    <User className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                        {getSpecializationIcon(doctor.specialization)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Dr. {doctor.id.slice(-8)}</h3>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Experience:</span>
                        <p className="font-medium">{doctor.totalConsultations || 0} consultations</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{doctor.rating || '5.0'}</span>
                        </div>
                      </div>
                    </div>

                    {doctor.hospitalAffiliation && (
                      <div>
                        <span className="text-muted-foreground text-sm">Hospital:</span>
                        <p className="font-medium">{doctor.hospitalAffiliation}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-muted-foreground text-sm">License Number:</span>
                      <p className="font-medium">{doctor.licenseNumber}</p>
                    </div>

                    <div>
                      <span className="text-muted-foreground text-sm">Consultation Fee:</span>
                      <p className="font-medium">{formatFee(doctor.consultationFee)}</p>
                    </div>

                    {doctor.bio && (
                      <div>
                        <span className="text-muted-foreground text-sm">About:</span>
                        <p className="text-sm mt-1">{doctor.bio}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-4">
                      <Button
                        className="flex-1"
                        disabled={!doctor.isAvailable}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                      <Button
                        variant="outline"
                        disabled={!doctor.isAvailable}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </Button>
                    </div>

                    {!doctor.isAvailable && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Doctor is currently busy. Expected wait time: 5-10 minutes
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Specialization Tags */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {doctor.specialization}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Licensed Professional
            </Badge>
            {doctor.isAvailable && (
              <Badge className="bg-blue-100 text-blue-700 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Available 24/7
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
