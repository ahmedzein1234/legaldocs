'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// User role types
export type UserRole = 'individual' | 'business' | 'lawyer' | 'law_firm';

// Interface mode
export type InterfaceMode = 'simple' | 'pro';

// Feature discovery tracking
export interface FeatureDiscovery {
  hasSeenCaseManagement: boolean;
  hasSeenAIAdvisor: boolean;
  hasSeenLawyerMarketplace: boolean;
  hasSeenTimeTracking: boolean;
  hasSeenBulkOperations: boolean;
  hasSeenAdvancedTemplates: boolean;
  dismissedSuggestions: string[];
}

// User preferences
export interface UserPreferences {
  role: UserRole;
  interfaceMode: InterfaceMode;
  hasCompletedOnboarding: boolean;
  featureDiscovery: FeatureDiscovery;
  quickActions: string[]; // Customizable quick actions
  pinnedFeatures: string[];
  usageStats: {
    documentsCreated: number;
    signaturesRequested: number;
    aiQueriesUsed: number;
    casesCreated: number;
    consultationsBooked: number;
  };
}

// Default preferences
const defaultPreferences: UserPreferences = {
  role: 'individual',
  interfaceMode: 'simple',
  hasCompletedOnboarding: false,
  featureDiscovery: {
    hasSeenCaseManagement: false,
    hasSeenAIAdvisor: false,
    hasSeenLawyerMarketplace: false,
    hasSeenTimeTracking: false,
    hasSeenBulkOperations: false,
    hasSeenAdvancedTemplates: false,
    dismissedSuggestions: [],
  },
  quickActions: ['generate', 'templates', 'signatures'],
  pinnedFeatures: [],
  usageStats: {
    documentsCreated: 0,
    signaturesRequested: 0,
    aiQueriesUsed: 0,
    casesCreated: 0,
    consultationsBooked: 0,
  },
};

// Role configurations
export const roleConfigs: Record<UserRole, {
  label: { en: string; ar: string };
  description: { en: string; ar: string };
  icon: string;
  defaultMode: InterfaceMode;
  suggestedFeatures: string[];
}> = {
  individual: {
    label: { en: 'Individual', ar: 'فرد' },
    description: {
      en: 'Personal legal documents, contracts, and agreements',
      ar: 'وثائق قانونية شخصية وعقود واتفاقيات'
    },
    icon: '👤',
    defaultMode: 'simple',
    suggestedFeatures: ['generate', 'templates', 'signatures', 'lawyers'],
  },
  business: {
    label: { en: 'Business Owner', ar: 'صاحب عمل' },
    description: {
      en: 'Business contracts, NDAs, employment agreements',
      ar: 'عقود تجارية واتفاقيات عدم إفشاء وعقود عمل'
    },
    icon: '🏢',
    defaultMode: 'simple',
    suggestedFeatures: ['generate', 'templates', 'signatures', 'lawyers', 'advisor'],
  },
  lawyer: {
    label: { en: 'Lawyer', ar: 'محامي' },
    description: {
      en: 'Full legal practice management and client services',
      ar: 'إدارة كاملة للممارسة القانونية وخدمات العملاء'
    },
    icon: '⚖️',
    defaultMode: 'pro',
    suggestedFeatures: ['cases', 'documents', 'templates', 'signatures', 'advisor', 'lawyer-portal'],
  },
  law_firm: {
    label: { en: 'Law Firm', ar: 'مكتب محاماة' },
    description: {
      en: 'Team management, case tracking, and client billing',
      ar: 'إدارة الفريق وتتبع القضايا وفواتير العملاء'
    },
    icon: '🏛️',
    defaultMode: 'pro',
    suggestedFeatures: ['cases', 'documents', 'templates', 'signatures', 'advisor', 'lawyer-portal', 'time-tracking'],
  },
};

// Context type
interface UserPreferencesContextType {
  preferences: UserPreferences;
  isLoading: boolean;

  // Role & Mode
  setRole: (role: UserRole) => void;
  setInterfaceMode: (mode: InterfaceMode) => void;
  toggleInterfaceMode: () => void;

  // Onboarding
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Feature discovery
  markFeatureSeen: (feature: keyof FeatureDiscovery) => void;
  dismissSuggestion: (suggestionId: string) => void;
  shouldShowSuggestion: (suggestionId: string) => boolean;

  // Quick actions
  setQuickActions: (actions: string[]) => void;
  togglePinnedFeature: (feature: string) => void;

  // Usage tracking
  incrementUsage: (stat: keyof UserPreferences['usageStats']) => void;

  // Helpers
  isProMode: boolean;
  isSimpleMode: boolean;
  isLegalProfessional: boolean;
  shouldShowFeature: (feature: string) => boolean;
  getProgressiveFeatures: () => string[];
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

const STORAGE_KEY = 'legaldocs_user_preferences';

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    setIsLoading(false);
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, []);

  // Set role
  const setRole = useCallback((role: UserRole) => {
    const config = roleConfigs[role];
    savePreferences({
      ...preferences,
      role,
      interfaceMode: config.defaultMode,
      quickActions: config.suggestedFeatures.slice(0, 4),
    });
  }, [preferences, savePreferences]);

  // Set interface mode
  const setInterfaceMode = useCallback((mode: InterfaceMode) => {
    savePreferences({ ...preferences, interfaceMode: mode });
  }, [preferences, savePreferences]);

  // Toggle interface mode
  const toggleInterfaceMode = useCallback(() => {
    const newMode = preferences.interfaceMode === 'simple' ? 'pro' : 'simple';
    savePreferences({ ...preferences, interfaceMode: newMode });
  }, [preferences, savePreferences]);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    savePreferences({ ...preferences, hasCompletedOnboarding: true });
  }, [preferences, savePreferences]);

  // Reset onboarding
  const resetOnboarding = useCallback(() => {
    savePreferences({ ...defaultPreferences });
  }, [savePreferences]);

  // Mark feature as seen
  const markFeatureSeen = useCallback((feature: keyof FeatureDiscovery) => {
    if (typeof preferences.featureDiscovery[feature] === 'boolean') {
      savePreferences({
        ...preferences,
        featureDiscovery: {
          ...preferences.featureDiscovery,
          [feature]: true,
        },
      });
    }
  }, [preferences, savePreferences]);

  // Dismiss suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    if (!preferences.featureDiscovery.dismissedSuggestions.includes(suggestionId)) {
      savePreferences({
        ...preferences,
        featureDiscovery: {
          ...preferences.featureDiscovery,
          dismissedSuggestions: [...preferences.featureDiscovery.dismissedSuggestions, suggestionId],
        },
      });
    }
  }, [preferences, savePreferences]);

  // Should show suggestion
  const shouldShowSuggestion = useCallback((suggestionId: string) => {
    return !preferences.featureDiscovery.dismissedSuggestions.includes(suggestionId);
  }, [preferences.featureDiscovery.dismissedSuggestions]);

  // Set quick actions
  const setQuickActions = useCallback((actions: string[]) => {
    savePreferences({ ...preferences, quickActions: actions });
  }, [preferences, savePreferences]);

  // Toggle pinned feature
  const togglePinnedFeature = useCallback((feature: string) => {
    const newPinned = preferences.pinnedFeatures.includes(feature)
      ? preferences.pinnedFeatures.filter(f => f !== feature)
      : [...preferences.pinnedFeatures, feature];
    savePreferences({ ...preferences, pinnedFeatures: newPinned });
  }, [preferences, savePreferences]);

  // Increment usage stat
  const incrementUsage = useCallback((stat: keyof UserPreferences['usageStats']) => {
    savePreferences({
      ...preferences,
      usageStats: {
        ...preferences.usageStats,
        [stat]: preferences.usageStats[stat] + 1,
      },
    });
  }, [preferences, savePreferences]);

  // Computed values
  const isProMode = preferences.interfaceMode === 'pro';
  const isSimpleMode = preferences.interfaceMode === 'simple';
  const isLegalProfessional = preferences.role === 'lawyer' || preferences.role === 'law_firm';

  // Should show feature based on mode and role
  const shouldShowFeature = useCallback((feature: string) => {
    // Pro mode shows everything
    if (isProMode) return true;

    // Simple mode features (always visible)
    const simpleFeatures = [
      'dashboard',
      'documents',
      'templates',
      'generate',
      'signatures',
      'lawyers',
      'settings',
    ];

    // Features that unlock based on usage
    const progressiveFeatures: Record<string, () => boolean> = {
      'advisor': () => preferences.usageStats.documentsCreated >= 2,
      'cases': () => isLegalProfessional || preferences.usageStats.documentsCreated >= 5,
      'negotiate': () => preferences.usageStats.documentsCreated >= 3,
      'certify': () => preferences.usageStats.signaturesRequested >= 2,
      'scan': () => preferences.usageStats.documentsCreated >= 1,
      'lawyer-portal': () => isLegalProfessional,
      'time-tracking': () => isLegalProfessional && preferences.usageStats.casesCreated >= 1,
      'consultations': () => preferences.usageStats.consultationsBooked >= 1 || isLegalProfessional,
    };

    if (simpleFeatures.includes(feature)) return true;
    if (progressiveFeatures[feature]) return progressiveFeatures[feature]();

    return false;
  }, [isProMode, isLegalProfessional, preferences.usageStats]);

  // Get features that should be progressively revealed
  const getProgressiveFeatures = useCallback(() => {
    const suggestions: string[] = [];
    const stats = preferences.usageStats;

    // Suggest AI Advisor after creating 2 documents
    if (stats.documentsCreated >= 2 && !preferences.featureDiscovery.hasSeenAIAdvisor) {
      suggestions.push('advisor');
    }

    // Suggest Case Management for legal professionals or heavy users
    if ((isLegalProfessional || stats.documentsCreated >= 5) && !preferences.featureDiscovery.hasSeenCaseManagement) {
      suggestions.push('cases');
    }

    // Suggest Lawyer Marketplace after using the platform
    if (stats.documentsCreated >= 1 && !preferences.featureDiscovery.hasSeenLawyerMarketplace) {
      suggestions.push('lawyers');
    }

    return suggestions;
  }, [preferences, isLegalProfessional]);

  const value: UserPreferencesContextType = {
    preferences,
    isLoading,
    setRole,
    setInterfaceMode,
    toggleInterfaceMode,
    completeOnboarding,
    resetOnboarding,
    markFeatureSeen,
    dismissSuggestion,
    shouldShowSuggestion,
    setQuickActions,
    togglePinnedFeature,
    incrementUsage,
    isProMode,
    isSimpleMode,
    isLegalProfessional,
    shouldShowFeature,
    getProgressiveFeatures,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

// Default context value for when provider is not available
const defaultContextValue: UserPreferencesContextType = {
  preferences: defaultPreferences,
  isLoading: true,
  setRole: () => {},
  setInterfaceMode: () => {},
  toggleInterfaceMode: () => {},
  completeOnboarding: () => {},
  resetOnboarding: () => {},
  markFeatureSeen: () => {},
  dismissSuggestion: () => {},
  shouldShowSuggestion: () => true,
  setQuickActions: () => {},
  togglePinnedFeature: () => {},
  incrementUsage: () => {},
  isProMode: false,
  isSimpleMode: true,
  isLegalProfessional: false,
  shouldShowFeature: () => true,
  getProgressiveFeatures: () => [],
};

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  // Return default context if provider is not available (safer for SSR)
  if (!context) {
    return defaultContextValue;
  }
  return context;
}
