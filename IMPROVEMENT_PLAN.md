# OnlyDogFood.com - Performance & Code Quality Improvement Plan

## Executive Summary

This document outlines a comprehensive plan to improve performance, SEO, code quality, maintainability, and shared component architecture for OnlyDogFood.com.

## Current State Analysis

### ✅ Strengths
- Modern Next.js 16 with App Router
- TypeScript throughout codebase
- Supabase for scalable database
- TanStack Query for efficient data fetching
- TailwindCSS for consistent styling
- Well-structured scoring algorithm
- Good component organization

### ❌ Critical Issues
- **92 TypeScript errors** preventing production builds
- **Next.js 13/16 parameter destructuring mismatch**
- **Mixed camelCase/snake_case** field usage
- **No error boundaries** or loading states
- **Missing SEO optimizations** (structured data, sitemaps)
- **No performance optimizations** (bundle analysis, image optimization)

---

## 1. 🚨 CRITICAL FIXES (Blockers)

### 1.1 TypeScript Errors & Build Fixes
**Priority: CRITICAL** | **Impact: High** | **Effort: Medium**

#### Issues:
- 92 TypeScript compilation errors
- Next.js 16 async params not implemented
- Supabase type inference issues
- Mixed field naming conventions

#### Solutions:
```typescript
// Fix API route parameter destructuring (Next.js 16)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // ... rest of function
}
```

#### Implementation Plan:
1. Update all API routes to use async params
2. Fix Supabase type assertions
3. Standardize snake_case field usage
4. Add proper error handling

### 1.2 Database Field Consistency
**Priority: CRITICAL** | **Impact: High** | **Effort: Low**

#### Current Issues:
- Mixed `pricePerKgGbp` vs `price_per_kg_gbp`
- Inconsistent field naming across components

#### Solution:
- Enforce snake_case throughout frontend
- Update remaining camelCase references
- Add ESLint rule for field naming

---

## 2. ⚡ PERFORMANCE OPTIMIZATIONS

### 2.1 Bundle Analysis & Optimization
**Priority: HIGH** | **Impact: Medium** | **Effort: Low**

#### Current State:
- No bundle size monitoring
- No code splitting
- No lazy loading

#### Solutions:
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
```

#### Implementation:
1. Add `@next/bundle-analyzer`
2. Implement code splitting for heavy components
3. Add lazy loading for product images
4. Optimize package imports

### 2.2 Image Optimization
**Priority: HIGH** | **Impact: High** | **Effort: Low**

#### Current Issues:
- No WebP/AVIF support
- No responsive images
- Missing alt text optimization

#### Solutions:
```tsx
// components/ui/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({ src, alt, ...props }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={src}
        alt={alt}
        {...props}
        onLoad={() => setIsLoading(false)}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
      />
    </div>
  );
}
```

### 2.3 Caching & Data Optimization
**Priority: MEDIUM** | **Impact: High** | **Effort: Medium**

#### Current Issues:
- Basic query caching only
- No ISR/SSR optimization
- No prefetching strategies

#### Solutions:
```typescript
// lib/queries/products.ts
export function useProducts(filters: FilterOptions = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Implement ISR for product pages
export const revalidate = 3600; // 1 hour
```

### 2.4 Scoring Performance
**Priority: MEDIUM** | **Impact: Medium** | **Effort: High**

#### Current Issues:
- Scoring calculations on every render
- No memoization
- Heavy string processing

#### Solutions:
```typescript
// scoring/calculator.ts
import { memoize } from 'lodash-es';

const memoizedCalculateScore = memoize(
  (product: Product) => calculateOverallScore(product),
  (product) => `${product.id}-${product.updated_at}`
);

export function getProductScore(product: Product) {
  return memoizedCalculateScore(product);
}
```

---

## 3. 🔍 SEO OPTIMIZATIONS

### 3.1 Structured Data & Meta Tags
**Priority: HIGH** | **Impact: High** | **Effort: Medium**

#### Current Issues:
- No JSON-LD structured data
- Missing Open Graph images
- No Twitter Card optimization

#### Solutions:
```tsx
// components/seo/StructuredData.tsx
import { Product } from '@/types';

interface ProductStructuredDataProps {
  product: Product;
}

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand?.name,
    },
    "offers": {
      "@type": "Offer",
      "price": product.price_gbp,
      "priceCurrency": "GBP",
      "availability": "https://schema.org/InStock",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.overall_score,
      "bestRating": 100,
      "reviewCount": 1,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

### 3.2 Sitemap & Robots.txt
**Priority: MEDIUM** | **Impact: Medium** | **Effort: Low**

#### Solutions:
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://onlydogfood.com';

  // Get all products and brands
  const products = await getAllProducts();
  const brands = await getAllBrands();

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/dog-food/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const brandUrls = brands.map((brand) => ({
    url: `${baseUrl}/brands/${brand.slug}`,
    lastModified: new Date(brand.updated_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productUrls,
    ...brandUrls,
  ];
}
```

### 3.3 Core Web Vitals
**Priority: HIGH** | **Impact: High** | **Effort: Medium**

#### Solutions:
- Implement proper loading states
- Add error boundaries
- Optimize font loading
- Implement proper hydration

---

## 4. 🧹 CODE QUALITY & MAINTAINABILITY

### 4.1 Error Boundaries & Error Handling
**Priority: HIGH** | **Impact: High** | **Effort: Medium**

#### Solutions:
```tsx
// components/error/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Something went wrong</h3>
          <p className="text-red-600">Please try refreshing the page</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4.2 Custom Hooks
**Priority: MEDIUM** | **Impact: Medium** | **Effort: Medium**

#### Solutions:
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

### 4.3 Utility Functions
**Priority: MEDIUM** | **Impact: Low** | **Effort: Low**

#### Solutions:
```typescript
// lib/utils/api.ts
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// lib/utils/validation.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand_id: z.string().uuid('Invalid brand ID'),
  category: z.enum(['dry', 'wet', 'snack']),
  price_gbp: z.number().positive('Price must be positive'),
  // ... more validations
});

export type ProductInput = z.infer<typeof productSchema>;
```

---

## 5. 🧩 SHARED COMPONENTS & DESIGN SYSTEM

### 5.1 Component Library
**Priority: MEDIUM** | **Impact: High** | **Effort: High**

#### Solutions:
```tsx
// components/ui/Button.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### 5.2 Loading States
**Priority: HIGH** | **Impact: Medium** | **Effort: Low**

#### Solutions:
```tsx
// components/ui/Loading.tsx
import { cn } from '@/lib/utils/cn';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ size = 'md', className }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
    </div>
  );
}

// components/ui/Skeleton.tsx
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
    />
  );
}
```

### 5.3 Form Components
**Priority: MEDIUM** | **Impact: Medium** | **Effort: Medium**

#### Solutions:
```tsx
// components/ui/FormField.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { FormField };
```

---

## 6. 📋 IMPLEMENTATION ROADMAP

### Phase 1: Critical Fixes (Week 1)
- [ ] Fix TypeScript errors and build issues
- [ ] Update API routes for Next.js 16 compatibility
- [ ] Standardize field naming (snake_case)
- [ ] Add basic error boundaries

### Phase 2: Performance (Week 2)
- [ ] Implement bundle analysis
- [ ] Add image optimization
- [ ] Implement code splitting
- [ ] Add caching strategies

### Phase 3: SEO (Week 3)
- [ ] Add structured data
- [ ] Generate sitemap and robots.txt
- [ ] Optimize meta tags
- [ ] Add canonical URLs

### Phase 4: Code Quality (Week 4)
- [ ] Create shared components
- [ ] Add custom hooks
- [ ] Implement proper error handling
- [ ] Add loading states

### Phase 5: Polish & Testing (Week 5)
- [ ] Add comprehensive tests
- [ ] Performance monitoring
- [ ] Accessibility improvements
- [ ] Documentation updates

---

## 7. 📊 SUCCESS METRICS

### Performance Targets:
- **Lighthouse Score**: >95 (currently unknown)
- **Bundle Size**: <200KB (currently unknown)
- **Time to Interactive**: <3s
- **First Contentful Paint**: <1.5s

### SEO Targets:
- **Core Web Vitals**: All green
- **Structured Data**: Valid on all pages
- **Sitemap**: Auto-generated and current
- **Meta Tags**: Complete on all pages

### Code Quality Targets:
- **TypeScript Errors**: 0
- **Test Coverage**: >80%
- **Bundle Analysis**: Automated
- **Component Documentation**: Complete

---

## 8. 🛠️ DEVELOPMENT WORKFLOW IMPROVEMENTS

### 8.1 Pre-commit Hooks
```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test
npm run build
```

### 8.2 CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

### 8.3 Bundle Analysis
```typescript
// scripts/analyze-bundle.js
const { execSync } = require('child_process');
const fs = require('fs');

execSync('npm run build -- --analyze', { stdio: 'inherit' });

// Analyze bundle size
const stats = JSON.parse(fs.readFileSync('.next/static/chunks/webpack-stats.json', 'utf8'));
console.log('Bundle Analysis:');
console.log(`Main bundle: ${(stats.assets[0].size / 1024 / 1024).toFixed(2)} MB`);
```

---

## 9. 📚 DOCUMENTATION IMPROVEMENTS

### 9.1 Component Documentation
```tsx
// components/ui/Button.tsx
/**
 * Button component with multiple variants and sizes
 *
 * @example
 * <Button variant="primary" size="lg">Click me</Button>
 *
 * @param {ButtonProps} props - Button properties
 * @param {string} [props.variant='default'] - Button variant
 * @param {string} [props.size='default'] - Button size
 */
```

### 9.2 API Documentation
```typescript
// lib/queries/products.ts
/**
 * Fetches products with filtering and pagination
 *
 * @param filters - Filter options
 * @returns Promise with paginated products
 *
 * @example
 * const products = await fetchProducts({ category: 'dry', limit: 10 });
 */
```

---

## 10. 🔮 FUTURE CONSIDERATIONS

### 10.1 Advanced Features
- **PWA Support**: Service workers, offline functionality
- **Internationalization**: Multi-language support
- **Advanced Search**: Full-text search with filters
- **User Accounts**: Saved products, preferences
- **API Rate Limiting**: Prevent abuse
- **Analytics**: User behavior tracking

### 10.2 Scalability
- **CDN Integration**: Global content delivery
- **Database Optimization**: Query optimization, indexing
- **Caching Layer**: Redis for session/cache storage
- **Microservices**: Split monolithic API

### 10.3 Monitoring
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Real user monitoring
- **Business Metrics**: Conversion tracking
- **Uptime Monitoring**: Service health checks

---

*This improvement plan provides a comprehensive roadmap for enhancing OnlyDogFood.com's performance, maintainability, and user experience. Implementation should be done in phases, starting with critical fixes and building towards advanced optimizations.*</content>
<parameter name="filePath">c:\Users\Arturas\Desktop\onlydogfood\IMPROVEMENT_PLAN.md