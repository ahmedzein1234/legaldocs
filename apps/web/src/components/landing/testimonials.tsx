'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  rating: number;
  content: string;
  companyLogo?: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Ahmed Al Mansouri',
    role: 'Real Estate Developer',
    company: 'Emaar Properties',
    rating: 5,
    content: 'Qannoni has revolutionized how we handle rental agreements and property contracts. The AI-powered generation saves us hours of work, and the bilingual support is perfect for our diverse clientele.',
    avatar: '/avatars/ahmed.jpg',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Legal Counsel',
    company: 'Gulf Tech Solutions',
    rating: 5,
    content: 'The blockchain certification feature gives our clients peace of mind. We can now certify documents permanently and provide verifiable proof of authenticity. Game-changer for our legal practice.',
    avatar: '/avatars/sarah.jpg',
  },
  {
    id: '3',
    name: 'Mohammed Hassan',
    role: 'Business Owner',
    company: 'Hassan Trading LLC',
    rating: 5,
    content: 'As a small business owner, I needed an affordable way to create NDAs and employment contracts. Qannoni provides professional templates that are legally sound and easy to customize.',
    avatar: '/avatars/mohammed.jpg',
  },
  {
    id: '4',
    name: 'Fatima Al Zaabi',
    role: 'HR Director',
    company: 'Dubai Healthcare',
    rating: 5,
    content: 'The digital signature feature has streamlined our hiring process dramatically. We can now onboard employees remotely with legally binding contracts in multiple languages.',
    avatar: '/avatars/fatima.jpg',
  },
  {
    id: '5',
    name: 'David Chen',
    role: 'Startup Founder',
    company: 'TechStart Ventures',
    rating: 5,
    content: 'The AI legal advisor has been invaluable for our startup. We get instant contract reviews and legal guidance without the hefty lawyer fees. Highly recommended!',
    avatar: '/avatars/david.jpg',
  },
  {
    id: '6',
    name: 'Laila Rahman',
    role: 'Property Manager',
    company: 'Dubai Properties',
    rating: 5,
    content: 'Managing hundreds of rental agreements was a nightmare before Qannoni. Now we can generate, track, and renew contracts efficiently. The ROI has been tremendous.',
    avatar: '/avatars/laila.jpg',
  },
];

function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)} aria-label={`Rating: ${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, isActive = false }: { testimonial: Testimonial; isActive?: boolean }) {
  return (
    <Card
      className={cn(
        'h-full transition-all duration-300',
        isActive && 'shadow-xl border-primary/20'
      )}
    >
      <CardContent className="p-6 sm:p-8">
        <Quote className="h-10 w-10 text-primary/20 mb-4" />

        <p className="text-muted-foreground mb-6 leading-relaxed italic">
          "{testimonial.content}"
        </p>

        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {testimonial.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            <p className="text-sm text-muted-foreground">{testimonial.company}</p>
          </div>

          <StarRating rating={testimonial.rating} />
        </div>
      </CardContent>
    </Card>
  );
}

export function TestimonialsCarousel({
  testimonials = defaultTestimonials,
  title = 'What Our Clients Say',
  subtitle = 'Join thousands of satisfied users who trust Qannoni for their legal document needs',
  className,
  autoPlay = true,
  interval = 5000,
}: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const previous = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, next]);

  return (
    <section
      className={cn('py-16 px-4 sm:px-6 lg:px-8', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <TestimonialCard testimonial={testimonial} isActive />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={previous}
              aria-label="Previous testimonial"
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    index === currentIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === currentIndex}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={next}
              aria-label="Next testimonial"
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Grid Layout (Alternative to Carousel)
export function TestimonialsGrid({ testimonials = defaultTestimonials.slice(0, 6) }: { testimonials?: Testimonial[] }) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Professionals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our clients have to say about their experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Compact Testimonial (for smaller spaces)
export function TestimonialCompact({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <StarRating rating={testimonial.rating} className="mb-3" />
      <p className="text-sm text-muted-foreground mb-4 italic">
        "{testimonial.content.slice(0, 150)}..."
      </p>
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
          <AvatarFallback className="text-xs">
            {testimonial.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.company}</p>
        </div>
      </div>
    </div>
  );
}

// Company Logos (Social Proof)
export function CompanyLogos() {
  const companies = [
    'Emaar', 'Dubai Properties', 'Gulf Tech', 'Al Futtaim', 'DP World', 'Majid Al Futtaim'
  ];

  return (
    <div className="py-12">
      <p className="text-center text-sm text-muted-foreground mb-8">
        Trusted by leading companies across the UAE
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {companies.map((company, index) => (
          <div
            key={index}
            className="text-muted-foreground/50 font-semibold text-lg hover:text-muted-foreground transition-colors"
          >
            {company}
          </div>
        ))}
      </div>
    </div>
  );
}
