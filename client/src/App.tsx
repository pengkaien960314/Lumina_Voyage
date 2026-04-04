import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { BookingProvider } from "./contexts/BookingContext";
import { FriendProvider } from "./contexts/FriendContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Spots from "./pages/Spots";
import Planner from "./pages/Planner";
import Diary from "./pages/Diary";
import Hotels from "./pages/Hotels";
import Flights from "./pages/Flights";
import Tools from "./pages/Tools";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Friends from "./pages/Friends";
import Milestones from "./pages/Milestones";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/spots" component={Spots} />
      <Route path="/planner" component={Planner} />
      <Route path="/diary" component={Diary} />
      <Route path="/hotels" component={Hotels} />
      <Route path="/flights" component={Flights} />
      <Route path="/tools" component={Tools} />
      <Route path="/settings" component={Settings} />
      <Route path="/profile" component={Profile} />
      <Route path="/my-bookings" component={MyBookings} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/friends" component={Friends} />
      <Route path="/milestones" component={Milestones} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light" switchable>
          <AuthProvider>
            <BookingProvider>
              <FriendProvider>
                <TooltipProvider>
                  <Toaster />
                  <Router />
                </TooltipProvider>
              </FriendProvider>
            </BookingProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
