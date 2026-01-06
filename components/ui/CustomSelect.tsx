import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Select...", className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg px-4 py-3 text-left flex items-center justify-between transition-colors bg-[var(--color-background-card)] border-[var(--color-border)] hover:border-[var(--color-trust)] focus:outline-none focus:ring-2 focus:ring-[var(--color-trust)] border"
      >
        <span className={`text-sm ${selectedOption ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform text-[var(--color-text-secondary)] ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-lg max-h-60 overflow-y-auto bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-medium)] border">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--color-trust-bg)] focus:outline-none focus:bg-[var(--color-trust-bg)] ${
                option.value === value ? 'font-medium bg-[var(--color-trust-bg)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
