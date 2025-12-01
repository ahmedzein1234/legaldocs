# Component Usage Examples

Complete examples for all new UI/UX components in the LegalDocs application.

---

## Loading States

### Basic Skeletons

```tsx
import { Skeleton, SkeletonCard, SkeletonList } from '@/components/ui/loading-states';

function LoadingPage() {
  return (
    <div className="space-y-4">
      {/* Simple skeleton */}
      <Skeleton className="h-8 w-1/2" />

      {/* Card skeleton */}
      <SkeletonCard />

      {/* List skeleton */}
      <SkeletonList items={5} />
    </div>
  );
}
```

### Progress Indicators

```tsx
import { ProgressBar, CircularProgress } from '@/components/ui/loading-states';

function ProgressExample() {
  const [progress, setProgress] = useState(0);

  return (
    <div className="space-y-8">
      {/* Linear progress */}
      <ProgressBar
        value={progress}
        max={100}
        showLabel
        label="Upload Progress"
        variant="success"
      />

      {/* Circular progress */}
      <CircularProgress
        value={75}
        max={100}
        size={120}
        label="Complete"
      />
    </div>
  );
}
```

### Page Loading

```tsx
import { LoadingOverlay, Spinner } from '@/components/ui/loading-states';

function DocumentPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <LoadingOverlay
        isLoading={isLoading}
        label="Loading document..."
        blur
      />

      <div className="p-6">
        {isLoading ? (
          <Spinner size="lg" label="Please wait..." />
        ) : (
          <DocumentContent />
        )}
      </div>
    </>
  );
}
```

---

## Feedback Components

### Status Badges

```tsx
import { StatusBadge } from '@/components/ui/feedback';

function DocumentStatus({ status }) {
  return (
    <div className="flex gap-2">
      <StatusBadge status="signed" showIcon />
      <StatusBadge status="pending" showIcon />
      <StatusBadge status="draft" showIcon />
    </div>
  );
}
```

### Alert Banners

```tsx
import { AlertBanner } from '@/components/ui/feedback';

function NotificationArea() {
  const [showAlert, setShowAlert] = useState(true);

  if (!showAlert) return null;

  return (
    <AlertBanner
      type="success"
      title="Document Signed Successfully"
      message="All parties have signed the rental agreement."
      onClose={() => setShowAlert(false)}
      action={{
        label: 'View Document',
        onClick: () => router.push('/documents/123')
      }}
    />
  );
}
```

### Confirmation Dialogs

```tsx
import { ConfirmDialog } from '@/components/ui/feedback';

function DeleteButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteDocument();
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="destructive">
        Delete
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
        loading={loading}
      />
    </>
  );
}
```

### Progress Steps

```tsx
import { ProgressSteps } from '@/components/ui/feedback';

function DocumentWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'details',
      label: 'Fill Details',
      description: 'Enter party information'
    },
    {
      id: 'review',
      label: 'Review',
      description: 'Check document content'
    },
    {
      id: 'sign',
      label: 'Sign',
      description: 'Add signatures'
    },
  ];

  return (
    <div className="space-y-8">
      <ProgressSteps
        steps={steps}
        currentStep={currentStep}
        onStepClick={(index) => setCurrentStep(index)}
        orientation="horizontal"
      />

      <div className="p-6 border rounded-lg">
        {/* Step content */}
      </div>
    </div>
  );
}
```

---

## Empty States

### Basic Empty State

```tsx
import { EmptyState } from '@/components/ui/empty-state';

function DocumentList({ documents }) {
  if (documents.length === 0) {
    return (
      <EmptyState
        type="documents"
        title="No documents yet"
        description="Get started by creating your first legal document"
        actionLabel="Create Document"
        onAction={() => router.push('/dashboard/generate')}
        suggestions={[
          'Generate from templates',
          'Upload existing documents',
          'Use AI to draft contracts'
        ]}
        secondaryAction={{
          label: 'Browse Templates',
          onClick: () => router.push('/templates')
        }}
      />
    );
  }

  return <DocumentGrid documents={documents} />;
}
```

### Specialized Empty States

```tsx
import {
  EmptyDocuments,
  EmptySearchResults,
  EmptyInbox
} from '@/components/ui/empty-state';

// No documents
<EmptyDocuments onCreateDocument={handleCreate} />

// No search results
<EmptySearchResults
  searchTerm={query}
  onClearFilters={clearFilters}
/>

// Empty inbox
<EmptyInbox />
```

---

## Landing Page Components

### Features Section

```tsx
import { FeaturesSection } from '@/components/landing/features-section';

function LandingPage() {
  return (
    <div>
      <HeroSection />

      <FeaturesSection
        title="Powerful Features"
        subtitle="Everything you need to manage legal documents"
        columns={3}
        className="bg-muted/50"
      />

      <OtherSections />
    </div>
  );
}
```

### Custom Features

```tsx
import { FeaturesSection } from '@/components/landing/features-section';
import { Zap, Shield, Globe } from 'lucide-react';

const customFeatures = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate documents in seconds',
    color: 'text-yellow-600 bg-yellow-100',
    gradient: 'from-yellow-600 to-orange-600',
    badge: 'New'
  },
  // ... more features
];

<FeaturesSection features={customFeatures} />
```

### Testimonials

```tsx
import { TestimonialsCarousel } from '@/components/landing/testimonials';

function AboutPage() {
  return (
    <div>
      <TestimonialsCarousel
        title="Trusted by Professionals"
        subtitle="See what our clients say"
        autoPlay={true}
        interval={5000}
      />
    </div>
  );
}
```

### Pricing

```tsx
import { PricingSection } from '@/components/landing/pricing-section';

function PricingPage() {
  const handleSelectPlan = (tierId: string) => {
    console.log('Selected plan:', tierId);
    // Handle plan selection
  };

  return (
    <PricingSection
      title="Simple Pricing"
      subtitle="Choose the perfect plan"
      onSelectPlan={handleSelectPlan}
    />
  );
}
```

---

## Dashboard Components

### Activity Feed

```tsx
import { ActivityFeed } from '@/components/dashboard/activity-feed';

function DashboardSidebar() {
  const activities = [
    {
      id: '1',
      type: 'signed',
      title: 'Document Signed',
      description: 'Marina Tower deposit receipt',
      timestamp: '2 hours ago',
      user: {
        name: 'Ahmed Al Mansouri',
        avatar: '/avatars/ahmed.jpg'
      }
    },
    // ... more activities
  ];

  return (
    <ActivityFeed
      activities={activities}
      title="Recent Activity"
      maxHeight="500px"
      showAvatar
      compact={false}
    />
  );
}
```

### Quick Actions

```tsx
import { QuickActions } from '@/components/dashboard/quick-actions';

function DashboardHome() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quick Actions</h2>

      <QuickActions
        variant="grid"
        columns={3}
        onActionClick={(actionId) => {
          console.log('Action clicked:', actionId);
        }}
      />
    </div>
  );
}
```

### Floating Action Button

```tsx
import { FloatingActionButton } from '@/components/dashboard/quick-actions';
import { Sparkles } from 'lucide-react';

function MobileLayout() {
  const createDocAction = {
    id: 'create',
    title: 'Create Document',
    icon: Sparkles,
    href: '/dashboard/generate',
    gradient: 'bg-gradient-to-br from-blue-600 to-indigo-600'
  };

  return (
    <div>
      <MainContent />
      <FloatingActionButton action={createDocAction} />
    </div>
  );
}
```

### Data Visualization

```tsx
import {
  EnhancedStatsCard,
  ProgressRing,
  MiniBarChart
} from '@/components/dashboard/data-visualization';
import { FileText } from 'lucide-react';

function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <EnhancedStatsCard
          title="Total Documents"
          value={124}
          change={12}
          icon={FileText}
          format="number"
          chartData={[10, 15, 12, 18, 20, 25, 30]}
        />
        {/* More stats cards */}
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center">
        <ProgressRing
          value={75}
          max={100}
          label="Goals Completed"
          size={150}
          color="text-primary"
        />
      </div>

      {/* Bar Chart */}
      <MiniBarChart
        data={[
          { label: 'Documents', value: 45, color: 'bg-blue-600' },
          { label: 'Signatures', value: 32, color: 'bg-green-600' },
          { label: 'Templates', value: 18, color: 'bg-purple-600' }
        ]}
        showLabels
        showValues
      />
    </div>
  );
}
```

---

## RTL Support Examples

### Arabic/Urdu Layout

```tsx
function DocumentCard({ locale }) {
  const isRTL = locale === 'ar' || locale === 'ur';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} lang={locale}>
      <Card>
        <CardContent className="p-6">
          {/* Content automatically flips for RTL */}
          <div className="flex items-center gap-4">
            <Avatar />
            <div className="flex-1">
              <h3 className="font-semibold">عقد الإيجار</h3>
              <p className="text-muted-foreground">منذ ساعتين</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Accessibility Examples

### Keyboard Navigation

```tsx
import { QuickActions } from '@/components/dashboard/quick-actions';

function AccessibleDashboard() {
  return (
    <main role="main" aria-label="Dashboard">
      <h1 className="sr-only">Dashboard Overview</h1>

      <QuickActions
        variant="grid"
        onActionClick={(id) => {
          // Announce to screen readers
          const message = `Navigating to ${id}`;
          announceToScreenReader(message);
        }}
      />
    </main>
  );
}

// Helper function
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}
```

### Focus Management

```tsx
import { ConfirmDialog } from '@/components/ui/feedback';

function AccessibleDialog() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    setOpen(false);
    // Return focus to trigger
    triggerRef.current?.focus();
  };

  return (
    <>
      <Button ref={triggerRef} onClick={() => setOpen(true)}>
        Delete Document
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={handleClose}
        title="Confirm Deletion"
        description="This action cannot be undone"
        onConfirm={handleDelete}
        onCancel={handleClose}
      />
    </>
  );
}
```

---

## Responsive Design Examples

### Mobile-First Grid

```tsx
import { QuickActions } from '@/components/dashboard/quick-actions';

function ResponsiveDashboard() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <QuickActions
        variant={isMobile ? 'compact' : 'grid'}
        columns={isMobile ? 2 : 3}
      />
    </div>
  );
}
```

---

## Advanced Patterns

### Conditional Loading

```tsx
import { SkeletonCard } from '@/components/ui/loading-states';
import { EmptyDocuments } from '@/components/ui/empty-state';

function SmartDocumentList() {
  const { data: documents, isLoading, error } = useQuery('documents');

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <AlertBanner
        type="error"
        title="Error Loading Documents"
        message={error.message}
      />
    );
  }

  if (!documents || documents.length === 0) {
    return <EmptyDocuments onCreateDocument={handleCreate} />;
  }

  return <DocumentGrid documents={documents} />;
}
```

### Multi-step Form with Progress

```tsx
import { ProgressSteps } from '@/components/ui/feedback';
import { ProgressBar } from '@/components/ui/loading-states';

function DocumentWizard() {
  const [step, setStep] = useState(0);
  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ProgressBar value={progress} className="mb-8" />

      <ProgressSteps
        steps={wizardSteps}
        currentStep={step}
        className="mb-8"
      />

      <Card>
        <CardContent className="p-6">
          {renderStepContent(step)}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={step === totalSteps - 1}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

---

## Performance Tips

### Lazy Loading Components

```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const TestimonialsCarousel = dynamic(
  () => import('@/components/landing/testimonials').then(m => m.TestimonialsCarousel),
  { ssr: false, loading: () => <SkeletonCard /> }
);

const FeaturesSection = dynamic(
  () => import('@/components/landing/features-section').then(m => m.FeaturesSection),
  { loading: () => <div className="h-96 animate-pulse bg-muted" /> }
);
```

### Memoization

```tsx
import { memo } from 'react';
import { ActivityFeed } from '@/components/dashboard/activity-feed';

const MemoizedActivityFeed = memo(ActivityFeed, (prev, next) => {
  return prev.activities.length === next.activities.length;
});

export default MemoizedActivityFeed;
```

---

## Testing Examples

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/feedback';

describe('StatusBadge', () => {
  it('renders with correct status', () => {
    render(<StatusBadge status="signed" />);
    expect(screen.getByText('Signed')).toBeInTheDocument();
  });

  it('shows icon when showIcon is true', () => {
    render(<StatusBadge status="signed" showIcon />);
    expect(screen.getByRole('status')).toContainElement(
      screen.getByRole('img', { hidden: true })
    );
  });
});
```

---

This completes the component usage examples. For more information, refer to the UI_UX_ENHANCEMENTS.md documentation.
