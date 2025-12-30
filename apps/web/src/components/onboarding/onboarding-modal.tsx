'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Scale,
  Building,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  FileText,
  Shield,
  Users,
  Briefcase,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  useUserPreferences,
  UserRole,
  roleConfigs,
  InterfaceMode,
} from '@/lib/user-preferences-context';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  { id: 'welcome', title: { en: 'Welcome', ar: 'مرحباً' } },
  { id: 'role', title: { en: 'Your Role', ar: 'دورك' } },
  { id: 'mode', title: { en: 'Experience', ar: 'التجربة' } },
  { id: 'ready', title: { en: 'Ready!', ar: 'جاهز!' } },
];

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const locale = useLocale() as 'en' | 'ar';
  const { setRole, setInterfaceMode, completeOnboarding, preferences } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole>(preferences.role);
  const [selectedMode, setSelectedMode] = useState<InterfaceMode>(preferences.interfaceMode);

  const handleNext = () => {
    if (currentStep === 1) {
      setRole(selectedRole);
      // Auto-select mode based on role
      const config = roleConfigs[selectedRole];
      setSelectedMode(config.defaultMode);
    }
    if (currentStep === 2) {
      setInterfaceMode(selectedMode);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    onComplete();
  };

  const roleOptions: { role: UserRole; icon: React.ReactNode; color: string }[] = [
    { role: 'individual', icon: <User className="h-8 w-8" />, color: 'from-blue-500 to-cyan-500' },
    { role: 'business', icon: <Building2 className="h-8 w-8" />, color: 'from-purple-500 to-pink-500' },
    { role: 'lawyer', icon: <Scale className="h-8 w-8" />, color: 'from-amber-500 to-orange-500' },
    { role: 'law_firm', icon: <Building className="h-8 w-8" />, color: 'from-emerald-500 to-teal-500' },
  ];

  const modeOptions: { mode: InterfaceMode; features: string[] }[] = [
    {
      mode: 'simple',
      features: locale === 'ar'
        ? ['واجهة نظيفة وبسيطة', 'الميزات الأساسية فقط', 'مثالي للبدء السريع', 'يمكن الترقية لاحقاً']
        : ['Clean, simple interface', 'Essential features only', 'Perfect for quick start', 'Upgrade anytime'],
    },
    {
      mode: 'pro',
      features: locale === 'ar'
        ? ['جميع الميزات المتقدمة', 'إدارة القضايا والوقت', 'أدوات الذكاء الاصطناعي', 'تحكم كامل']
        : ['All advanced features', 'Case & time management', 'AI-powered tools', 'Full control'],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden" hideCloseButton>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                  <FileText className="h-10 w-10 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {locale === 'ar' ? 'مرحباً بك في Qannoni' : 'Welcome to Qannoni'}
                  </h2>
                  <p className="text-muted-foreground">
                    {locale === 'ar'
                      ? 'منصتك الشاملة للوثائق القانونية في دول الخليج'
                      : 'Your complete legal document platform for the GCC'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { icon: <Sparkles className="h-6 w-6" />, label: locale === 'ar' ? 'ذكاء اصطناعي' : 'AI-Powered' },
                    { icon: <Shield className="h-6 w-6" />, label: locale === 'ar' ? 'آمن' : 'Secure' },
                    { icon: <Zap className="h-6 w-6" />, label: locale === 'ar' ? 'سريع' : 'Fast' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50">
                      <div className="text-primary">{item.icon}</div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">
                  {locale === 'ar'
                    ? 'دعنا نخصص التجربة لك في دقيقة واحدة'
                    : "Let's personalize your experience in just 1 minute"}
                </p>
              </motion.div>
            )}

            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    {locale === 'ar' ? 'ما الذي يصفك بشكل أفضل؟' : 'What best describes you?'}
                  </h2>
                  <p className="text-muted-foreground">
                    {locale === 'ar'
                      ? 'سنخصص الواجهة بناءً على احتياجاتك'
                      : "We'll customize your interface based on your needs"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {roleOptions.map(({ role, icon, color }) => {
                    const config = roleConfigs[role];
                    const isSelected = selectedRole === role;

                    return (
                      <Card
                        key={role}
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:shadow-lg',
                          isSelected && 'ring-2 ring-primary shadow-lg'
                        )}
                        onClick={() => setSelectedRole(role)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center gap-3">
                            <div className={cn(
                              'w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br',
                              color
                            )}>
                              {icon}
                            </div>
                            <div>
                              <p className="font-semibold">
                                {config.label[locale]}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {config.description[locale]}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 end-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Mode Selection */}
            {currentStep === 2 && (
              <motion.div
                key="mode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    {locale === 'ar' ? 'اختر تجربتك' : 'Choose your experience'}
                  </h2>
                  <p className="text-muted-foreground">
                    {locale === 'ar'
                      ? 'يمكنك التبديل في أي وقت من الإعدادات'
                      : 'You can switch anytime from settings'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {modeOptions.map(({ mode, features }) => {
                    const isSelected = selectedMode === mode;
                    const isSimple = mode === 'simple';

                    return (
                      <Card
                        key={mode}
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden',
                          isSelected && 'ring-2 ring-primary shadow-lg'
                        )}
                        onClick={() => setSelectedMode(mode)}
                      >
                        <CardContent className="p-5">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center',
                                isSimple
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                  : 'bg-gradient-to-br from-purple-500 to-indigo-500'
                              )}>
                                {isSimple ? (
                                  <Zap className="h-6 w-6 text-white" />
                                ) : (
                                  <Briefcase className="h-6 w-6 text-white" />
                                )}
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>

                            <div>
                              <h3 className="font-bold text-lg">
                                {isSimple
                                  ? (locale === 'ar' ? 'الوضع البسيط' : 'Simple Mode')
                                  : (locale === 'ar' ? 'الوضع المتقدم' : 'Pro Mode')}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {isSimple
                                  ? (locale === 'ar' ? 'للمستخدمين الجدد' : 'For new users')
                                  : (locale === 'ar' ? 'للمحترفين' : 'For professionals')}
                              </p>
                            </div>

                            <ul className="space-y-2">
                              {features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommended badge */}
                          {((selectedRole === 'lawyer' || selectedRole === 'law_firm') && !isSimple) ||
                           ((selectedRole === 'individual' || selectedRole === 'business') && isSimple) ? (
                            <div className="absolute top-0 end-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg">
                              {locale === 'ar' ? 'موصى به' : 'Recommended'}
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Ready */}
            {currentStep === 3 && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5, delay: 0.2 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg"
                >
                  <Check className="h-10 w-10 text-white" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {locale === 'ar' ? 'أنت جاهز!' : "You're all set!"}
                  </h2>
                  <p className="text-muted-foreground">
                    {locale === 'ar'
                      ? 'تم تخصيص تجربتك. يمكنك تغيير الإعدادات في أي وقت.'
                      : "Your experience is customized. You can change settings anytime."}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 text-start">
                  <h4 className="font-semibold mb-3">
                    {locale === 'ar' ? 'ملخص إعداداتك' : 'Your setup summary'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{locale === 'ar' ? 'الدور' : 'Role'}</span>
                      <span className="font-medium">{roleConfigs[selectedRole].label[locale]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{locale === 'ar' ? 'الوضع' : 'Mode'}</span>
                      <span className="font-medium">
                        {selectedMode === 'simple'
                          ? (locale === 'ar' ? 'بسيط' : 'Simple')
                          : (locale === 'ar' ? 'متقدم' : 'Pro')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {locale === 'ar'
                      ? 'نصيحة: استخدم زر التبديل في الشريط العلوي للتنقل بين الأوضاع'
                      : 'Tip: Use the toggle in the header to switch between modes'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-between items-center bg-muted/30">
          <div>
            {currentStep > 0 && currentStep < 3 && (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 me-2" />
                {locale === 'ar' ? 'السابق' : 'Back'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === currentStep ? 'bg-primary w-4' : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>

          <div>
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                {locale === 'ar' ? 'التالي' : 'Next'}
                <ArrowRight className="h-4 w-4 ms-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-gradient-to-r from-primary to-blue-600">
                {locale === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                <Sparkles className="h-4 w-4 ms-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
