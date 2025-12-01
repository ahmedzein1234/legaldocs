'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Enhanced Stats Card with Trends and Charts
interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  description?: string;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  chartData?: number[]; // Simple sparkline data
  format?: 'number' | 'currency' | 'percentage';
  prefix?: string;
  suffix?: string;
}

export function EnhancedStatsCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  description,
  className,
  trend,
  chartData,
  format = 'number',
  prefix,
  suffix,
}: EnhancedStatsCardProps) {
  const determinedTrend = trend || (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'neutral');

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    down: {
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    neutral: {
      icon: Minus,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  };

  const config = trendConfig[determinedTrend];
  const TrendIcon = config.icon;

  const formattedValue = React.useMemo(() => {
    if (typeof value !== 'number') return value;

    switch (format) {
      case 'currency':
        return `${prefix || 'AED'} ${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      default:
        return `${prefix || ''}${value.toLocaleString()}${suffix || ''}`;
    }
  }, [value, format, prefix, suffix]);

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{formattedValue}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}

            {change !== undefined && (
              <div className="flex items-center gap-1 pt-1">
                <TrendIcon className={cn('h-4 w-4', config.color)} />
                <span className={cn('text-sm font-medium', config.color)}>
                  {Math.abs(change)}%
                </span>
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>

          {Icon && (
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Simple Sparkline */}
        {chartData && chartData.length > 0 && (
          <div className="mt-4">
            <Sparkline data={chartData} className="h-12" color={config.color} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple Sparkline Chart
function Sparkline({ data, className, color }: { data: number[]; className?: string; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className={cn('w-full', className)} viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={cn(color || 'text-primary', 'opacity-70')}
      />
      {/* Area under the line */}
      <polyline
        points={`0,100 ${points} 100,100`}
        fill="currentColor"
        className={cn(color || 'text-primary', 'opacity-10')}
      />
    </svg>
  );
}

// Progress Ring Chart
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  showValue?: boolean;
  color?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  className,
  showValue = true,
  color = 'text-primary',
}: ProgressRingProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(color, 'transition-all duration-500 ease-out')}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
          {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
        </div>
      )}
    </div>
  );
}

// Mini Bar Chart
interface MiniBarChartProps {
  data: { label: string; value: number; color?: string }[];
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
}

export function MiniBarChart({ data, className, showLabels = true, showValues = false }: MiniBarChartProps) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          {showLabels && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              {showValues && <span className="font-medium">{item.value}</span>}
            </div>
          )}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'absolute inset-y-0 start-0 rounded-full transition-all duration-500',
                item.color || 'bg-primary'
              )}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Comparison Card
interface ComparisonCardProps {
  title: string;
  current: {
    label: string;
    value: number;
  };
  previous: {
    label: string;
    value: number;
  };
  format?: 'number' | 'currency' | 'percentage';
  className?: string;
}

export function ComparisonCard({
  title,
  current,
  previous,
  format = 'number',
  className,
}: ComparisonCardProps) {
  const change = ((current.value - previous.value) / previous.value) * 100;
  const isPositive = change > 0;

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `AED ${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{current.label}</p>
            <p className="text-2xl font-bold">{formatValue(current.value)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{previous.label}</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {formatValue(previous.value)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-600" />
          )}
          <span className={cn(
            'text-sm font-medium',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground">change</span>
        </div>

        {/* Visual comparison bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 start-0 bg-primary rounded-full"
            style={{ width: `${(previous.value / Math.max(current.value, previous.value)) * 100}%` }}
          />
          <div
            className={cn(
              'absolute inset-y-0 start-0 rounded-full',
              isPositive ? 'bg-green-600' : 'bg-red-600'
            )}
            style={{ width: `${(current.value / Math.max(current.value, previous.value)) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Metric Grid
interface Metric {
  label: string;
  value: string | number;
  change?: number;
  icon?: LucideIcon;
}

export function MetricsGrid({ metrics, className }: { metrics: Metric[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.change && metric.change > 0;

        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              {metric.change !== undefined && (
                <p className={cn(
                  'text-xs font-medium flex items-center gap-1 mt-1',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {isPositive ? '↑' : '↓'} {Math.abs(metric.change)}%
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
