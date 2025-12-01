'use client';

import * as React from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  Send,
  Download,
  Trash2,
  Edit,
  UserPlus,
  MessageSquare,
  Shield,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Activity {
  id: string;
  type: 'created' | 'signed' | 'sent' | 'downloaded' | 'deleted' | 'edited' | 'shared' | 'commented' | 'certified';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    documentName?: string;
    count?: number;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  maxHeight?: string;
  className?: string;
  showAvatar?: boolean;
  compact?: boolean;
}

const activityConfig: Record<Activity['type'], {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}> = {
  created: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  signed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  sent: {
    icon: Send,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  downloaded: {
    icon: Download,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  deleted: {
    icon: Trash2,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  edited: {
    icon: Edit,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  shared: {
    icon: UserPlus,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
  commented: {
    icon: MessageSquare,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  certified: {
    icon: Shield,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
};

function ActivityItem({
  activity,
  showAvatar = true,
  compact = false
}: {
  activity: Activity;
  showAvatar?: boolean;
  compact?: boolean;
}) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 group">
      <div className={cn(
        'p-2 rounded-lg transition-transform group-hover:scale-110',
        config.bgColor,
        config.color
      )}>
        <Icon className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              'font-medium truncate',
              compact ? 'text-sm' : 'text-base'
            )}>
              {activity.title}
            </p>
            <p className={cn(
              'text-muted-foreground truncate',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {activity.description}
            </p>
            {activity.metadata?.documentName && (
              <Badge variant="outline" className="mt-1 text-xs">
                {activity.metadata.documentName}
              </Badge>
            )}
          </div>
          <span className={cn(
            'text-muted-foreground whitespace-nowrap flex-shrink-0',
            compact ? 'text-xs' : 'text-sm'
          )}>
            {activity.timestamp}
          </span>
        </div>

        {showAvatar && activity.user && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar className={cn(compact ? 'h-5 w-5' : 'h-6 w-6')}>
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              <AvatarFallback className="text-xs">
                {activity.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {activity.user.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityFeed({
  activities,
  title = 'Recent Activity',
  maxHeight = '400px',
  className,
  showAvatar = true,
  compact = false,
}: ActivityFeedProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(compact ? 'text-lg' : 'text-xl')}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-4" style={{ maxHeight }}>
          <div className={cn('space-y-4', compact && 'space-y-3')}>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  showAvatar={showAvatar}
                  compact={compact}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Compact Timeline View
export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute start-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <div key={activity.id} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div className={cn(
                'relative z-10 flex-shrink-0 p-2 rounded-full',
                config.bgColor,
                config.color
              )}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-6">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Grouped Activity Feed (by date)
export function GroupedActivityFeed({ activities }: { activities: Activity[] }) {
  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = activity.timestamp.split(' ')[0]; // Simplified date extraction
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{date}</h3>
          <div className="space-y-3">
            {dateActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} compact />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
