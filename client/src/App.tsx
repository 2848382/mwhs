import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home         from "./pages/Home";
import Dashboard    from "./pages/Dashboard";
import MemoryRoom   from "./pages/MemoryRoom";
import InteractiveMap from "./pages/InteractiveMap";
import GMDashboard  from "./pages/GMDashboard";
import NoticePage   from "./pages/NoticePage";
import ReportPage   from "./pages/ReportPage";
import MessageInbox from "./pages/MessageInbox";

function Router() {
  return (
    <Switch>
      <Route path={"\\"}          component={Home} />
      <Route path={"/dashboard"}  component={Dashboard} />
      <Route path={"/records"}    component={MemoryRoom} />
      <Route path={"/map"}        component={InteractiveMap} />
      <Route path={"/gm"}         component={GMDashboard} />
      <Route path={"/notices"}    component={NoticePage} />
      <Route path={"/report"}     component={ReportPage} />
      <Route path={"/messages"}   component={MessageInbox} />
      <Route path={"/404"}        component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
