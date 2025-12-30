'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import { Template, Category } from '@/lib/api';

// API response types
interface TemplatesResponse {
  templates: Template[];
}

interface CategoriesResponse {
  categories: Category[];
}

/**
 * Hook to fetch all templates
 * Templates can be fetched with or without authentication
 */
export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await apiRequest<TemplatesResponse>('/api/templates');
      return response.templates;
    },
    staleTime: 1000 * 60 * 5, // Templates don't change often, cache for 5 minutes
  });
}

/**
 * Hook to fetch a single template by ID
 */
export function useTemplate(id: string | null) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest<{ template: Template }>(`/api/templates/${id}`);
      return response.template;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch template categories
 * This is a public endpoint
 */
export function useTemplateCategories() {
  return useQuery({
    queryKey: ['templates', 'categories'],
    queryFn: async () => {
      const response = await apiRequest<CategoriesResponse>('/api/templates/categories');
      return response.categories;
    },
    staleTime: 1000 * 60 * 10, // Categories are very static, cache for 10 minutes
  });
}

/**
 * Hook to fetch templates filtered by category
 */
export function useTemplatesByCategory(category: string | null) {
  const templatesQuery = useTemplates();

  return {
    ...templatesQuery,
    data: category
      ? templatesQuery.data?.filter((template) => template.category === category)
      : templatesQuery.data,
  };
}

/**
 * Hook to search templates by name or description
 */
export function useTemplateSearch(searchTerm: string) {
  const templatesQuery = useTemplates();

  return {
    ...templatesQuery,
    data: searchTerm
      ? templatesQuery.data?.filter(
          (template) =>
            template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.nameAr?.includes(searchTerm) ||
            template.nameUr?.includes(searchTerm) ||
            template.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : templatesQuery.data,
  };
}

/**
 * Combined hook that provides templates, categories, and filtering utilities
 */
export function useTemplatesWithCategories() {
  const templatesQuery = useTemplates();
  const categoriesQuery = useTemplateCategories();

  return {
    templates: templatesQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoadingTemplates: templatesQuery.isLoading,
    isLoadingCategories: categoriesQuery.isLoading,
    isLoading: templatesQuery.isLoading || categoriesQuery.isLoading,
    error: templatesQuery.error || categoriesQuery.error,
    refetchTemplates: templatesQuery.refetch,
    refetchCategories: categoriesQuery.refetch,
  };
}
