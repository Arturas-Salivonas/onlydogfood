import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeroProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

export function PageHero({ title, description, breadcrumbs, stats }: PageHeroProps) {
  return (
    <div className="relative pt-16 bg-[var(--color-trust-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm mb-6 flex-wrap">
            {breadcrumbs[0]?.label !== 'Home' && (
              <>
                <Link href="/" className="font-normal transition-colors text-[var(--color-text-primary)]">
                  Home
                </Link>
                <div className="flex items-center gap-2">
                  <ChevronRight size={16} className="text-[var(--color-text-secondary)]" />
                </div>
              </>
            )}
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight size={16} className="text-[var(--color-text-secondary)]" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-bold text-[var(--color-text-primary)]">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="font-normal transition-colors text-[var(--color-text-primary)]">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Title & Description */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-normal mb-4 leading-tight text-[var(--color-text-primary)]">{title}</h1>
          {description && (
            <p className="text-lg max-w-3xl mx-auto leading-relaxed text-[var(--color-text-secondary)]">
              {description}
            </p>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-4`}>
            {stats.map((stat, index) => (
              <div key={index} className="backdrop-blur rounded-lg p-4 text-center border bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)]">
                <div className="text-2xl font-bold mb-1 text-[var(--color-text-primary)]">{stat.value}</div>
                <div className="text-sm text-[var(--color-text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
