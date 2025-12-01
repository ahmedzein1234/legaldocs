'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Shield,
  Zap,
  Globe,
  FileText,
  PenTool,
  Scale,
  Lock,
  Users,
  Clock,
  CheckCircle,
  Smartphone,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  color: string;
  gradient: string;
}

interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  className?: string;
  columns?: 2 | 3 | 4;
}

const defaultFeatures: Feature[] = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Generate legal documents in seconds using advanced AI technology trained on legal frameworks.',
    badge: 'AI',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    icon: Shield,
    title: 'Blockchain Certified',
    description: 'Secure and verify your documents on the blockchain for permanent, tamper-proof certification.',
    badge: 'New',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Create documents in English, Arabic, and Urdu with proper legal terminology and formatting.',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    gradient: 'from-green-600 to-emerald-600',
  },
  {
    icon: PenTool,
    title: 'Digital Signatures',
    description: 'Send, track, and collect legally binding digital signatures from multiple parties effortlessly.',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    gradient: 'from-orange-600 to-red-600',
  },
  {
    icon: Scale,
    title: 'Legal AI Advisor',
    description: 'Get instant legal advice, contract reviews, and case analysis powered by AI legal expertise.',
    badge: 'AI',
    color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
    gradient: 'from-indigo-600 to-purple-600',
  },
  {
    icon: FileText,
    title: 'Smart Templates',
    description: 'Access hundreds of legal templates tailored to UAE law and customize them to your needs.',
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    gradient: 'from-yellow-600 to-orange-600',
  },
  {
    icon: Lock,
    title: 'Bank-Level Security',
    description: 'Your documents are encrypted and stored with enterprise-grade security standards.',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    gradient: 'from-red-600 to-pink-600',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate, edit, and send documents in minutes, not days. Boost your productivity 10x.',
    color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
    gradient: 'from-cyan-600 to-blue-600',
  },
  {
    icon: Users,
    title: 'Collaboration Tools',
    description: 'Work together with your team, clients, and lawyers in real-time on any document.',
    color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30',
    gradient: 'from-pink-600 to-rose-600',
  },
  {
    icon: Clock,
    title: 'Version History',
    description: 'Track every change with complete version history and restore any previous version instantly.',
    color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30',
    gradient: 'from-teal-600 to-green-600',
  },
  {
    icon: CheckCircle,
    title: 'Compliance Guaranteed',
    description: 'All documents are compliant with UAE legal requirements and international standards.',
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Access, create, and sign documents from anywhere using your mobile device.',
    color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30',
    gradient: 'from-violet-600 to-purple-600',
  },
];

// Hook to detect when element is in viewport
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isInView };
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0 translate-y-8 transition-all duration-700 ease-out',
        isInView && 'opacity-100 translate-y-0'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className="group h-full card-hover border-2 relative overflow-hidden">
        {/* Gradient overlay on hover */}
        <div
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br',
            feature.gradient
          )}
        />

        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                'p-3 rounded-xl transition-all duration-300 group-hover:scale-110',
                feature.color
              )}
            >
              <Icon className="h-7 w-7" />
            </div>
            {feature.badge && (
              <Badge variant="secondary" className="text-xs font-bold">
                {feature.badge}
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
            {feature.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </CardContent>

        {/* Decorative bottom bar */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300',
            feature.gradient
          )}
        />
      </Card>
    </div>
  );
}

export function FeaturesSection({
  title = 'Powerful Features',
  subtitle = 'Everything you need to manage your legal documents efficiently',
  features = defaultFeatures,
  className,
  columns = 3,
}: FeaturesSectionProps) {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  const gridClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className={cn('py-16 px-4 sm:px-6 lg:px-8', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          ref={ref}
          className={cn(
            'text-center mb-12 opacity-0 translate-y-8 transition-all duration-700',
            isInView && 'opacity-100 translate-y-0'
          )}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className={cn('grid gap-6', gridClasses[columns])}>
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Compact Features List (alternative layout)
export function FeaturesListCompact({ features = defaultFeatures.slice(0, 6) }: { features?: Feature[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all"
          >
            <div className={cn('p-2 rounded-lg shrink-0', feature.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold mb-1 text-sm">{feature.title}</h4>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Hero Features (minimal icons with text)
export function HeroFeatures({ features = defaultFeatures.slice(0, 4) }: { features?: Feature[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div key={index} className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg', feature.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">{feature.title}</span>
          </div>
        );
      })}
    </div>
  );
}
