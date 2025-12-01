import { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { SITE_URL } from '@/lib/seo';

// Required for static export
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Public pages that should be in sitemap
  const publicPages = [
    '',
    '/dashboard',
    '/dashboard/generate',
    '/dashboard/documents',
    '/dashboard/certify',
  ];

  // Template categories
  const templateCategories = [
    'realEstate',
    'employment',
    'business',
    'legal',
    'services',
  ];

  // Individual templates
  const templates = [
    'depositReceipt',
    'rentalAgreement',
    'nda',
    'employmentContract',
    'powerOfAttorney',
    'serviceAgreement',
    'salesContract',
    'mou',
  ];

  const routes: MetadataRoute.Sitemap = [];

  // Add home and main pages for each locale
  locales.forEach(locale => {
    publicPages.forEach(page => {
      routes.push({
        url: `${SITE_URL}/${locale}${page}`,
        lastModified: currentDate,
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map(loc => [loc, `${SITE_URL}/${loc}${page}`])
          ),
        },
      });
    });

    // Add template category pages
    templateCategories.forEach(category => {
      routes.push({
        url: `${SITE_URL}/${locale}/templates/${category}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map(loc => [loc, `${SITE_URL}/${loc}/templates/${category}`])
          ),
        },
      });
    });

    // Add individual template pages
    templates.forEach(template => {
      routes.push({
        url: `${SITE_URL}/${locale}/templates/${template}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map(loc => [loc, `${SITE_URL}/${loc}/templates/${template}`])
          ),
        },
      });
    });
  });

  // Add legal/policy pages (lower priority)
  const legalPages = ['terms', 'privacy', 'contact'];
  locales.forEach(locale => {
    legalPages.forEach(page => {
      routes.push({
        url: `${SITE_URL}/${locale}/${page}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.3,
        alternates: {
          languages: Object.fromEntries(
            locales.map(loc => [loc, `${SITE_URL}/${loc}/${page}`])
          ),
        },
      });
    });
  });

  return routes;
}
