// Custom hooks for enhanced functionality and code reusability

// State management hooks
export { useLocalStorage } from './useLocalStorage';
export { useProductFilters } from './useProductFilters';
export { usePagination } from './usePagination';
export { useTheme } from './useTheme';

// Utility hooks
export { useDebounce } from './useDebounce';
export { useWindowSize, useBreakpoint, useIsMobile, useIsTablet, useIsDesktop } from './useWindowSize';
export { useIntersectionObserver, useLazyImage, useInfiniteScroll } from './useIntersectionObserver';

// Async operations hooks
export { useAsync, useAsyncQueue } from './useAsync';

// Form management hooks
export { useForm, validators } from './useForm';
export type { FormState, FormActions, UseFormReturn } from './useForm';

// Search functionality hooks
export { useSearchSuggestions } from './useSearchSuggestions';
export type { SearchSuggestion } from './useSearchSuggestions';