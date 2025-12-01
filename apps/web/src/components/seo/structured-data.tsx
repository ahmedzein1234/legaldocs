import Script from 'next/script';
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateTemplateProductSchema,
} from '@/lib/seo';

interface StructuredDataProps {
  type: 'organization' | 'software' | 'website' | 'breadcrumb' | 'faq' | 'template';
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let schema;

  switch (type) {
    case 'organization':
      schema = generateOrganizationSchema();
      break;
    case 'software':
      schema = generateSoftwareApplicationSchema();
      break;
    case 'website':
      schema = generateWebSiteSchema();
      break;
    case 'breadcrumb':
      schema = generateBreadcrumbSchema(data);
      break;
    case 'faq':
      schema = generateFAQSchema(data);
      break;
    case 'template':
      schema = generateTemplateProductSchema(data);
      break;
    default:
      return null;
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema() {
  return <StructuredData type="organization" />;
}

export function SoftwareApplicationSchema() {
  return <StructuredData type="software" />;
}

export function WebSiteSchema() {
  return <StructuredData type="website" />;
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return <StructuredData type="breadcrumb" data={items} />;
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return <StructuredData type="faq" data={faqs} />;
}

export function TemplateProductSchema({
  template,
}: {
  template: {
    name: string;
    description: string;
    category: string;
    language: string;
  };
}) {
  return <StructuredData type="template" data={template} />;
}

export function GlobalSchemas() {
  return (
    <>
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <WebSiteSchema />
    </>
  );
}
