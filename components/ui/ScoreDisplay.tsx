import { getScoreColor } from '@/scoring/calculator';

interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreDisplay({ score, size = 'md', showLabel = true }: ScoreDisplayProps) {
  const scoreInfo = getScoreColor(score);

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center justify-center rounded-full ${scoreInfo.bgColor} ${sizeClasses[size]}`}>
        <span className={`font-bold ${scoreInfo.color}`}>
          {Math.round(score)}
        </span>
      </div>
      {showLabel && (
        <span className={`text-sm font-semibold ${scoreInfo.color}`}>
          {scoreInfo.label}
        </span>
      )}
    </div>
  );
}
