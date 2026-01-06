'use client';

import { Product } from '@/types';
import { FoodCard } from './FoodCard';
import { TrendingUp, DollarSign, Award } from 'lucide-react';

interface AlternativeFoodsProps {
  currentProduct: Product;
  alternatives: Product[];
}

export function AlternativeFoods({ currentProduct, alternatives }: AlternativeFoodsProps) {
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  // Categorize alternatives
  const higherQuality = alternatives.filter(
    p => (p.overall_score || 0) > (currentProduct.overall_score || 0)
  ).slice(0, 3);

  const betterValue = alternatives.filter(
    p =>
      p.price_per_kg_gbp &&
      currentProduct.price_per_kg_gbp &&
      p.price_per_kg_gbp < currentProduct.price_per_kg_gbp &&
      (p.overall_score || 0) >= (currentProduct.overall_score || 0) - 10
  ).slice(0, 3);

  const similarProtein = alternatives.filter(
    p =>
      p.protein_percent &&
      currentProduct.protein_percent &&
      Math.abs(p.protein_percent - currentProduct.protein_percent) <= 3 &&
      p.id !== currentProduct.id
  ).slice(0, 3);

  return (
    <div id="alternatives" className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Alternative Options</h2>
        <p className="text-gray-600">Similar products you might want to consider</p>
      </div>

      {/* Higher Quality */}
      {higherQuality.length > 0 && (
        <AlternativeSection
          title="Higher Quality"
          icon={<Award className="w-5 h-5" />}
          description="These products have higher overall scores"
          color="green"
          products={higherQuality}
        />
      )}

      {/* Better Value */}
      {betterValue.length > 0 && (
        <AlternativeSection
          title="Better Value"
          icon={<DollarSign className="w-5 h-5" />}
          description="Similar quality at a lower price per kg"
          color="blue"
          products={betterValue}
        />
      )}

      {/* Similar Protein */}
      {similarProtein.length > 0 && (
        <AlternativeSection
          title="Same Protein Level"
          icon={<TrendingUp className="w-5 h-5" />}
          description={`Around ${Math.round(currentProduct.protein_percent || 0)}% protein content`}
          color="purple"
          products={similarProtein}
        />
      )}
    </div>
  );
}

// Alternative Section Component
interface AlternativeSectionProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  color: 'green' | 'blue' | 'purple';
  products: Product[];
}

function AlternativeSection({
  title,
  icon,
  description,
  color,
  products
}: AlternativeSectionProps) {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
    },
    blue: {
      bg: 'bg-background',
      border: 'border-secondary',
      text: 'text-primary',
      iconBg: 'bg-foreground',
      iconText: 'text-primary',
    },
    purple: {
      bg: 'bg-secondary-50',
      border: 'border-secondary-200',
      text: 'text-secondary-800',
      iconBg: 'bg-secondary-100',
      iconText: 'text-secondary-600',
    },
  };

  const styles = colorClasses[color];

  return (
    <div className={`rounded-2xl border-2 ${styles.border} ${styles.bg} p-6`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`${styles.iconBg} ${styles.iconText} p-2 rounded-lg`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-xl font-bold ${styles.text}`}>{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <FoodCard key={product.id} product={product} showComparison={true} />
        ))}
      </div>
    </div>
  );
}



