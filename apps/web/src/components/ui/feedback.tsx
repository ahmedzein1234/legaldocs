'use client';

import * as React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

// Status Badge Component
export type BadgeStatus = 'success' | 'error' | 'warning' | 'info' | 'draft' | 'pending' | 'signed' | 'expired' | 'cancelled';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, label, className, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<BadgeStatus, { icon: typeof CheckCircle; className: string; defaultLabel: string }> = {
    success: {
      icon: CheckCircle,
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      defaultLabel: 'Success',
    },
    error: {
      icon: AlertCircle,
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      defaultLabel: 'Error',
    },
    warning: {
      icon: AlertTriangle,
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      defaultLabel: 'Warning',
    },
    info: {
      icon: Info,
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      defaultLabel: 'Info',
    },
    draft: {
      icon: Info,
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      defaultLabel: 'Draft',
    },
    pending: {
      icon: AlertTriangle,
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      defaultLabel: 'Pending',
    },
    signed: {
      icon: CheckCircle,
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      defaultLabel: 'Signed',
    },
    expired: {
      icon: AlertCircle,
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      defaultLabel: 'Expired',
    },
    cancelled: {
      icon: X,
      className: 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
      defaultLabel: 'Cancelled',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold transition-colors',
        config.className,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={label || config.defaultLabel}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {label || config.defaultLabel}
    </span>
  );
}

// Confirmation Dialog
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Alert Banner (inline alerts)
interface AlertBannerProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AlertBanner({ type, title, message, onClose, className, action }: AlertBannerProps) {
  const config = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    error: {
      icon: AlertCircle,
      className: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      className: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      icon: Info,
      className: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const { icon: Icon, className: typeClassName, iconColor } = config[type];

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        typeClassName,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <p className="text-sm">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Progress Steps Indicator
interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ProgressSteps({
  steps,
  currentStep,
  onStepClick,
  className,
  orientation = 'horizontal',
}: ProgressStepsProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <nav
      className={cn(
        'flex',
        isHorizontal ? 'flex-row items-center' : 'flex-col',
        className
      )}
      aria-label="Progress"
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                'flex items-center gap-3',
                isHorizontal ? 'flex-row' : 'flex-col',
                !isHorizontal && 'w-full'
              )}
            >
              <button
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-3',
                  isClickable && 'cursor-pointer hover:opacity-80',
                  !isClickable && 'cursor-default',
                  !isHorizontal && 'w-full'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary',
                    !isCompleted && !isCurrent && 'border-muted bg-muted text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className={cn('text-start', isHorizontal && 'hidden sm:block')}>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-primary',
                      !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  )}
                </div>
              </button>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1',
                  isHorizontal
                    ? 'h-0.5 mx-2 min-w-[2rem]'
                    : 'w-0.5 h-8 ms-5',
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// Success Message
export function SuccessMessage({ title, message, className }: { title?: string; message: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center text-center p-6', className)}>
      <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-4">
        <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Error Message
export function ErrorMessage({ title, message, className }: { title?: string; message: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center text-center p-6', className)}>
      <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 mb-4">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Info Message
export function InfoMessage({ title, message, className }: { title?: string; message: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center text-center p-6', className)}>
      <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-4">
        <Info className="h-12 w-12 text-blue-600 dark:text-blue-400" />
      </div>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Notification Counter Badge
export function NotificationBadge({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <span
      className={cn(
        'absolute -top-1 -end-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground',
        className
      )}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
}
