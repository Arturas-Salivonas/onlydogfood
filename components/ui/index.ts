// UI Components - Reusable interface elements

// Form components
export { FormField, Input, PasswordInput, Textarea, Select, Checkbox, RadioGroup } from './FormField';

// Button component
export { Button, buttonVariants } from './Button';

// Search components
export { DogSearchBar } from './DogSearchBar';
export { BrandSearchBar } from './BrandSearchBar';
export { LiveSearchBar } from './LiveSearchBar'; // Keep for backward compatibility

// Quiz component
export { Quiz } from './Quiz';

// Modal and Toast components
export { Modal, ModalTrigger, ConfirmModal } from './Modal';
export { ToastProvider, useToast, useToasts, useToastSuccess, useToastError, useToastWarning, useToastInfo } from './Toast';

// Core primitives
export { ScoreBadge, ScoreDisplay } from './ScoreDisplay';
export { PricePerFeed, PricePerFeedCompact } from './PricePerFeed';
export { IngredientFlag, IngredientFlagsGroup } from './IngredientFlag';

// Composite components
export { FoodCard } from './FoodCard';
export { AdvancedFilterPanel } from './AdvancedFilterPanel';
export { NutritionTable } from './NutritionTable';
export { IngredientBreakdown } from './IngredientBreakdown';

// Product page components
export { FoodSummaryPanel } from './FoodSummaryPanel';
export { ScoreBreakdownChart } from './ScoreBreakdownChart';
export { AlternativeFoods } from './AlternativeFoods';

// Compare system
export { ComparisonTable } from './ComparisonTable';

// Brand components
export { BrandOverview } from './BrandOverview';
export { BrandProductGrid } from './BrandProductGrid';

// Legacy/Existing components
export { Loading } from './Loading';
export { OptimizedImage } from './OptimizedImage';
export { BestFoodsSection } from './BestFoodsSection';
export { StatsSection } from './StatsSection';
