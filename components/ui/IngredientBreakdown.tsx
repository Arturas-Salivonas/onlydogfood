'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { IngredientFlag, IngredientFlagType } from './IngredientFlag';
import { FILLERS, ARTIFICIAL_ADDITIVES, NAMED_MEAT_SOURCES, UNNAMED_MEAT_SOURCES } from '@/scoring/config';

interface IngredientBreakdownProps {
  product: Product;
  defaultExpanded?: boolean;
}

export function IngredientBreakdown({ product, defaultExpanded = false }: IngredientBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!product.ingredients_list || product.ingredients_list.length === 0) {
    if (!product.ingredients_raw) {
      return (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h3>
          <p className="text-gray-600">No ingredient information available.</p>
        </div>
      );
    }
  }

  const ingredients = product.ingredients_list ||
    (product.ingredients_raw ? product.ingredients_raw.split(',').map(i => i.trim()) : []);

  const categorizedIngredients = categorizeIngredients(ingredients);
  const analysis = analyzeIngredients(product);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-700 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Ingredient Analysis</h3>
        <p className="text-sm text-green-100 mt-1">Detailed breakdown of what's inside</p>
      </div>

      {/* Summary Stats */}
      <div className="p-6 bg-emerald-50 border-b-2 border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">
              {ingredients.length}
            </div>
            <div className="text-xs text-gray-600 font-medium">Total Ingredients</div>
          </div>
          {product.meat_content_percent && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {product.meat_content_percent}%
              </div>
              <div className="text-xs text-gray-600 font-medium">Meat Content</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">
              {analysis.namedMeatCount}
            </div>
            <div className="text-xs text-gray-600 font-medium">Named Meats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">
              {analysis.unnamedMeatCount}
            </div>
            <div className="text-xs text-gray-600 font-medium">Unnamed Meats</div>
          </div>
        </div>

        {/* Quality Flags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {analysis.flags.map((flag, idx) => (
            <IngredientFlag key={idx} {...flag} />
          ))}
        </div>
      </div>

      {/* Ingredient List */}
      <div className="p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors mb-4"
        >
          <span className="font-semibold text-gray-900">
            {isExpanded ? 'Hide' : 'Show'} Full Ingredient List
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-6">
            {/* Proteins */}
            {categorizedIngredients.proteins.length > 0 && (
              <IngredientCategory
                title="🥩 Proteins"
                ingredients={categorizedIngredients.proteins}
                color="red"
              />
            )}

            {/* Carbohydrates */}
            {categorizedIngredients.carbs.length > 0 && (
              <IngredientCategory
                title="🌾 Carbohydrates"
                ingredients={categorizedIngredients.carbs}
                color="amber"
              />
            )}

            {/* Fats & Oils */}
            {categorizedIngredients.fats.length > 0 && (
              <IngredientCategory
                title="🫒 Fats & Oils"
                ingredients={categorizedIngredients.fats}
                color="yellow"
              />
            )}

            {/* Fruits & Vegetables */}
            {categorizedIngredients.fruitsVegetables.length > 0 && (
              <IngredientCategory
                title="🥕 Fruits & Vegetables"
                ingredients={categorizedIngredients.fruitsVegetables}
                color="green"
              />
            )}

            {/* Additives & Supplements */}
            {categorizedIngredients.additives.length > 0 && (
              <IngredientCategory
                title="💊 Additives & Supplements"
                ingredients={categorizedIngredients.additives}
                color="blue"
              />
            )}

            {/* Other */}
            {categorizedIngredients.other.length > 0 && (
              <IngredientCategory
                title="📦 Other Ingredients"
                ingredients={categorizedIngredients.other}
                color="gray"
              />
            )}
          </div>
        )}

        {/* Note */}
        <div className="mt-6 p-4 bg-primary rounded-lg border border-success">
          <p className="text-xs text-green-800 leading-relaxed">
            <strong>Reading tip:</strong> Ingredients are listed by weight (before cooking).
            The first 5 ingredients typically make up the bulk of the food.
            Look for named meat sources (e.g., "chicken") rather than generic terms (e.g., "poultry").
          </p>
        </div>
      </div>
    </div>
  );
}

// Ingredient Category Component
interface IngredientCategoryProps {
  title: string;
  ingredients: string[];
  color: 'red' | 'amber' | 'yellow' | 'green' | 'blue' | 'gray';
}

function IngredientCategory({ title, ingredients, color }: IngredientCategoryProps) {
  const colorClasses = {
    red: 'bg-primary border-error text-error',
    amber: 'bg-primary border-warning text-warning',
    yellow: 'bg-primary border-warning text-warning',
    green: 'bg-primary border-success text-success',
    blue: 'bg-primary border-info text-info',
    gray: 'bg-primary border-secondary text-secondary',
  };

  return (
    <div>
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
        <ol className="list-decimal list-inside space-y-1">
          {ingredients.map((ingredient, idx) => (
            <li key={idx} className="text-sm">
              {ingredient}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// Helper functions
interface CategorizedIngredients {
  proteins: string[];
  carbs: string[];
  fats: string[];
  fruitsVegetables: string[];
  additives: string[];
  other: string[];
}

function categorizeIngredients(ingredients: string[]): CategorizedIngredients {
  const categorized: CategorizedIngredients = {
    proteins: [],
    carbs: [],
    fats: [],
    fruitsVegetables: [],
    additives: [],
    other: [],
  };

  const proteinKeywords = ['chicken', 'beef', 'lamb', 'turkey', 'duck', 'fish', 'salmon', 'meat', 'poultry', 'egg', 'venison', 'pork', 'protein'];
  const carbKeywords = ['rice', 'potato', 'corn', 'wheat', 'barley', 'oat', 'pea', 'lentil', 'chickpea', 'tapioca', 'sorghum'];
  const fatKeywords = ['oil', 'fat', 'omega'];
  const fruitVegKeywords = ['apple', 'carrot', 'pumpkin', 'blueberr', 'cranberr', 'spinach', 'kale', 'sweet potato', 'tomato', 'broccoli'];
  const additiveKeywords = ['vitamin', 'mineral', 'supplement', 'preservative', 'extract', 'chelat', 'acid', 'tocopherol'];

  ingredients.forEach(ingredient => {
    const lower = ingredient.toLowerCase();

    if (proteinKeywords.some(kw => lower.includes(kw))) {
      categorized.proteins.push(ingredient);
    } else if (carbKeywords.some(kw => lower.includes(kw))) {
      categorized.carbs.push(ingredient);
    } else if (fatKeywords.some(kw => lower.includes(kw))) {
      categorized.fats.push(ingredient);
    } else if (fruitVegKeywords.some(kw => lower.includes(kw))) {
      categorized.fruitsVegetables.push(ingredient);
    } else if (additiveKeywords.some(kw => lower.includes(kw))) {
      categorized.additives.push(ingredient);
    } else {
      categorized.other.push(ingredient);
    }
  });

  return categorized;
}

function analyzeIngredients(product: Product): {
  namedMeatCount: number;
  unnamedMeatCount: number;
  flags: Array<{ type: IngredientFlagType; label: string; reason?: string }>;
} {
  const ingredientsText = product.ingredients_raw?.toLowerCase() || '';
  const flags: Array<{ type: IngredientFlagType; label: string; reason?: string }> = [];

  // Count named vs unnamed meats
  const namedMeatCount = NAMED_MEAT_SOURCES.filter(meat => ingredientsText.includes(meat)).length;
  const unnamedMeatCount = UNNAMED_MEAT_SOURCES.filter(meat => ingredientsText.includes(meat)).length;

  // Check for fillers
  const hasFillers = FILLERS.some(filler => ingredientsText.includes(filler));
  if (hasFillers) {
    const foundFillers = FILLERS.filter(filler => ingredientsText.includes(filler));
    flags.push({
      type: 'warning',
      label: 'Contains Fillers',
      reason: `Contains: ${foundFillers.join(', ')}`,
    });
  } else if (ingredientsText.length > 0) {
    flags.push({
      type: 'positive',
      label: 'No Fillers',
      reason: 'Free from corn, wheat, and soy',
    });
  }

  // Check for artificial additives
  const hasAdditives = ARTIFICIAL_ADDITIVES.some(additive => ingredientsText.includes(additive));
  if (hasAdditives) {
    flags.push({
      type: 'negative',
      label: 'Artificial Additives',
      reason: 'Contains artificial colors, flavors, or preservatives',
    });
  } else if (ingredientsText.length > 0) {
    flags.push({
      type: 'positive',
      label: 'No Artificial Additives',
      reason: 'Free from artificial colors, flavors, and preservatives',
    });
  }

  // Named meat sources
  if (namedMeatCount > 0 && unnamedMeatCount === 0) {
    flags.push({
      type: 'positive',
      label: 'All Named Meats',
      reason: 'All meat sources are specifically identified',
    });
  } else if (unnamedMeatCount > 0) {
    flags.push({
      type: 'warning',
      label: 'Unnamed Meat Sources',
      reason: 'Contains generic meat terms like "poultry" or "meat meal"',
    });
  }

  return { namedMeatCount, unnamedMeatCount, flags };
}



