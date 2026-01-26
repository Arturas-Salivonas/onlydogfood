'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, XCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { ALGORITHM_VERSION } from '@/scoring/config';

interface ScoringDebugPanelProps {
  product: Product;
}

export function ScoringDebugPanel({ product }: ScoringDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ingredients', 'nutrition', 'value']));

  const breakdown = product.scoring_breakdown;

  if (!breakdown) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">No Scoring Data Available</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This product hasn't been scored yet. Run the recalculate-scores script to generate scoring data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const details = breakdown.details || {};

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const renderPointBadge = (points: number, maxPoints: number) => {
    const percentage = (points / maxPoints) * 100;
    let colorClass = 'bg-gray-100 text-gray-700';

    if (percentage >= 90) colorClass = 'bg-green-100 text-green-800';
    else if (percentage >= 70) colorClass = 'bg-blue-100 text-blue-800';
    else if (percentage >= 50) colorClass = 'bg-yellow-100 text-yellow-800';
    else if (percentage >= 30) colorClass = 'bg-orange-100 text-orange-800';
    else colorClass = 'bg-red-100 text-red-800';

    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {points.toFixed(1)} / {maxPoints}
        </span>
        <div className="flex-1 max-w-[100px] h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  const renderSubItem = (label: string, value: number | undefined, icon?: 'positive' | 'negative' | 'neutral') => {
    if (value === undefined || value === 0) return null;

    const Icon = icon === 'positive' ? TrendingUp : icon === 'negative' ? TrendingDown : Info;
    const iconColor = icon === 'positive' ? 'text-green-600' : icon === 'negative' ? 'text-red-600' : 'text-gray-600';
    const textColor = value > 0 ? 'text-green-700' : value < 0 ? 'text-red-700' : 'text-gray-700';

    return (
      <div className="flex items-center justify-between py-1.5 px-3 hover:bg-gray-50 rounded">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <span className={`text-sm font-medium ${textColor}`}>
          {value > 0 ? '+' : ''}{value.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Scoring Breakdown (Debug Mode)</h3>
            <p className="text-sm text-gray-600">Algorithm v{ALGORITHM_VERSION} - Detailed point calculation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{Math.round(product.overall_score || 0)}</span>
          <span className="text-base text-gray-500">/100</span>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Overall Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 font-medium mb-1">Ingredient Quality</div>
              {renderPointBadge(breakdown.ingredientScore || 0, 45)}
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700 font-medium mb-1">Nutritional Value</div>
              {renderPointBadge(breakdown.nutritionScore || 0, 33)}
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-700 font-medium mb-1">Value for Money</div>
              {renderPointBadge(breakdown.valueScore || 0, 22)}
            </div>
          </div>

          {/* INGREDIENT QUALITY SECTION */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('ingredients')}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedSections.has('ingredients') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <h4 className="font-semibold text-gray-900">Ingredient Quality</h4>
              </div>
              <span className="text-lg font-bold">{(breakdown.ingredientScore || 0).toFixed(1)}/52</span>
            </button>

            {expandedSections.has('ingredients') && (
              <div className="p-4 space-y-3 bg-white">
                {/* Effective Meat Content */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 mb-2">A) Effective Meat Content (15 pts)</div>
                  {details.effectiveMeatContent !== undefined && (
                    <div className="mb-2">
                      {renderSubItem('Base meat points', details.effectiveMeatContent, 'positive')}
                    </div>
                  )}
                  {details.freshMeatPenalty !== undefined && details.freshMeatPenalty < 0 && (
                    renderSubItem('Fresh meat water penalty', details.freshMeatPenalty, 'negative')
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                    <strong>Effective Meat:</strong> {product.effective_meat_percent?.toFixed(1) || 'N/A'}%
                    {product.meat_content_percent && (
                      <span className="ml-2">| <strong>Raw:</strong> {product.meat_content_percent.toFixed(1)}%</span>
                    )}
                  </div>
                </div>

                {/* Protein Diversity */}
                {details.proteinDiversity !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900 mb-2">B) Protein Source Diversity (8 pts)</div>
                    {renderSubItem('Diversity bonus', details.proteinDiversity, details.proteinDiversity > 3 ? 'positive' : 'neutral')}
                    {details.proteinDiversityDetails && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                        <div><strong>Level:</strong> {details.proteinDiversityDetails.diversity}</div>
                        <div><strong>Protein Types:</strong> {details.proteinDiversityDetails.uniqueProteinTypes}</div>
                        <div><strong>Total Sources:</strong> {details.proteinDiversityDetails.proteinSources?.length || 0}</div>
                        {details.proteinDiversityDetails.proteinSources && details.proteinDiversityDetails.proteinSources.length > 0 && (
                          <div className="mt-1 text-xs">
                            <strong>Sources:</strong> {details.proteinDiversityDetails.proteinSources.slice(0, 10).join(', ')}
                            {details.proteinDiversityDetails.proteinSources.length > 10 && '...'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Low-Value Fillers */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 mb-2">C) Low-Value Fillers & Carbs (10 pts)</div>
                  {details.lowValueFillers !== undefined && (
                    renderSubItem('Base filler score', details.lowValueFillers, details.lowValueFillers >= 8 ? 'positive' : 'neutral')
                  )}
                  {details.highRiskFillerPenalty !== undefined && details.highRiskFillerPenalty < 0 && (
                    renderSubItem('High-risk filler penalty', details.highRiskFillerPenalty, 'negative')
                  )}
                  {details.lowValueCarbPenalty !== undefined && details.lowValueCarbPenalty < 0 && (
                    renderSubItem('Low-value carb penalty (corn/maize/wheat)', details.lowValueCarbPenalty, 'negative')
                  )}
                  {details.brownRicePenalty !== undefined && details.brownRicePenalty < 0 && (
                    renderSubItem('Brown rice penalty', details.brownRicePenalty, 'negative')
                  )}
                  {details.grainFirstPenalty !== undefined && details.grainFirstPenalty < 0 && (
                    renderSubItem('⚠️ HIGH-GI GRAIN AS #1 INGREDIENT', details.grainFirstPenalty, 'negative')
                  )}
                  {details.grainHeavyPenalty !== undefined && details.grainHeavyPenalty < 0 && (
                    renderSubItem('⚠️ MULTIPLE HIGH-GI GRAINS IN TOP 5', details.grainHeavyPenalty, 'negative')
                  )}
                  {details.grainTop3Penalty !== undefined && details.grainTop3Penalty < 0 && (
                    renderSubItem('High-GI grain in top 3', details.grainTop3Penalty, 'negative')
                  )}
                  {details.grainTop5Penalty !== undefined && details.grainTop5Penalty < 0 && (
                    renderSubItem('High-GI grain in top 5', details.grainTop5Penalty, 'negative')
                  )}
                  {details.brownRiceFirstPenalty !== undefined && details.brownRiceFirstPenalty < 0 && (
                    renderSubItem('Brown rice as #1 ingredient', details.brownRiceFirstPenalty, 'negative')
                  )}
                  {details.brownRiceTop3Penalty !== undefined && details.brownRiceTop3Penalty < 0 && (
                    renderSubItem('Brown rice in top 3', details.brownRiceTop3Penalty, 'negative')
                  )}
                </div>

                {/* Artificial Additives */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 mb-2">D) Artificial Additives (10 pts)</div>
                  {details.noArtificialAdditives !== undefined && (
                    renderSubItem('Base additive score', details.noArtificialAdditives, details.noArtificialAdditives >= 8 ? 'positive' : 'neutral')
                  )}
                  {details.redFlagAdditive !== undefined && details.redFlagAdditive < 0 && (
                    renderSubItem('⚠️ RED FLAG ADDITIVE DETECTED', details.redFlagAdditive, 'negative')
                  )}
                  {details.artificialColorPenalty !== undefined && details.artificialColorPenalty < 0 && (
                    renderSubItem('Artificial color penalty', details.artificialColorPenalty, 'negative')
                  )}
                  {details.preservativePenalty !== undefined && details.preservativePenalty < 0 && (
                    renderSubItem('Preservative penalty', details.preservativePenalty, 'negative')
                  )}
                  {details.controversialAdditivePenalty !== undefined && details.controversialAdditivePenalty < 0 && (
                    renderSubItem('Controversial additive penalty', details.controversialAdditivePenalty, 'negative')
                  )}
                </div>

                {/* Named Meat Sources */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 mb-2">E) Named Meat Sources (5 pts)</div>
                  {details.namedMeatSources !== undefined && (
                    renderSubItem('Named meat sources', details.namedMeatSources, details.namedMeatSources >= 4 ? 'positive' : 'neutral')
                  )}
                </div>

                {/* Ingredient Bonus */}
                {details.ingredientLevelBonus !== undefined && details.ingredientLevelBonus !== 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900 mb-2">F) Ingredient-Level Analysis</div>
                    {renderSubItem('Detailed ingredient bonus/penalty', details.ingredientLevelBonus, details.ingredientLevelBonus > 0 ? 'positive' : 'negative')}
                    {details.ingredientBonusRaw !== undefined && (
                      <div className="text-xs text-gray-600 mt-1">
                        (Raw: {details.ingredientBonusRaw.toFixed(1)}, Capped to ±7)
                      </div>
                    )}
                  </div>
                )}

                {/* Other penalties */}
                {(details.ingredientSplittingPenalty || details.fillerStuffingPenalty || details.excessiveIngredientsPenalty) && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="font-medium text-red-900 mb-2">⚠️ Quality Issues Detected</div>
                    {details.ingredientSplittingPenalty !== undefined && details.ingredientSplittingPenalty < 0 && (
                      renderSubItem('Ingredient splitting detected', details.ingredientSplittingPenalty, 'negative')
                    )}
                    {details.fillerStuffingPenalty !== undefined && details.fillerStuffingPenalty < 0 && (
                      renderSubItem('Filler stuffing detected', details.fillerStuffingPenalty, 'negative')
                    )}
                    {details.excessiveIngredientsPenalty !== undefined && details.excessiveIngredientsPenalty < 0 && (
                      renderSubItem(`Excessive ingredients (${product.total_ingredients_count})`, details.excessiveIngredientsPenalty, 'negative')
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NUTRITIONAL VALUE SECTION */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('nutrition')}
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedSections.has('nutrition') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <h4 className="font-semibold text-gray-900">Nutritional Value</h4>
              </div>
              <span className="text-lg font-bold">{(breakdown.nutritionScore || 0).toFixed(1)}/33</span>
            </button>

            {expandedSections.has('nutrition') && (
              <div className="p-4 space-y-3 bg-white">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 mb-2">A) Protein Quality (15 pts)</div>
                  {details.proteinQuality !== undefined && (
                    renderSubItem('Protein quality score', details.proteinQuality, 'positive')
                  )}
                  {details.plantProteinPenalty !== undefined && details.plantProteinPenalty < 0 && (
                    renderSubItem('Plant protein penalty', details.plantProteinPenalty, 'negative')
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                    <strong>Protein:</strong> {product.protein_percent?.toFixed(1) || 'N/A'}%
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 mb-2">B) Fat Content (8 pts)</div>
                  {details.moderateFat !== undefined && (
                    renderSubItem('Fat content score', details.moderateFat, 'positive')
                  )}
                  {details.highFatPenalty !== undefined && details.highFatPenalty < 0 && (
                    renderSubItem('High fat penalty (>20%)', details.highFatPenalty, 'negative')
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                    <strong>Fat:</strong> {product.fat_percent?.toFixed(1) || 'N/A'}%
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 mb-2">C) Carbohydrate Load (7 pts)</div>
                  {details.lowCarbs !== undefined && (
                    renderSubItem('Low carb score', details.lowCarbs, 'positive')
                  )}
                  {details.vegetableCarbsBonus !== undefined && details.vegetableCarbsBonus > 0 && (
                    renderSubItem('Vegetable carbs bonus', details.vegetableCarbsBonus, 'positive')
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                    <strong>Carbs:</strong> {product.carbs_percent?.toFixed(1) || 'Calculated'}%
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900 mb-2">D) Fiber & Micronutrients (3 pts)</div>
                  {details.appropriateFiber !== undefined && (
                    renderSubItem('Fiber content', details.appropriateFiber, 'positive')
                  )}
                  {details.micronutrientScore !== undefined && (
                    renderSubItem('Functional micronutrients', details.micronutrientScore, 'positive')
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                    <strong>Fiber:</strong> {product.fiber_percent?.toFixed(1) || 'N/A'}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* VALUE FOR MONEY SECTION */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('value')}
              className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedSections.has('value') ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <h4 className="font-semibold text-gray-900">Value for Money</h4>
              </div>
              <span className="text-lg font-bold">{(breakdown.valueScore || 0).toFixed(1)}/15</span>
            </button>

            {expandedSections.has('value') && (
              <div className="p-4 space-y-3 bg-white">
                <div className="bg-gray-50 rounded-lg p-3">
                  {details.valueRating !== undefined && (
                    renderSubItem('Price competitiveness', details.valueRating, 'neutral')
                  )}
                  {details.ingredientValueScore !== undefined && (
                    renderSubItem('Ingredient value', details.ingredientValueScore, 'positive')
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-600">
                    <strong>Price:</strong> £{product.price_gbp?.toFixed(2) || 'N/A'}
                    {product.price_per_kg_gbp && (
                      <span className="ml-2">| £{product.price_per_kg_gbp.toFixed(2)}/kg</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Red Flags */}
          {breakdown.redFlags && breakdown.redFlags.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">Red Flags Detected</h4>
                  <ul className="space-y-1">
                    {breakdown.redFlags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-red-800">• {flag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
