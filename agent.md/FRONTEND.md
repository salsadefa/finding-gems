# Frontend Development Guide - Finding Gems

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Component Structure](#component-structure)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Error Handling & Loading States](#error-handling--loading-states)
8. [Form Handling & Validation](#form-handling--validation)
9. [Routing & Navigation](#routing--navigation)
10. [Performance Optimization](#performance-optimization)
11. [Testing Strategy](#testing-strategy)
12. [Accessibility Standards](#accessibility-standards)
13. [Implementation Checklist](#implementation-checklist)

---

## 🎯 Project Overview

**Project Name:** Finding Gems  
**Description:** [Add your project description]  
**Current State:** Frontend complete with mock data  
**Goal:** Replace mock data with real API calls, implement proper error handling, loading states, and production-ready UX

---

## 🛠 Technology Stack

### Core Technologies
- **Framework:** React 18+ / Next.js 14+
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Query + Zustand/Context
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios / Fetch API
- **Routing:** React Router v6 / Next.js App Router

### Essential Packages
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "react-router-dom": "^6.20.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.300.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "vitest": "^1.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

---

## 🏗 Architecture & Design Patterns

### Folder Structure (Production-Ready)
```
frontend/
├── public/
│   ├── icons/
│   ├── images/
│   └── fonts/
├── src/
│   ├── api/                 # API client & endpoints
│   │   ├── client.ts        # Axios instance with interceptors
│   │   ├── auth.api.ts
│   │   ├── users.api.ts
│   │   └── [resource].api.ts
│   ├── components/          # Reusable components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── forms/           # Form components
│   │   ├── layouts/         # Layout components
│   │   ├── common/          # Common components
│   │   └── features/        # Feature-specific components
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── use[Feature].ts
│   ├── lib/                 # Utilities
│   │   ├── utils.ts
│   │   ├── cn.ts
│   │   └── validators.ts
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── [feature]/
│   ├── store/               # State management
│   │   ├── authStore.ts
│   │   └── [feature]Store.ts
│   ├── types/               # TypeScript types
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   └── [resource].types.ts
│   ├── constants/           # Constants & configs
│   │   ├── routes.ts
│   │   ├── config.ts
│   │   └── messages.ts
│   ├── styles/              # Global styles
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

### Design Patterns

#### 1. **Container/Presentation Pattern**
```typescript
// Container Component (Smart)
const UserListContainer: React.FC = () => {
  const { data, isLoading, error } = useUsers();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <UserList users={data} />;
};

// Presentation Component (Dumb)
interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className="grid gap-4">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

#### 2. **Compound Components Pattern**
```typescript
// Card.tsx
const Card = ({ children, className }: CardProps) => (
  <div className={cn("rounded-lg border bg-card", className)}>
    {children}
  </div>
);

const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
    {children}
  </div>
);

// Usage
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

#### 3. **Custom Hooks Pattern**
```typescript
// hooks/useApi.ts
export function useApi<T>(
  queryKey: string[],
  fetcher: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  return useQuery({
    queryKey,
    queryFn: fetcher,
    ...options
  });
}

// Usage
const { data, isLoading, error } = useApi(
  ['users', userId],
  () => fetchUser(userId)
);
```

---

## 🧩 Component Structure

### Component Template
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  // ... other props
}

export const Component: React.FC<ComponentProps> = ({
  className,
  children,
  // ... other props
}) => {
  // Hooks
  const [state, setState] = React.useState();
  
  // Effects
  React.useEffect(() => {
    // Side effects
  }, []);
  
  // Handlers
  const handleClick = () => {
    // Handle event
  };
  
  // Render helpers
  const renderContent = () => {
    // Complex rendering logic
  };
  
  // Early returns
  if (!data) return null;
  
  return (
    <div className={cn("base-classes", className)}>
      {children}
    </div>
  );
};

Component.displayName = 'Component';
```

### Component Best Practices
```typescript
// ✅ DO: Use TypeScript interfaces
interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  className?: string;
}

// ✅ DO: Destructure props
const UserCard: React.FC<UserCardProps> = ({ user, onEdit, className }) => {
  // ...
};

// ✅ DO: Use proper event handlers
const handleEdit = useCallback(() => {
  onEdit?.(user.id);
}, [user.id, onEdit]);

// ✅ DO: Memoize expensive computations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// ❌ DON'T: Inline object/array creation in JSX
// Bad
<Component config={{ key: 'value' }} />

// Good
const config = useMemo(() => ({ key: 'value' }), []);
<Component config={config} />
```

---

## 🗃 State Management

### 1. **React Query for Server State**
```typescript
// api/users.api.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: userKeys.list(JSON.stringify(filters)),
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('User created successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
};
```

### 2. **Zustand for Client State**
```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: async (email, password) => {
    const { user, token } = await loginApi(email, password);
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  setUser: (user) => set({ user }),
}));

// Usage
const { user, login, logout } = useAuthStore();
```

### 3. **Context for UI State**
```typescript
// contexts/ThemeContext.tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

---

## 🌐 API Integration

### 1. **Axios Client Setup**
```typescript
// api/client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshToken();
        localStorage.setItem('token', newToken);
        originalRequest.headers!.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.error?.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
```

### 2. **API Functions**
```typescript
// api/users.api.ts
import apiClient from './client';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user.types';

export const fetchUsers = async (filters?: UserFilters): Promise<User[]> => {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.status) params.append('status', filters.status);
  
  const response = await apiClient.get<{ data: User[] }>(`/users?${params}`);
  return response.data;
};

export const fetchUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<{ data: User }>(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await apiClient.post<{ data: User }>('/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
  const response = await apiClient.patch<{ data: User }>(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};
```

### 3. **TypeScript Types**
```typescript
// types/api.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
}

export interface UserFilters {
  role?: 'user' | 'admin';
  status?: 'active' | 'inactive';
  search?: string;
}
```

---

## ⚠️ Error Handling & Loading States

### 1. **Error Boundary**
```typescript
// components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. **Loading States**
```typescript
// components/LoadingStates.tsx
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className={cn('animate-spin rounded-full border-2 border-primary border-t-transparent', sizeClasses[size])} />
    </div>
  );
};

export const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    ))}
  </div>
);

// Usage in components
const UserList: React.FC = () => {
  const { data, isLoading, error } = useUsers();
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) return <EmptyState message="No users found" />;
  
  return (
    <div>
      {data.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
};
```

### 3. **Error Display Components**
```typescript
// components/ErrorMessage.tsx
interface ErrorMessageProps {
  error: Error | string;
  retry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, retry }) => {
  const message = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">Error</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        {retry && (
          <button
            onClick={retry}
            className="text-sm font-medium text-primary hover:underline"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## 📝 Form Handling & Validation

### 1. **React Hook Form + Zod**
```typescript
// components/forms/UserForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  email: z.string()
    .email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  role: z.enum(['user', 'admin']).default('user'),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserForm: React.FC<{ onSubmit: (data: UserFormData) => void }> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'user',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          {...register('name')}
          id="name"
          className="input"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          className="input"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

### 2. **Form with shadcn/ui**
```typescript
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const UserFormShadcn: React.FC = () => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const { mutate, isPending } = useCreateUser();

  const onSubmit = (data: UserFormData) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Creating...' : 'Create User'}
        </Button>
      </form>
    </Form>
  );
};
```

---

## 🧪 Testing Strategy

### 1. **Component Testing**
```typescript
// __tests__/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { UserCard } from '@/components/UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user' as const,
  };

  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

### 2. **Hook Testing**
```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeDefined();
    });
  });
});
```

---

## ✅ Implementation Checklist

### Phase 1: API Integration Setup (Week 1)
- [ ] Set up Axios client with interceptors
- [ ] Create API type definitions
- [ ] Implement authentication flow
- [ ] Set up React Query
- [ ] Create API functions for all endpoints
- [ ] Test all API endpoints

### Phase 2: Replace Mock Data (Week 2)
- [ ] Replace mock data in all components
- [ ] Add loading states
- [ ] Add error handling
- [ ] Implement retry logic
- [ ] Add optimistic updates
- [ ] Handle edge cases

### Phase 3: Forms & Validation (Week 2-3)
- [ ] Set up React Hook Form + Zod
- [ ] Create reusable form components
- [ ] Implement client-side validation
- [ ] Add server-side error display
- [ ] Create form submission flow
- [ ] Add success/error toasts

### Phase 4: Polish & UX (Week 3)
- [ ] Add loading skeletons
- [ ] Implement infinite scroll/pagination
- [ ] Add search/filter functionality
- [ ] Implement debouncing
- [ ] Add empty states
- [ ] Improve accessibility

### Phase 5: Testing (Week 4)
- [ ] Write component tests
- [ ] Write integration tests
- [ ] Test error scenarios
- [ ] Test loading states
- [ ] Test accessibility
- [ ] Cross-browser testing

---

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Guide](https://react-hook-form.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Zod Documentation](https://zod.dev/)
- [React Testing Library](https://testing-library.com/react)

---

**Remember:** Focus on user experience - every API call should have loading, success, and error states!
