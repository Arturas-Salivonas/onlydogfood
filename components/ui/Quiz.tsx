'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface QuizOption {
  value: string;
  label: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  description: string;
  options: QuizOption[];
}

interface QuizProps {
  isOpen: boolean;
  onClose: () => void;
}

const questions: QuizQuestion[] = [
  {
    id: 'age',
    question: 'How old is your dog?',
    description: 'This helps us find the right food for where they\'re at in life.',
    options: [
      { value: 'puppy', label: 'Puppy (under 1 year)' },
      { value: 'adult', label: 'Adult (1-7 years)' },
      { value: 'senior', label: 'Senior (8+ years)' },
      { value: 'not-sure', label: 'I\'m not sure yet' },
    ],
  },
  {
    id: 'size',
    question: 'What size is your dog?',
    description: 'Different sizes have different nutritional needs.',
    options: [
      { value: 'small', label: 'Small (under 10kg)' },
      { value: 'medium', label: 'Medium (10-25kg)' },
      { value: 'large', label: 'Large (over 25kg)' },
      { value: 'all', label: 'Not sure / All sizes' },
    ],
  },
  {
    id: 'food-type',
    question: 'What type of food do you prefer?',
    description: 'Both dry and wet food can be excellent choices.',
    options: [
      { value: 'dry', label: 'Dry food (kibble)' },
      { value: 'wet', label: 'Wet food (canned)' },
      { value: 'all', label: 'No preference' },
    ],
  },
  {
    id: 'sensitivities',
    question: 'Does your dog have any sensitivities?',
    description: 'This helps us avoid ingredients that might cause issues.',
    options: [
      { value: 'none', label: 'No known sensitivities' },
      { value: 'grain', label: 'Grain sensitivity' },
      { value: 'chicken', label: 'Chicken sensitivity' },
      { value: 'other', label: 'Other sensitivities' },
    ],
  },
  {
    id: 'budget',
    question: 'What\'s your budget per month?',
    description: 'We\'ll find the best quality within your price range.',
    options: [
      { value: '0-20', label: 'Under £20' },
      { value: '20-50', label: '£20-£50' },
      { value: '50-100', label: '£50-£100' },
      { value: '100+', label: 'Over £100' },
    ],
  },
];

export function Quiz({ isOpen, onClose }: QuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');

  const currentQuestion = questions[currentStep];
  const totalSteps = questions.length;

  const handleNext = () => {
    if (selectedOption) {
      setAnswers({ ...answers, [currentQuestion.id]: selectedOption });

      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedOption('');
      } else {
        // Quiz complete - show results
        handleShowResults();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedOption(answers[questions[currentStep - 1].id] || '');
    }
  };

  const handleShowResults = () => {
    // Redirect to dog food page with filters based on answers
    const params = new URLSearchParams();

    if (answers.age && answers.age !== 'not-sure') {
      params.append('lifeStage', answers.age);
    }
    if (answers.size && answers.size !== 'all') {
      params.append('breedSize', answers.size);
    }
    if (answers['food-type'] && answers['food-type'] !== 'all') {
      params.append('category', answers['food-type']);
    }
    if (answers.budget) {
      params.append('priceRange', answers.budget);
    }

    window.location.href = `/dog-food?${params.toString()}`;
  };

  const handleClose = () => {
    setCurrentStep(0);
    setAnswers({});
    setSelectedOption('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-[var(--color-background-card)] rounded-2xl shadow-[var(--shadow-large)] p-8 md:p-12">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-[var(--color-background-neutral)] rounded-lg transition-all"
          aria-label="Close quiz"
        >
          <X size={24} className="text-[var(--color-text-secondary)]" />
        </button>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="inline-block px-6 py-2 bg-[var(--color-trust-light)] rounded-full">
            <span className="text-sm font-bold text-[var(--color-text-secondary)] tracking-wider uppercase">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Question */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-text-primary)]">
          {currentQuestion.question}
        </h2>

        {/* Description */}
        <p className="text-lg text-[var(--color-text-secondary)] mb-8">
          {currentQuestion.description}
        </p>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedOption === option.value
                  ? 'border-[var(--color-trust)] bg-[var(--color-trust-bg)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-trust)] hover:bg-[var(--color-background-neutral)]'
              }`}
            >
              <input
                type="radio"
                name={currentQuestion.id}
                value={option.value}
                checked={selectedOption === option.value}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="sr-only"
              />
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                  selectedOption === option.value
                    ? 'border-[var(--color-trust)] bg-[var(--color-trust)]'
                    : 'border-[var(--color-border)]'
                }`}
              >
                {selectedOption === option.value && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-base font-medium text-[var(--color-text-primary)]">
                {option.label}
              </span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="w-full md:w-auto px-12 py-4 bg-[var(--color-trust)] text-white rounded-[30px] font-bold text-base hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--shadow-medium)] flex items-center justify-center gap-2"
          >
            {currentStep < totalSteps - 1 ? 'Next' : 'Show recommendations'}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors font-medium underline"
            >
              Go back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
