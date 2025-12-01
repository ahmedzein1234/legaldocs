# React Query Implementation Guide

This document explains how React Query (TanStack Query) is integrated into the LegalDocs frontend and how to use it effectively.

## Overview

React Query has been added to provide:
- **Automatic caching** - Reduces unnecessary API calls
- **Background refetching** - Keeps data fresh automatically
- **Optimistic updates** - UI updates before server confirms
- **Error handling** - Centralized error management
- **Loading states** - Built-in loading indicators
- **DevTools** - Debug queries in development mode

## Project Structure

```
src/
├── lib/
│   ├── query-client.ts      # QueryClient configuration
│   └── api-client.ts        # Typed API client with auth injection
├── providers/
│   └── query-provider.tsx   # QueryClientProvider wrapper
└── hooks/
    ├── index.ts             # Centralized hook exports
    ├── useAuth.ts           # Authentication hooks
    ├── useDocuments.ts      # Document CRUD operations
    ├── useTemplates.ts      # Template fetching
    ├── useUser.ts           # User profile operations
    └── useSignatures.ts     # Signature request operations
```

## Configuration

### QueryClient Settings

Located in `src/lib/query-client.ts`:

```typescript
{
  staleTime: 1000 * 30,        // Data fresh for 30 seconds
  gcTime: 1000 * 60 * 5,       // Cache for 5 minutes
  retry: 2,                     // Retry failed requests twice
  refetchOnWindowFocus: true,   // Refetch when window focused
  refetchOnMount: true,         // Refetch on component mount
  refetchOnReconnect: true,     // Refetch when reconnected
}
```

### API Base URL

Set via environment variable in `.env.local`:

```
NEXT_PUBLIC_API_URL=https://legaldocs-api.a-m-zein.workers.dev
```

## Usage Examples

### 1. Fetching Documents

```tsx
import { useDocuments } from '@/hooks/useDocuments';

function DocumentsList() {
  const { data: documents, isLoading, error } = useDocuments();

  if (isLoading) return <Loader />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
```

### 2. Creating a Document

```tsx
import { useDocumentMutations } from '@/hooks/useDocuments';

function CreateDocumentForm() {
  const { createDocument } = useDocumentMutations();

  const handleSubmit = async (data) => {
    try {
      const newDoc = await createDocument.mutateAsync(data);
      console.log('Created:', newDoc);
      // Cache is automatically updated!
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={createDocument.isPending}>
        {createDocument.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### 3. Combined Query + Mutations

```tsx
import { useDocumentsWithMutations } from '@/hooks/useDocuments';

function DocumentsManager() {
  const {
    documents,
    isLoading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
  } = useDocumentsWithMutations();

  const handleDelete = async (id: string) => {
    await deleteDocument.mutateAsync(id);
    // List automatically updates!
  };

  return (
    <div>
      {documents.map(doc => (
        <DocumentRow
          key={doc.id}
          document={doc}
          onDelete={() => handleDelete(doc.id)}
        />
      ))}
    </div>
  );
}
```

### 4. Authentication

```tsx
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { login, user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login.mutateAsync({ email, password });
      // User automatically cached and available via user prop
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  if (isLoading) return <Loader />;
  if (isAuthenticated) return <Redirect to="/dashboard" />;

  return <LoginFormUI onSubmit={handleLogin} />;
}
```

### 5. Templates with Categories

```tsx
import { useTemplatesWithCategories } from '@/hooks/useTemplates';

function TemplateSelector() {
  const {
    templates,
    categories,
    isLoading,
    error,
  } = useTemplatesWithCategories();

  return (
    <div>
      <CategoryFilter categories={categories} />
      <TemplateGrid templates={templates} />
    </div>
  );
}
```

### 6. Signature Requests

```tsx
import { useSignatures } from '@/hooks/useSignatures';

function SignatureRequestList() {
  const {
    requests,
    isLoading,
    createSignatureRequest,
    cancelSignatureRequest,
  } = useSignatures();

  const handleCreate = async (documentId: string, signers: Signer[]) => {
    await createSignatureRequest.mutateAsync({
      documentId,
      signers,
      expiresIn: 7, // days
    });
  };

  return (
    <div>
      {requests.map(request => (
        <SignatureRequestCard
          key={request.id}
          request={request}
          onCancel={() => cancelSignatureRequest.mutate(request.id)}
        />
      ))}
    </div>
  );
}
```

## Available Hooks

### Authentication (`useAuth.ts`)

- `useAuth()` - Combined auth state and mutations
- `useCurrentUser()` - Current user data
- `useAuthMutation()` - Login, register, logout mutations

### Documents (`useDocuments.ts`)

- `useDocuments()` - List all documents
- `useDocument(id)` - Single document by ID
- `useDocumentMutations()` - Create, update, delete, generate
- `useDocumentsWithMutations()` - Combined queries + mutations

### Templates (`useTemplates.ts`)

- `useTemplates()` - All templates
- `useTemplate(id)` - Single template
- `useTemplateCategories()` - Template categories
- `useTemplatesByCategory(category)` - Filtered templates
- `useTemplateSearch(searchTerm)` - Search templates
- `useTemplatesWithCategories()` - Templates + categories

### User Profile (`useUser.ts`)

- `useUser()` - User data and mutations
- `useUserMutations()` - Update profile, change password, upload avatar, delete account
- `useUserPreferences()` - User preferences from cache

### Signatures (`useSignatures.ts`)

- `useSignatures()` - All signature requests + mutations
- `useSignatureRequests()` - List signature requests
- `useSignatureRequest(token)` - Single request by token
- `useDocumentSignatures(documentId)` - Signatures for a document
- `useSignatureMutations()` - Create, sign, decline, cancel, resend

## Best Practices

### 1. Use Destructuring

```tsx
// Good ✅
const { data: documents, isLoading } = useDocuments();

// Avoid ❌
const documentsQuery = useDocuments();
const documents = documentsQuery.data;
```

### 2. Handle Loading and Error States

```tsx
function Component() {
  const { data, isLoading, error } = useQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return <DataDisplay data={data} />;
}
```

### 3. Optimistic Updates

```tsx
const { updateDocument } = useDocumentMutations();

// Optimistically update UI before server confirms
await updateDocument.mutateAsync(
  { id, data },
  {
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['documents', id]);

      // Snapshot previous value
      const previous = queryClient.getQueryData(['documents', id]);

      // Optimistically update
      queryClient.setQueryData(['documents', id], variables.data);

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['documents', id], context.previous);
    },
  }
);
```

### 4. Dependent Queries

```tsx
function DocumentDetail({ id }: { id: string }) {
  const { data: document } = useDocument(id);

  // Only fetch signatures if we have the document
  const { data: signatures } = useDocumentSignatures(
    document?.id ?? null
  );

  return <DetailView document={document} signatures={signatures} />;
}
```

### 5. Prefetching

```tsx
import { useQueryClient } from '@tanstack/react-query';

function DocumentsList() {
  const queryClient = useQueryClient();
  const { data: documents } = useDocuments();

  const prefetchDocument = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['documents', id],
      queryFn: () => fetchDocument(id),
    });
  };

  return (
    <div>
      {documents.map(doc => (
        <div
          key={doc.id}
          onMouseEnter={() => prefetchDocument(doc.id)}
        >
          {doc.title}
        </div>
      ))}
    </div>
  );
}
```

## DevTools

React Query DevTools are automatically enabled in development mode. Access them via the floating icon in the bottom-left corner of your screen.

Features:
- View all queries and their states
- Manually trigger refetches
- Inspect cache data
- Monitor mutations
- Debug stale/fresh data

## Migration from Context API

If you're migrating from the old Context API:

### Before (Context API)
```tsx
const { user, login, isLoading } = useAuth();
```

### After (React Query)
```tsx
// Same interface, but with React Query under the hood!
const { user, login, isLoading } = useAuth();
```

The hooks are designed to be compatible, so migration is seamless.

## TypeScript Support

All hooks are fully typed. Import types from `@/lib/api`:

```tsx
import type { Document, User, Template } from '@/lib/api';

function MyComponent() {
  const { data: documents } = useDocuments();
  // documents is typed as Document[]
}
```

## Troubleshooting

### Query not refetching?

Check `staleTime` - data might still be considered fresh:

```tsx
useDocuments({ staleTime: 0 }); // Always refetch
```

### Cache not updating after mutation?

Ensure mutation includes cache invalidation:

```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['documents'] });
}
```

### Auth token not being sent?

The API client automatically injects the token from localStorage. Make sure:
1. User is logged in
2. Token is stored: `localStorage.getItem('legaldocs_token')`

## Additional Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Best Practices](https://tkdodo.eu/blog/practical-react-query)
