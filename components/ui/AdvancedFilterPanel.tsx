'use client';

import { useState } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterOptions {
  type?: ('dry' | 'wet' | 'raw')[];
  lifeStage?: string[];
  proteinSource?: string[];
  grainFree?: boolean;
  scoreRange?: [number, number];
  priceRange?: [number, number];
  brands?: string[];
}

interface AdvancedFilterPanelProps {
  filters: FilterOptions;
  activeFilters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  availableBrands?: Array<{ id: string; name: string }>;
  isMobile?: boolean;
  onClose?: () => void;
}

export function AdvancedFilterPanel({
  filters,
  activeFilters,
  onChange,
  availableBrands = [],
  isMobile = false,
  onClose,
}: AdvancedFilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['type', 'lifeStage', 'score'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleTypeChange = (type: 'dry' | 'wet' | 'raw') => {
    const currentTypes = activeFilters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    onChange({ ...activeFilters, type: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleLifeStageChange = (stage: string) => {
    const currentStages = activeFilters.lifeStage || [];
    const newStages = currentStages.includes(stage)
      ? currentStages.filter(s => s !== stage)
      : [...currentStages, stage];
    onChange({ ...activeFilters, lifeStage: newStages.length > 0 ? newStages : undefined });
  };

  const handleProteinSourceChange = (protein: string) => {
    const currentProteins = activeFilters.proteinSource || [];
    const newProteins = currentProteins.includes(protein)
      ? currentProteins.filter(p => p !== protein)
      : [...currentProteins, protein];
    onChange({ ...activeFilters, proteinSource: newProteins.length > 0 ? newProteins : undefined });
  };

  const handleBrandChange = (brandId: string) => {
    const currentBrands = activeFilters.brands || [];
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter(b => b !== brandId)
      : [...currentBrands, brandId];
    onChange({ ...activeFilters, brands: newBrands.length > 0 ? newBrands : undefined });
  };

  const clearAllFilters = () => {
    onChange({});
  };

  const activeFilterCount = Object.values(activeFilters).filter(v =>
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'h-full' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-ring text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:text-primary font-medium"
            >
              Clear all
            </button>
          )}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(100vh - 120px)' : '600px' }}>
        {/* Food Type */}
        <FilterSection
          title="Food Type"
          isExpanded={expandedSections.has('type')}
          onToggle={() => toggleSection('type')}
        >
          {(['dry', 'wet', 'raw'] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.type?.includes(type) || false}
                onChange={() => handleTypeChange(type)}
                className="w-4 h-4 text-primary rounded focus:ring-ring"
              />
              <span className="text-sm text-gray-700 capitalize">{type}</span>
            </label>
          ))}
        </FilterSection>

        {/* Life Stage */}
        <FilterSection
          title="Life Stage"
          isExpanded={expandedSections.has('lifeStage')}
          onToggle={() => toggleSection('lifeStage')}
        >
          {['Puppy', 'Adult', 'Senior', 'All Life Stages'].map((stage) => (
            <label key={stage} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.lifeStage?.includes(stage) || false}
                onChange={() => handleLifeStageChange(stage)}
                className="w-4 h-4 text-primary rounded focus:ring-ring"
              />
              <span className="text-sm text-gray-700">{stage}</span>
            </label>
          ))}
        </FilterSection>

        {/* Protein Source */}
        <FilterSection
          title="Protein Source"
          isExpanded={expandedSections.has('protein')}
          onToggle={() => toggleSection('protein')}
        >
          {['Chicken', 'Beef', 'Lamb', 'Turkey', 'Fish', 'Duck'].map((protein) => (
            <label key={protein} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.proteinSource?.includes(protein) || false}
                onChange={() => handleProteinSourceChange(protein)}
                className="w-4 h-4 text-primary rounded focus:ring-ring"
              />
              <span className="text-sm text-gray-700">{protein}</span>
            </label>
          ))}
        </FilterSection>

        {/* Grain-Free */}
        <FilterSection
          title="Dietary"
          isExpanded={expandedSections.has('dietary')}
          onToggle={() => toggleSection('dietary')}
        >
          <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={activeFilters.grainFree || false}
              onChange={(e) => onChange({ ...activeFilters, grainFree: e.target.checked || undefined })}
              className="w-4 h-4 text-primary rounded focus:ring-ring"
            />
            <span className="text-sm text-gray-700">Grain-Free</span>
          </label>
        </FilterSection>

        {/* Score Range */}
        <FilterSection
          title="Score Range"
          isExpanded={expandedSections.has('score')}
          onToggle={() => toggleSection('score')}
        >
          <div className="space-y-2 px-2">
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="radio"
                name="scoreRange"
                checked={!activeFilters.scoreRange}
                onChange={() => onChange({ ...activeFilters, scoreRange: undefined })}
                className="w-4 h-4 text-primary focus:ring-ring"
              />
              <span className="text-sm text-gray-700">All Scores</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="radio"
                name="scoreRange"
                checked={activeFilters.scoreRange?.[0] === 80}
                onChange={() => onChange({ ...activeFilters, scoreRange: [80, 100] })}
                className="w-4 h-4 text-primary focus:ring-ring"
              />
              <span className="text-sm text-gray-700">Excellent (80-100)</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="radio"
                name="scoreRange"
                checked={activeFilters.scoreRange?.[0] === 60}
                onChange={() => onChange({ ...activeFilters, scoreRange: [60, 79] })}
                className="w-4 h-4 text-primary focus:ring-ring"
              />
              <span className="text-sm text-gray-700">Good (60-79)</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="radio"
                name="scoreRange"
                checked={activeFilters.scoreRange?.[0] === 40}
                onChange={() => onChange({ ...activeFilters, scoreRange: [40, 59] })}
                className="w-4 h-4 text-primary focus:ring-ring"
              />
              <span className="text-sm text-gray-700">Fair (40-59)</span>
            </label>
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price per Feed"
          isExpanded={expandedSections.has('price')}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-2 px-2">
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={!activeFilters.priceRange}
                onChange={() => onChange({ ...activeFilters, priceRange: undefined })}
                className="w-4 h-4 text-primary focus:ring-ring"
              />
              <span className="text-sm text-gray-700">All Prices</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={activeFilters.priceRange?.[0] === 0 && activeFilters.priceRange?.[1] === 1}
                onChange={() => onChange({ ...activeFilters, priceRange: [0, 1] })}
                className="w-4 h-4 text-primary focus:ring-ring"
              />
              <span className="text-sm text-gray-700">Budget (Under £1/day)</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={activeFilters.priceRange?.[0] === 1 && activeFilters.priceRange?.[1] === 2}
                onChange={() => onChange({ ...activeFilters, priceRange: [1, 2] })}
                className="w-4 h-4 text-primary focus:ring-ring"
              />
              <span className="text-sm text-gray-700">Mid-Range (£1-£2/day)</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={activeFilters.priceRange?.[0] === 2}
                onChange={() => onChange({ ...activeFilters, priceRange: [2, 999] })}
                className="w-4 h-4 text-primary focus:ring-ring"
              />
              <span className="text-sm text-gray-700">Premium (Over £2/day)</span>
            </label>
          </div>
        </FilterSection>

        {/* Brands */}
        {availableBrands.length > 0 && (
          <FilterSection
            title="Brands"
            isExpanded={expandedSections.has('brands')}
            onToggle={() => toggleSection('brands')}
          >
            <div className="max-h-48 overflow-y-auto">
              {availableBrands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.brands?.includes(brand.id) || false}
                    onChange={() => handleBrandChange(brand.id)}
                    className="w-4 h-4 text-primary rounded focus:ring-ring"
                  />
                  <span className="text-sm text-gray-700">{brand.name}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}
      </div>
    </div>
  );
}

// Filter Section Component
interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isExpanded && (
        <div className="px-2 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}



