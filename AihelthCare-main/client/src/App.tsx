import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import AIChat from "@/pages/ai-chat";
import DiseasePrediction from "@/pages/disease-prediction";
import Emergency from "@/pages/emergency";
import Doctors from "@/pages/doctors";
import BloodDonation from "@/pages/blood-donation";
import OrganDonation from "@/pages/organ-donation";
import HealthStore from "@/pages/health-store";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/ai-chat" component={AIChat} />
          <Route path="/disease-prediction" component={DiseasePrediction} />
          <Route path="/emergency" component={Emergency} />
          <Route path="/doctors" component={Doctors} />
          <Route path="/blood-donation" component={BloodDonation} />
          <Route path="/organ-donation" component={OrganDonation} />
          <Route path="/health-store" component={HealthStore} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
