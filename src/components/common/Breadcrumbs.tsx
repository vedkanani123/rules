import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from './Link.tsx';

export interface BreadcrumbCrumb {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbCrumb[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (!items || items.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`py-3 text-xs text-[#8A8F98] ${className}`}
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        {items.map((crumb, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li
              key={crumb.url + idx}
              className="flex items-center gap-1.5"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {idx > 0 && <ChevronRight className="w-3 h-3 text-white/30 shrink-0" aria-hidden="true" />}
              {isLast ? (
                <span
                  className="text-white font-medium truncate max-w-[240px] sm:max-w-md"
                  aria-current="page"
                  itemProp="name"
                >
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.url}
                  className="hover:text-white transition-colors flex items-center gap-1"
                  itemProp="item"
                >
                  {idx === 0 && <Home className="w-3 h-3 text-white/40" />}
                  <span itemProp="name">{crumb.name}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(idx + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
