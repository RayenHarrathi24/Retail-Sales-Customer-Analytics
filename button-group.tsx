import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number; // percentage
  trendLabel?: string;
  icon: LucideIcon;
  variant?: 'default' | 'positive' | 'negative' | 'neutral';
  format?: 'currency' | 'number' | 'percent';
}

export function KPICard({ 
  title, 
  value, 
  trend, 
  trendLabel = 'vs prior period', 
  icon: Icon,
  variant = 'default',
}: KPICardProps) {
  
  const getTrendColor = (t: number, v: string) => {
    if (v === 'positive' || (v === 'default' && t > 0)) return 'text-emerald-500';
    if (v === 'negative' || (v === 'default' && t < 0)) return 'text-rose-500';
    return 'text-muted-foreground';
  };

  return (
    <Card className="overflow-hidden bg-card border-border hover-elevate transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className="p-2 rounded-md bg-secondary text-secondary-foreground">
            <Icon size={16} />
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className={cn("text-xs font-medium", getTrendColor(trend, variant))}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
