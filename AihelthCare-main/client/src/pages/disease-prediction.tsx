import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle, Clock, Activity } from "lucide-react";

const symptomOptions = [
  "Fever", "Headache", "Cough", "Fatigue", "Nausea", "Vomiting",
  "Diarrhea", "Abdominal pain", "Chest pain", "Shortness of breath",
  "Dizziness", "Muscle aches", "Sore throat", "Runny nose", "Loss of appetite",
  "Joint pain", "Back pain", "Skin rash", "Confusion", "Difficulty sleeping"
];

export default function DiseasePrediction() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState([5]);
  
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

  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/prediction"],
  });

  const predictionMutation = useMutation({
    mutationFn: async (data: { symptoms: string[]; duration: string; severity: number }) => {
      const response = await apiRequest("POST", "/api/prediction", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your symptoms and provided predictions.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prediction"] });
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
        title: "Analysis Failed",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0 || !duration) {
      toast({
        title: "Missing Information",
        description: "Please select at least one symptom and duration.",
        variant: "destructive",
      });
      return;
    }

    predictionMutation.mutate({
      symptoms: selectedSymptoms,
      duration,
      severity: severity[0],
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
              AI Disease Prediction
            </h1>
            <p className="text-muted-foreground">
              Advanced AI-powered symptom analysis with confidence scoring. 
              Input your symptoms to receive detailed medical insights.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Symptom Input Form */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Symptom Analysis</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Select your symptoms for AI-powered analysis
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Primary Symptoms
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {symptomOptions.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`flex items-center space-x-2 p-3 border rounded-lg text-left transition-colors ${
                          selectedSymptoms.includes(symptom)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-accent"
                        }`}
                        data-testid={`symptom-${symptom.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedSymptoms.includes(symptom) 
                            ? "bg-white border-white" 
                            : "border-muted-foreground"
                        }`}>
                          {selectedSymptoms.includes(symptom) && (
                            <div className="w-2 h-2 bg-primary rounded"></div>
                          )}
                        </div>
                        <span className="text-sm">{symptom}</span>
                      </button>
                    ))}
                  </div>
                  {selectedSymptoms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedSymptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Duration
                  </Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue placeholder="How long have you had these symptoms?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less_than_24_hours">Less than 24 hours</SelectItem>
                      <SelectItem value="1-3_days">1-3 days</SelectItem>
                      <SelectItem value="4-7_days">4-7 days</SelectItem>
                      <SelectItem value="more_than_week">More than a week</SelectItem>
                      <SelectItem value="chronic">Chronic (months/years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Severity Level: {severity[0]}/10
                  </Label>
                  <Slider
                    value={severity}
                    onValueChange={setSeverity}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                    data-testid="slider-severity"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={predictionMutation.isPending || selectedSymptoms.length === 0 || !duration}
                  className="w-full"
                  size="lg"
                  data-testid="button-analyze-symptoms"
                >
                  {predictionMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Symptoms with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Analysis Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictionMutation.isPending ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground">AI is analyzing your symptoms...</p>
                    </div>
                  </div>
                ) : predictionMutation.data?.analysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Emergency Level</h4>
                      <Badge 
                        className={
                          predictionMutation.data.analysis.emergencyLevel === 'high' 
                            ? "bg-red-100 text-red-700"
                            : predictionMutation.data.analysis.emergencyLevel === 'medium'
                            ? "bg-yellow-100 text-yellow-700"  
                            : "bg-green-100 text-green-700"
                        }
                        data-testid="badge-emergency-level"
                      >
                        {predictionMutation.data.analysis.emergencyLevel} Risk
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Possible Conditions</h4>
                      <div className="space-y-2">
                        {predictionMutation.data.analysis.predictions.map((pred: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{pred.disease}</p>
                              <p className="text-xs text-muted-foreground">{pred.description}</p>
                            </div>
                            <Badge variant="outline" data-testid={`confidence-${index}`}>
                              {pred.confidence}% match
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-800 mb-2">AI Recommendations</h4>
                          <p className="text-sm text-blue-700" data-testid="text-recommendations">
                            {predictionMutation.data.analysis.recommendations}
                          </p>
                          {predictionMutation.data.analysis.shouldSeeDoctor && (
                            <p className="text-sm text-blue-700 mt-2 font-medium">
                              🏥 We recommend consulting with a healthcare professional.
                            </p>
                          )}
                          {predictionMutation.data.analysis.shouldCallEmergency && (
                            <p className="text-sm text-red-700 mt-2 font-bold">
                              🚨 Seek immediate emergency medical attention!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-4 opacity-50" />
                    <p>Select symptoms and click "Analyze" to get AI-powered insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Previous Predictions History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span>Prediction History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {predictionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : predictions && predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictions.slice(0, 5).map((prediction: any) => (
                    <div key={prediction.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-wrap gap-2">
                          {prediction.symptoms.slice(0, 3).map((symptom: string) => (
                            <Badge key={symptom} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                          {prediction.symptoms.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{prediction.symptoms.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(prediction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {prediction.predictions && (
                        <div className="text-sm">
                          <span className="font-medium">Top prediction: </span>
                          <span>{prediction.predictions[0]?.disease || 'N/A'}</span>
                          {prediction.predictions[0]?.confidence && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {prediction.predictions[0].confidence}%
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-4 opacity-50" />
                  <p>No previous predictions found</p>
                  <p className="text-sm">Your analysis history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
