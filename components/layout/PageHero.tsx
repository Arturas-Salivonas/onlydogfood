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
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm mb-6 flex-wrap font-mono">
            {breadcrumbs[0]?.label !== 'Home' && (
              <>
                <Link href="/" className="text-blue-100 hover:text-white font-medium transition-colors">
                  Home
                </Link>
                <div className="flex items-center gap-2">
                  <ChevronRight size={16} className="text-blue-300" />
                </div>
              </>
            )}
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight size={16} className="text-blue-300" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-white font-semibold">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-blue-100 hover:text-white font-medium transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Title & Description */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">{title}</h1>
          {description && (
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-4`}>
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
