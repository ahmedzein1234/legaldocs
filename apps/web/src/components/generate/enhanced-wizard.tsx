'use client';

import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface EnhancedWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  locale?: string;
  className?: string;
}

export function EnhancedWizard({
  steps,
  currentStep,
  onStepClick,
  locale = 'en',
  className,
}: EnhancedWizardProps) {
  const isArabic = locale === 'ar';

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && (isCompleted || index === currentStep + 1);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step */}
              <button
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-3 group transition-all',
                  isClickable && 'cursor-pointer'
                )}
              >
                {/* Step Number/Check */}
                <div className={cn(
                  'relative flex items-center justify-center h-12 w-12 rounded-xl font-semibold text-lg transition-all duration-300',
                  isCompleted && 'bg-green-500 text-white shadow-lg shadow-green-500/30',
                  isCurrent && 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground',
                  isClickable && !isCurrent && 'group-hover:bg-primary/10 group-hover:text-primary'
                )}>
                  {isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  {/* Pulse animation for current step */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-xl bg-primary animate-ping opacity-25" />
                  )}
                </div>

                {/* Step Info */}
                <div className="text-start">
                  <p className={cn(
                    'font-semibold text-sm transition-colors',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-green-600 dark:text-green-400',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}>
                    {isArabic ? (step.titleAr || step.title) : step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground hidden lg:block">
                      {isArabic ? (step.descriptionAr || step.description) : step.description}
                    </p>
                  )}
                </div>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full bg-gradient-to-r from-green-500 to-primary transition-all duration-500',
                        isCompleted ? 'w-full' : 'w-0'
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Current Step Info */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {currentStep + 1}
          </div>
          <div>
            <p className="font-semibold text-primary">
              {isArabic ? (steps[currentStep].titleAr || steps[currentStep].title) : steps[currentStep].title}
            </p>
            {steps[currentStep].description && (
              <p className="text-xs text-muted-foreground">
                {isArabic ? (steps[currentStep].descriptionAr || steps[currentStep].description) : steps[currentStep].description}
              </p>
            )}
          </div>
        </div>

        {/* Step Pills */}
        <div className="flex gap-1.5 mt-4">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => onStepClick && (index < currentStep || index === currentStep + 1) && onStepClick(index)}
              disabled={!onStepClick || (index > currentStep && index !== currentStep + 1)}
              className={cn(
                'h-1.5 rounded-full transition-all flex-1',
                index < currentStep && 'bg-green-500',
                index === currentStep && 'bg-primary',
                index > currentStep && 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Step content wrapper with animations
interface StepContentWrapperProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

export function StepContentWrapper({ isActive, children, className }: StepContentWrapperProps) {
  if (!isActive) return null;

  return (
    <div className={cn(
      'animate-in fade-in slide-in-from-right-4 duration-300',
      className
    )}>
      {children}
    </div>
  );
}

// Navigation buttons
interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  backLabel?: string;
  locale?: string;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isNextDisabled,
  isLoading,
  nextLabel,
  backLabel,
  locale = 'en',
}: WizardNavigationProps) {
  const isArabic = locale === 'ar';
  const isLastStep = currentStep === totalSteps - 1;

  const defaultBackLabel = isArabic ? 'السابق' : 'Back';
  const defaultNextLabel = isLastStep
    ? (isArabic ? 'إنشاء' : 'Generate')
    : (isArabic ? 'التالي' : 'Next');

  return (
    <div className="flex items-center justify-between pt-6 border-t mt-6">
      <button
        onClick={onBack}
        disabled={currentStep === 0}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all',
          currentStep === 0
            ? 'text-muted-foreground cursor-not-allowed'
            : 'text-foreground hover:bg-muted'
        )}
      >
        <ChevronRight className={cn('h-5 w-5', isArabic ? '' : 'rotate-180')} />
        {backLabel || defaultBackLabel}
      </button>

      <button
        onClick={onNext}
        disabled={isNextDisabled || isLoading}
        className={cn(
          'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all',
          isNextDisabled || isLoading
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25'
        )}
      >
        {isLoading ? (
          <>
            <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {isArabic ? 'جاري الإنشاء...' : 'Generating...'}
          </>
        ) : (
          <>
            {nextLabel || defaultNextLabel}
            <ChevronRight className={cn('h-5 w-5', isArabic && 'rotate-180')} />
          </>
        )}
      </button>
    </div>
  );
}
