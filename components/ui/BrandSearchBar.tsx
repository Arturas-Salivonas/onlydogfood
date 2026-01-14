'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/FormField';
import Link from 'next/link';
import Image from 'next/image';

// Helper function to get color codes based on score
const getScoreColorCode = (score: number): string => {
  if (score >= 80) return '#15803d'; // green-700
  if (score >= 60) return '#a16207'; // yellow-700
  if (score >= 40) return '#c2410c'; // orange-700
  return '#b91c1c'; // red-700
};

interface BrandSuggestion {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  overall_score: number | null;
  total_products: number;
}

interface BrandSearchBarProps {
  placeholder?: string;
  className?: string;
  variant?: 'light' | 'dark';
  onSuggestionSelect?: (suggestion: BrandSuggestion) => void;
}

// Custom Search Icon component
const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

export function BrandSearchBar({
  placeholder = "Search dog food brands...",
  className = "",
  variant = 'light',
  onSuggestionSelect
}: BrandSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<BrandSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch brand suggestions
  useEffect(() => {
    const fetchBrands = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        setSuggestions(data.brands || []);
      } catch (err) {
        console.error('Brand search error:', err);
        setError('Failed to search brands');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchBrands, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: BrandSuggestion) => {
    setSearchTerm(suggestion.name);
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      router.push(`/brands/${suggestion.slug}`);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length >= 2);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setIsOpen(true);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Styling based on variant
  const inputClasses = variant === 'dark'
    ? 'bg-white/25 backdrop-blur-md border-white/40 text-white placeholder:text-white/70 focus:border-white/80 focus:ring-white/60 shadow-2xl ring-1 ring-white/20'
    : 'bg-white border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-trust)] focus:ring-[var(--color-trust)] shadow-[var(--shadow-small)]';

  const dropdownClasses = variant === 'dark'
    ? 'bg-white/98 backdrop-blur-xl border-white/30 shadow-2xl ring-1 ring-white/20'
    : 'bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-medium)]';

  const iconColor = variant === 'dark' ? 'text-white/80' : 'text-[var(--color-text-secondary)]';

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          leftIcon={<SearchIcon className={`w-5 h-5 ${iconColor}`} />}
          rightIcon={
            searchTerm && (
              <button
                onClick={clearSearch}
                className={`${variant === 'dark' ? 'text-white/70 hover:text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'} transition-colors p-1 hover:bg-[var(--color-background-hover)] rounded-full`}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )
          }
          className={`pr-12 pl-12 text-base font-medium ${inputClasses}`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute top-full left-0 right-0 mt-4 border rounded-2xl z-50 max-h-[500px] overflow-hidden ${dropdownClasses}`}
        >
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading && (
              <div className="px-6 py-8 text-center">
                <div className="inline-flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                  <div className="w-5 h-5 border-2 border-[var(--color-trust)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Searching brands...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="px-6 py-6 text-center">
                <div className="text-sm font-medium text-[var(--color-error)] bg-[var(--color-error-bg)] px-4 py-3 rounded-xl border border-[var(--color-error)]">
                  {error}
                </div>
              </div>
            )}

            {!isLoading && !error && suggestions.length === 0 && searchTerm.length >= 2 && (
              <div className="px-6 py-8 text-center">
                <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                  No brands found for "{searchTerm}"
                </div>
              </div>
            )}

            {!isLoading && !error && suggestions.length > 0 && (
              <div className="py-2">
                {suggestions.map((brand, index) => {
                  const score = brand.overall_score || 0;
                  const scoreColor = getScoreColorCode(score);
                  const isSelected = index === selectedIndex;

                  return (
                    <Link
                      key={brand.id}
                      href={`/brands/${brand.slug}`}
                      className={`flex items-center gap-4 px-4 py-3 transition-all duration-200 cursor-pointer border-l-4 ${
                        isSelected
                          ? 'bg-[var(--color-background-hover)] border-[var(--color-trust)] shadow-sm'
                          : 'border-transparent hover:bg-[var(--color-background-hover)] hover:border-[var(--color-trust-light)]'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSuggestionSelect(brand);
                      }}
                    >
                      {/* Brand Logo */}
                      <div className="w-16 h-16 bg-[var(--color-background-secondary)] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm border border-[var(--color-border)]">
                        {brand.logo_url ? (
                          <Image
                            src={brand.logo_url}
                            alt={brand.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-[var(--color-text-tertiary)]" />
                        )}
                      </div>

                      {/* Brand Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold truncate text-[var(--color-text-primary)] mb-1">
                          {brand.name}
                        </div>
                        <div className="text-sm text-[var(--color-text-secondary)]">
                          {brand.total_products} {brand.total_products === 1 ? 'product' : 'products'}
                        </div>
                      </div>

                      {/* Score Badge */}
                      {score > 0 && (
                        <div className="flex-shrink-0 text-right">
                          <div 
                            className="inline-flex flex-col items-end gap-1 px-4 py-2 rounded-lg border-2 shadow-sm"
                            style={{
                              backgroundColor: `${scoreColor}15`,
                              borderColor: scoreColor,
                            }}
                          >
                            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: scoreColor }}>
                              ODF Score
                            </div>
                            <div className="text-2xl font-bold leading-none" style={{ color: scoreColor }}>
                              {score}
                            </div>
                          </div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Search all results */}
            {searchTerm.length >= 2 && (
              <div className="border-t border-[var(--color-border)] bg-[var(--color-background-secondary)]">
                <button
                  onClick={handleSearch}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-[var(--color-background-hover)] transition-colors text-left"
                >
                  <SearchIcon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    Search all results for "{searchTerm}"
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
