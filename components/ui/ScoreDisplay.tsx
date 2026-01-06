import { getScoreColor, getScoreGrade } from '@/scoring/calculator';

export type ScoreGrade = 'Excellent' | 'Good' | 'Fair' | 'Poor';

interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showGrade?: boolean;
}

export function ScoreDisplay({
  score,
  size = 'md',
  showLabel = true,
  showGrade = true
}: ScoreDisplayProps) {
  const scoreInfo = getScoreColor(score);
  const grade = getScoreGrade(score);

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center justify-center rounded-full ${scoreInfo.bgColor} ${sizeClasses[size]} shadow-lg`}>
        <span className={`font-bold ${scoreInfo.color}`}>
          {Math.round(score)}
        </span>
      </div>
      {(showLabel || showGrade) && (
        <div className="flex flex-col items-center gap-1">
          {showGrade && (
            <span className={`${textSizeClasses[size]} font-bold ${scoreInfo.color}`}>
              {grade}
            </span>
          )}
          {showLabel && (
            <span className={`${textSizeClasses[size]} font-medium text-[var(--color-text-secondary)]`}>
              Score
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// New ScoreBadge component as specified
interface ScoreBadgeProps {
  score: number;
  grade?: ScoreGrade;
  size?: 'sm' | 'md' | 'lg';
  sticky?: boolean;
}

export function ScoreBadge({ score, grade: providedGrade, size = 'md', sticky = false }: ScoreBadgeProps) {
  const grade = providedGrade || getScoreGrade(score);

  // Color scale based on score
  const getColorClasses = (score: number) => {
    if (score >= 80) return 'bg-[var(--color-trust)] text-[var(--color-background-card)] border-[var(--color-trust)]';
    if (score >= 60) return 'bg-[var(--color-trust-bg)] text-[var(--color-text-primary)] border-[var(--color-trust)]';
    if (score >= 40) return 'bg-[var(--color-caution-bg)] text-[var(--color-text-primary)] border-[var(--color-caution)]';
    return 'bg-[var(--color-caution)] text-[var(--color-background-card)] border-[var(--color-caution)]';
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const scoreSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div
      className={`${getColorClasses(score)} ${sizeClasses[size]} rounded-lg border-2 flex items-center gap-3 font-bold shadow-[var(--shadow-medium)] ${
        sticky ? 'sticky top-4 z-10' : ''
      }`}
    >
      <span className={scoreSizeClasses[size]}>{Math.round(score)}</span>
      <div className="flex flex-col items-start">
        <span className="text-xs opacity-90">Overall score</span>
        <span className="text-sm">{grade}</span>
      </div>
    </div>
  );
}
