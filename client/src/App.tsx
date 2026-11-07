import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Events from "./pages/Events";
import Batches from "./pages/Batches";
import About from "./pages/About";
import Mission from "./pages/Mission";
import Modeling from "./pages/Modeling";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourses from "./pages/AdminCourses";
import AdminEvents from "./pages/AdminEvents";
import AdminBatches from "./pages/AdminBatches";
import AdminTeam from "./pages/AdminTeam";
import AdminCommunity from "./pages/AdminCommunity";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/courses" component={Courses} />
      <Route path="/events" component={Events} />
      <Route path="/batches" component={Batches} />
      <Route path="/about" component={About} />
      <Route path="/mission" component={Mission} />
      <Route path="/modeling" component={Modeling} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/courses" component={AdminCourses} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/admin/batches" component={AdminBatches} />
      <Route path="/admin/team" component={AdminTeam} />
      <Route path="/admin/community" component={AdminCommunity} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Navigation />
            <Router />
            <Footer />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
