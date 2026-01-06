'use client';

import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export type IngredientFlagType = 'positive' | 'warning' | 'negative';

interface IngredientFlagProps {
  type: IngredientFlagType;
  label: string;
  reason?: string;
  showIcon?: boolean;
}

export function IngredientFlag({
  type,
  label,
  reason,
  showIcon = true
}: IngredientFlagProps) {
  const [showReason, setShowReason] = useState(false);

  const config = {
    positive: {
      bgColor: 'bg-success',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    warning: {
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    negative: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      icon: AlertCircle,
      iconColor: 'text-red-600',
    },
  };

  const { bgColor, textColor, borderColor, icon: Icon, iconColor } = config[type];

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${bgColor} ${textColor} ${borderColor} text-xs font-medium transition-all hover:shadow-md ${
          reason ? 'cursor-help' : ''
        }`}
        onMouseEnter={() => reason && setShowReason(true)}
        onMouseLeave={() => setShowReason(false)}
      >
        {showIcon && <Icon className={`w-3.5 h-3.5 ${iconColor}`} />}
        <span>{label}</span>
      </div>

      {reason && showReason && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-20">
          <p>{reason}</p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      )}
    </div>
  );
}

// Compound component for displaying multiple flags
interface IngredientFlagsGroupProps {
  flags: Array<{
    type: IngredientFlagType;
    label: string;
    reason?: string;
  }>;
  maxDisplay?: number;
}

export function IngredientFlagsGroup({ flags, maxDisplay }: IngredientFlagsGroupProps) {
  const displayFlags = maxDisplay ? flags.slice(0, maxDisplay) : flags;
  const remainingCount = maxDisplay && flags.length > maxDisplay ? flags.length - maxDisplay : 0;

  return (
    <div className="flex flex-wrap gap-2">
      {displayFlags.map((flag, index) => (
        <IngredientFlag key={index} {...flag} />
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}



