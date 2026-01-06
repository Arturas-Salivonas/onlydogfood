'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Package } from 'lucide-react';
import { useSearchSuggestions, SearchSuggestion } from '@/hooks/useSearchSuggestions';
import { Input } from '@/components/ui/FormField';
import Link from 'next/link';
import Image from 'next/image';

interface LiveSearchBarProps {
  placeholder?: string;
  className?: string;
  variant?: 'light' | 'dark';
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
}

// Custom Search Icon component with explicit colors
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

export function LiveSearchBar({
  placeholder = "Search dog food...",
  className = "",
  variant = 'light',
  onSuggestionSelect
}: LiveSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading, error, clearSuggestions } = useSearchSuggestions(searchTerm, isOpen);

  // Only show products, filter out brands
  const products = suggestions.filter(s => s.type === 'product');

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

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || products.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < products.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : products.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < products.length) {
          handleSuggestionSelect(products[selectedIndex]);
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

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text);
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      // Navigate to product page
      router.push(`/dog-food/${suggestion.product?.slug || suggestion.text.toLowerCase().replace(/\s+/g, '-')}`);
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
    setIsOpen(value.length >= 3); // Only open when 3+ characters
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 3) {
      setIsOpen(true);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
    clearSuggestions();
    inputRef.current?.focus();
  };

  const getSuggestionIcon = () => {
    return <Package className="w-4 h-4 text-orange-500" />;
  };

  const getSuggestionUrl = (suggestion: SearchSuggestion) => {
    return `/dog-food/${suggestion.product?.slug || suggestion.text.toLowerCase().replace(/\s+/g, '-')}`;
  };

  // Styling based on variant
  const inputClasses = variant === 'dark'
    ? 'bg-white/25 backdrop-blur-md border-white/40 text-white placeholder:text-white/70 focus:border-white/80 focus:ring-white/60 shadow-2xl ring-1 ring-white/20'
    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-ring focus:ring-ring shadow-sm';

  const dropdownClasses = variant === 'dark'
    ? 'bg-white/98 backdrop-blur-xl border-white/30 shadow-2xl ring-1 ring-white/20'
    : 'bg-white border-gray-200 shadow-xl';

  const iconColor = variant === 'dark' ? 'text-secondary' : 'text-gray-400';

  const resultItemClasses = (isSelected: boolean) => variant === 'dark'
    ? `flex items-center gap-3 px-4 py-3 hover:bg-background/80 transition-all duration-200 cursor-pointer border-l-2 ${
        isSelected
          ? 'bg-foreground/90 border-primary shadow-sm'
          : 'border-transparent hover:border-secondary'
      }`
    : `flex items-center gap-3 px-4 py-3 hover:bg-primary transition-colors cursor-pointer border-l-2 border-transparent hover:border-warning ${
        isSelected ? 'bg-primary border-warning' : ''
      }`;

  const scoreBadgeClasses = variant === 'dark'
    ? 'text-sm font-bold text-primary-hover bg-foreground px-3 py-1.5 rounded-full shadow-sm border border-secondary'
    : 'text-sm font-semibold text-success bg-primary px-2 py-1 rounded';

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
                className={`${variant === 'dark' ? 'text-secondary hover:text-foreground' : 'text-gray-400 hover:text-gray-600'} transition-colors p-1 hover:bg-white/10 rounded-full`}
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
          className={`absolute top-full left-0 right-0 mt-4 border rounded-2xl z-50 max-h-96 overflow-hidden ${dropdownClasses}`}
        >
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="px-6 py-8 text-center">
                <div className="inline-flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 border-2 border-ring border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Searching...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="px-6 py-6 text-center">
                <div className={`text-sm font-medium text-error bg-primary px-4 py-3 rounded-xl border border-error`}>
                  {error}
                </div>
              </div>
            )}

            {!isLoading && !error && products.length === 0 && searchTerm.length >= 3 && (
              <div className="px-6 py-8 text-center">
                <div className={`text-sm font-medium ${variant === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  No dog food found for "{searchTerm}"
                </div>
              </div>
            )}

            {!isLoading && !error && products.length > 0 && (
              <div className="py-2">
                {products.map((suggestion, index) => (
                  <Link
                    key={suggestion.id}
                    href={getSuggestionUrl(suggestion)}
                    className={resultItemClasses(index === selectedIndex)}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSuggestionSelect(suggestion);
                    }}
                  >
                    {/* Product Image */}
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm border border-gray-200">
                      {suggestion.product?.image_url ? (
                        <Image
                          src={suggestion.product.image_url}
                          alt={suggestion.text}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${variant === 'dark' ? 'text-gray-900' : 'text-gray-900'}`}>
                        {suggestion.text}
                      </div>
                      <div className={`text-xs truncate mt-0.5 ${variant === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>
                        {suggestion.brand?.name || 'Unknown brand'}
                      </div>
                    </div>

                    {/* Overall Score */}
                    {suggestion.score && (
                      <div className="flex-shrink-0">
                        <div className={scoreBadgeClasses}>
                          {Math.round(suggestion.score * 100)}
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Search all results */}
            {searchTerm.length >= 3 && (
              <div className={`border-t ${variant === 'dark' ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-gray-50'}`}>
                <button
                  onClick={handleSearch}
                  className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-100 transition-colors text-left ${
                    variant === 'dark' ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-700'
                  }`}
                >
                  <SearchIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">
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



