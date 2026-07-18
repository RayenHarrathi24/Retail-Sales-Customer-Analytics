import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { FilterProvider } from '@/context/FilterContext';

// Pages
import ExecutiveDashboard from '@/pages/ExecutiveDashboard';
import SalesPerformance from '@/pages/SalesPerformance';
import CustomerAnalytics from '@/pages/CustomerAnalytics';
import ProductAnalytics from '@/pages/ProductAnalytics';
import GeographicAnalysis from '@/pages/GeographicAnalysis';
import ExecutiveInsights from '@/pages/ExecutiveInsights';
import Documentation from '@/pages/Documentation';
import DataDownload from '@/pages/DataDownload';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={ExecutiveDashboard} />
      <Route path="/sales" component={SalesPerformance} />
      <Route path="/customers" component={CustomerAnalytics} />
      <Route path="/products" component={ProductAnalytics} />
      <Route path="/geography" component={GeographicAnalysis} />
      <Route path="/insights" component={ExecutiveInsights} />
      <Route path="/docs" component={Documentation} />
      <Route path="/data" component={DataDownload} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Enforce dark mode by default for an impressive BI dashboard look
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FilterProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </FilterProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
