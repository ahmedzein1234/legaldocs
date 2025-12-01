/**
 * Lawyer Matching Algorithm
 *
 * Intelligent lawyer matching system that considers:
 * - Specialization match
 * - Location proximity
 * - Language compatibility
 * - Budget alignment
 * - Response time preferences
 * - Performance metrics (rating, success rate)
 * - Availability
 *
 * Uses weighted scoring to rank lawyers
 */

export interface MatchPreferences {
  documentType?: string;
  specialization?: string;
  emirate?: string;
  languages?: string[];
  budgetMin?: number;
  budgetMax?: number;
  urgency?: 'standard' | 'urgent' | 'express';
  preferredResponseTime?: number; // hours
  preferVerified?: boolean;
  preferFeatured?: boolean;
  caseComplexity?: 'simple' | 'moderate' | 'complex';
}

export interface LawyerProfile {
  id: string;
  first_name: string;
  last_name: string;
  specializations: string[];
  languages: string[];
  emirate: string;
  consultation_fee: number;
  hourly_rate: number;
  response_time_hours: number;
  average_rating: number;
  total_reviews: number;
  total_cases_completed: number;
  success_rate: number;
  verification_level: string;
  is_available: boolean;
  accepting_new_clients: boolean;
  featured: boolean;
  years_experience: number;
  current_cases: number;
  max_concurrent_cases: number;
}

export interface MatchScore {
  lawyerId: string;
  totalScore: number;
  breakdown: {
    specializationScore: number;
    locationScore: number;
    languageScore: number;
    budgetScore: number;
    responseTimeScore: number;
    performanceScore: number;
    availabilityScore: number;
    experienceScore: number;
  };
  matchReasons: string[];
  compatibilityLevel: 'excellent' | 'good' | 'fair' | 'low';
}

// Scoring weights - total = 100
const WEIGHTS = {
  specialization: 25, // Most important - right expertise
  performance: 20, // Quality matters
  availability: 15, // Can they take the case?
  budget: 15, // Price alignment
  location: 10, // Proximity for UAE legal matters
  language: 8, // Communication
  responseTime: 5, // Speed of response
  experience: 2, // Years of practice
};

// Specialization mapping for document types
const DOCUMENT_TYPE_SPECIALIZATIONS: Record<string, string[]> = {
  rental_agreement: ['real_estate', 'contracts'],
  sale_agreement: ['real_estate', 'contracts'],
  employment_contract: ['employment', 'contracts'],
  nda: ['corporate', 'contracts', 'intellectual_property'],
  service_agreement: ['corporate', 'contracts'],
  partnership_agreement: ['corporate', 'contracts'],
  power_of_attorney: ['civil', 'family'],
  will: ['family', 'civil'],
  divorce_agreement: ['family'],
  child_custody: ['family'],
  commercial_lease: ['real_estate', 'corporate', 'contracts'],
  construction_contract: ['real_estate', 'contracts'],
  investment_agreement: ['corporate', 'banking'],
  franchise_agreement: ['corporate', 'intellectual_property'],
  ip_license: ['intellectual_property', 'contracts'],
  trademark_registration: ['intellectual_property'],
};

/**
 * Calculate specialization match score
 */
function calculateSpecializationScore(
  lawyer: LawyerProfile,
  preferences: MatchPreferences
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Parse lawyer specializations
  const lawyerSpecs =
    typeof lawyer.specializations === 'string'
      ? JSON.parse(lawyer.specializations)
      : lawyer.specializations || [];

  // Get required specializations from document type or preference
  let requiredSpecs: string[] = [];
  if (preferences.documentType && DOCUMENT_TYPE_SPECIALIZATIONS[preferences.documentType]) {
    requiredSpecs = DOCUMENT_TYPE_SPECIALIZATIONS[preferences.documentType];
  }
  if (preferences.specialization) {
    requiredSpecs.push(preferences.specialization);
  }

  if (requiredSpecs.length === 0) {
    // No specific specialization required
    return { score: 50, reasons: ['No specific specialization required'] };
  }

  // Calculate match
  const matchedSpecs = requiredSpecs.filter((spec) => lawyerSpecs.includes(spec));
  const matchRatio = matchedSpecs.length / requiredSpecs.length;

  if (matchRatio === 1) {
    score = 100;
    reasons.push(`Perfect match: ${matchedSpecs.join(', ')}`);
  } else if (matchRatio >= 0.5) {
    score = 70 + matchRatio * 30;
    reasons.push(`Partial match: ${matchedSpecs.join(', ')}`);
  } else if (matchRatio > 0) {
    score = 40 + matchRatio * 30;
    reasons.push(`Some expertise in: ${matchedSpecs.join(', ')}`);
  } else {
    score = 10;
    reasons.push('No direct specialization match');
  }

  return { score, reasons };
}

/**
 * Calculate location score
 */
function calculateLocationScore(
  lawyer: LawyerProfile,
  preferences: MatchPreferences
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!preferences.emirate) {
    return { score: 80, reasons: ['No location preference specified'] };
  }

  if (lawyer.emirate?.toLowerCase() === preferences.emirate.toLowerCase()) {
    return {
      score: 100,
      reasons: [`Located in ${preferences.emirate}`],
    };
  }

  // Adjacent emirates get partial score
  const adjacentEmirates: Record<string, string[]> = {
    dubai: ['sharjah', 'abu_dhabi', 'ajman'],
    abu_dhabi: ['dubai', 'al_ain'],
    sharjah: ['dubai', 'ajman', 'ras_al_khaimah', 'umm_al_quwain'],
    ajman: ['sharjah', 'dubai'],
    ras_al_khaimah: ['sharjah', 'fujairah', 'umm_al_quwain'],
    fujairah: ['ras_al_khaimah', 'sharjah'],
    umm_al_quwain: ['sharjah', 'ras_al_khaimah', 'ajman'],
  };

  const adjacent = adjacentEmirates[preferences.emirate.toLowerCase()] || [];
  if (adjacent.includes(lawyer.emirate?.toLowerCase() || '')) {
    return {
      score: 60,
      reasons: [`Located in nearby ${lawyer.emirate}`],
    };
  }

  return {
    score: 30,
    reasons: [`Located in ${lawyer.emirate || 'unknown'}, different emirate`],
  };
}

/**
 * Calculate language compatibility score
 */
function calculateLanguageScore(
  lawyer: LawyerProfile,
  preferences: MatchPreferences
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!preferences.languages || preferences.languages.length === 0) {
    return { score: 80, reasons: ['No language preference specified'] };
  }

  const lawyerLangs =
    typeof lawyer.languages === 'string' ? JSON.parse(lawyer.languages) : lawyer.languages || [];

  const matchedLangs = preferences.languages.filter((lang) =>
    lawyerLangs.some((l: string) => l.toLowerCase() === lang.toLowerCase())
  );

  if (matchedLangs.length === preferences.languages.length) {
    return {
      score: 100,
      reasons: [`Speaks all requested languages: ${matchedLangs.join(', ').toUpperCase()}`],
    };
  } else if (matchedLangs.length > 0) {
    return {
      score: 50 + (matchedLangs.length / preferences.languages.length) * 50,
      reasons: [`Speaks: ${matchedLangs.join(', ').toUpperCase()}`],
    };
  }

  return {
    score: 20,
    reasons: ['No language match'],
  };
}

/**
 * Calculate budget alignment score
 */
function calculateBudgetScore(
  lawyer: LawyerProfile,
  preferences: MatchPreferences
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!preferences.budgetMin && !preferences.budgetMax) {
    return { score: 80, reasons: ['No budget preference specified'] };
  }

  const lawyerFee = lawyer.consultation_fee || lawyer.hourly_rate || 0;
  const budgetMin = preferences.budgetMin || 0;
  const budgetMax = preferences.budgetMax || Infinity;

  if (lawyerFee >= budgetMin && lawyerFee <= budgetMax) {
    // Perfect fit within budget
    const midpoint = (budgetMin + (budgetMax === Infinity ? budgetMin * 2 : budgetMax)) / 2;
    const distanceFromMid = Math.abs(lawyerFee - midpoint) / midpoint;
    const score = 100 - distanceFromMid * 20;
    return {
      score: Math.max(score, 80),
      reasons: [`Fee ${lawyerFee} AED within budget range`],
    };
  } else if (lawyerFee < budgetMin) {
    // Below budget - could be good value
    return {
      score: 90,
      reasons: [`Fee ${lawyerFee} AED below minimum budget - great value`],
    };
  } else {
    // Above budget
    const overBudgetRatio = (lawyerFee - budgetMax) / budgetMax;
    const score = Math.max(0, 60 - overBudgetRatio * 100);
    return {
      score,
      reasons: [`Fee ${lawyerFee} AED above budget (max: ${budgetMax} AED)`],
    };
  }
}

/**
 * Calculate response time score
 */
function calculateResponseTimeScore(
  lawyer: LawyerProfile,
  preferences: MatchPreferences
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  const preferredTime = preferences.preferredResponseTime || 24;
  const urgencyMultiplier =
    preferences.urgency === 'express' ? 0.25 : preferences.urgency === 'urgent' ? 0.5 : 1;

  const adjustedPreferred = preferredTime * urgencyMultiplier;
  const lawyerTime = lawyer.response_time_hours || 24;

  if (lawyerTime <= adjustedPreferred) {
    return {
      score: 100,
      reasons: [`Responds within ${lawyerTime} hours`],
    };
  }

  const ratio = adjustedPreferred / lawyerTime;
  const score = Math.max(20, ratio * 100);

  return {
    score,
    reasons: [`Response time: ${lawyerTime} hours`],
  };
}

/**
 * Calculate performance score based on ratings and success
 */
function calculatePerformanceScore(lawyer: LawyerProfile): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  // Rating component (0-50 points)
  const ratingScore = ((lawyer.average_rating || 0) / 5) * 50;

  // Success rate component (0-30 points)
  const successScore = ((lawyer.success_rate || 0) / 100) * 30;

  // Review volume confidence (0-20 points)
  const reviewCount = lawyer.total_reviews || 0;
  const reviewScore = Math.min(20, (reviewCount / 50) * 20);

  const totalScore = ratingScore + successScore + reviewScore;

  if (lawyer.average_rating >= 4.5 && reviewCount >= 20) {
    reasons.push(`Top-rated: ${lawyer.average_rating}★ (${reviewCount} reviews)`);
  } else if (lawyer.average_rating >= 4.0) {
    reasons.push(`Highly rated: ${lawyer.average_rating}★`);
  } else if (reviewCount > 0) {
    reasons.push(`${lawyer.average_rating}★ rating from ${reviewCount} reviews`);
  } else {
    reasons.push('New to the platform');
  }

  if (lawyer.success_rate >= 90) {
    reasons.push(`${lawyer.success_rate}% success rate`);
  }

  return { score: totalScore, reasons };
}

/**
 * Calculate availability score
 */
function calculateAvailabilityScore(
  lawyer: LawyerProfile,
  preferences: MatchPreferences
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!lawyer.is_available) {
    return { score: 0, reasons: ['Currently unavailable'] };
  }

  if (!lawyer.accepting_new_clients) {
    return { score: 20, reasons: ['Not accepting new clients'] };
  }

  // Check capacity
  const currentLoad = lawyer.current_cases || 0;
  const maxCapacity = lawyer.max_concurrent_cases || 10;
  const capacityRatio = 1 - currentLoad / maxCapacity;

  if (capacityRatio <= 0.1) {
    return { score: 40, reasons: ['Near capacity'] };
  }

  if (capacityRatio >= 0.7) {
    reasons.push('Plenty of availability');
    return { score: 100, reasons };
  }

  reasons.push(`${Math.round(capacityRatio * 100)}% capacity available`);
  return { score: 50 + capacityRatio * 50, reasons };
}

/**
 * Calculate experience score
 */
function calculateExperienceScore(
  lawyer: LawyerProfile,
  preferences: MatchPreferences
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const years = lawyer.years_experience || 0;

  // Complexity-based experience requirements
  const minYears = preferences.caseComplexity === 'complex' ? 10 : preferences.caseComplexity === 'moderate' ? 5 : 2;

  if (years >= minYears * 2) {
    reasons.push(`Highly experienced: ${years} years`);
    return { score: 100, reasons };
  }

  if (years >= minYears) {
    reasons.push(`${years} years experience`);
    return { score: 80, reasons };
  }

  if (years >= minYears / 2) {
    reasons.push(`${years} years experience (below recommended)`);
    return { score: 50, reasons };
  }

  reasons.push(`Limited experience: ${years} years`);
  return { score: 30, reasons };
}

/**
 * Main matching function - calculate comprehensive match score
 */
export function calculateMatchScore(
  lawyer: LawyerProfile,
  preferences: MatchPreferences
): MatchScore {
  const specializationResult = calculateSpecializationScore(lawyer, preferences);
  const locationResult = calculateLocationScore(lawyer, preferences);
  const languageResult = calculateLanguageScore(lawyer, preferences);
  const budgetResult = calculateBudgetScore(lawyer, preferences);
  const responseTimeResult = calculateResponseTimeScore(lawyer, preferences);
  const performanceResult = calculatePerformanceScore(lawyer);
  const availabilityResult = calculateAvailabilityScore(lawyer, preferences);
  const experienceResult = calculateExperienceScore(lawyer, preferences);

  // Calculate weighted total
  const totalScore =
    (specializationResult.score * WEIGHTS.specialization +
      locationResult.score * WEIGHTS.location +
      languageResult.score * WEIGHTS.language +
      budgetResult.score * WEIGHTS.budget +
      responseTimeResult.score * WEIGHTS.responseTime +
      performanceResult.score * WEIGHTS.performance +
      availabilityResult.score * WEIGHTS.availability +
      experienceResult.score * WEIGHTS.experience) /
    100;

  // Apply bonuses
  let finalScore = totalScore;
  if (preferences.preferVerified && lawyer.verification_level !== 'none') {
    finalScore *= 1.05; // 5% bonus for verified
  }
  if (preferences.preferFeatured && lawyer.featured) {
    finalScore *= 1.03; // 3% bonus for featured
  }

  // Determine compatibility level
  let compatibilityLevel: MatchScore['compatibilityLevel'];
  if (finalScore >= 80) {
    compatibilityLevel = 'excellent';
  } else if (finalScore >= 60) {
    compatibilityLevel = 'good';
  } else if (finalScore >= 40) {
    compatibilityLevel = 'fair';
  } else {
    compatibilityLevel = 'low';
  }

  // Collect top reasons
  const allReasons = [
    ...specializationResult.reasons,
    ...performanceResult.reasons,
    ...availabilityResult.reasons,
    ...budgetResult.reasons,
    ...locationResult.reasons,
    ...languageResult.reasons,
  ].filter((r) => !r.includes('No ') && !r.includes('not specified'));

  return {
    lawyerId: lawyer.id,
    totalScore: Math.round(finalScore * 100) / 100,
    breakdown: {
      specializationScore: Math.round(specializationResult.score),
      locationScore: Math.round(locationResult.score),
      languageScore: Math.round(languageResult.score),
      budgetScore: Math.round(budgetResult.score),
      responseTimeScore: Math.round(responseTimeResult.score),
      performanceScore: Math.round(performanceResult.score),
      availabilityScore: Math.round(availabilityResult.score),
      experienceScore: Math.round(experienceResult.score),
    },
    matchReasons: allReasons.slice(0, 5),
    compatibilityLevel,
  };
}

/**
 * Rank lawyers by match score
 */
export function rankLawyers(
  lawyers: LawyerProfile[],
  preferences: MatchPreferences,
  limit: number = 10
): Array<LawyerProfile & { matchScore: MatchScore }> {
  const scoredLawyers = lawyers
    .map((lawyer) => ({
      ...lawyer,
      matchScore: calculateMatchScore(lawyer, preferences),
    }))
    .filter((l) => l.matchScore.totalScore > 0) // Filter out unavailable
    .sort((a, b) => b.matchScore.totalScore - a.matchScore.totalScore);

  return scoredLawyers.slice(0, limit);
}

/**
 * Get match explanation for user
 */
export function getMatchExplanation(
  matchScore: MatchScore,
  locale: 'en' | 'ar' = 'en'
): { title: string; description: string; highlights: string[] } {
  const { compatibilityLevel, matchReasons, breakdown } = matchScore;

  const titles = {
    excellent: {
      en: 'Excellent Match',
      ar: 'توافق ممتاز',
    },
    good: {
      en: 'Good Match',
      ar: 'توافق جيد',
    },
    fair: {
      en: 'Fair Match',
      ar: 'توافق متوسط',
    },
    low: {
      en: 'Limited Match',
      ar: 'توافق محدود',
    },
  };

  const descriptions = {
    excellent: {
      en: 'This lawyer is highly suited for your needs with strong expertise and availability.',
      ar: 'هذا المحامي مناسب جداً لاحتياجاتك مع خبرة قوية وتوافر.',
    },
    good: {
      en: 'This lawyer meets most of your requirements and has relevant experience.',
      ar: 'هذا المحامي يلبي معظم متطلباتك ولديه خبرة ذات صلة.',
    },
    fair: {
      en: 'This lawyer partially matches your criteria. Consider reviewing their profile.',
      ar: 'هذا المحامي يتوافق جزئياً مع معاييرك. يُنصح بمراجعة ملفه.',
    },
    low: {
      en: 'Limited match. You may want to expand your search criteria.',
      ar: 'توافق محدود. قد ترغب في توسيع معايير البحث.',
    },
  };

  // Generate highlights from high-scoring areas
  const highlights: string[] = [];
  if (breakdown.specializationScore >= 80) {
    highlights.push(locale === 'ar' ? 'خبرة في التخصص المطلوب' : 'Expert in required specialty');
  }
  if (breakdown.performanceScore >= 80) {
    highlights.push(locale === 'ar' ? 'تقييمات ممتازة' : 'Excellent ratings');
  }
  if (breakdown.availabilityScore >= 80) {
    highlights.push(locale === 'ar' ? 'متاح الآن' : 'Available now');
  }
  if (breakdown.budgetScore >= 80) {
    highlights.push(locale === 'ar' ? 'ضمن الميزانية' : 'Within budget');
  }
  if (breakdown.responseTimeScore >= 80) {
    highlights.push(locale === 'ar' ? 'استجابة سريعة' : 'Fast response');
  }

  return {
    title: titles[compatibilityLevel][locale],
    description: descriptions[compatibilityLevel][locale],
    highlights: highlights.length > 0 ? highlights : matchReasons,
  };
}
