import { Link, useLocation } from 'wouter';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  Globe, 
  Lightbulb, 
  BookOpen, 
  Download,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: '/', label: 'Executive', icon: BarChart3 },
    { href: '/sales', label: 'Sales Perf', icon: TrendingUp },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/geography', label: 'Geography', icon: Globe },
    { href: '/insights', label: 'Insights', icon: Lightbulb },
    { href: '/docs', label: 'Docs', icon: BookOpen },
    { href: '/data', label: 'Data', icon: Download },
  ];

  return (
    <div className="relative w-[240px] flex-shrink-0 border-r border-border bg-sidebar/80 backdrop-blur-xl h-full flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-sidebar-foreground">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight text-lg">Nexus BI</span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
          Dashboards
        </div>
        {links.slice(0, 5).map(link => (
          <Link 
            key={link.href} 
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              location === link.href 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}

        <div className="px-3 mt-6 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
          Intelligence
        </div>
        {links.slice(5).map(link => (
          <Link 
            key={link.href} 
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              location === link.href 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-md bg-sidebar-accent/30">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">J. Doe</span>
            <span className="text-xs text-sidebar-foreground/50">Senior Analyst</span>
          </div>
        </div>
      </div>
    </div>
  );
}
