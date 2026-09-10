import React from 'react';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  className,
  onClick,
  target,
  rel,
  ...rest
}) => {
  const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // Allow user to open in new tab or window normally
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey ||
      target === '_blank' ||
      isExternal
    ) {
      return;
    }

    e.preventDefault();

    if (window.location.pathname + window.location.search + window.location.hash !== href) {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    // Scroll handling: to anchor if present, otherwise to top
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      if (href.includes('#')) {
        const hash = href.split('#')[1];
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      target={target}
      rel={isExternal ? rel || 'noopener noreferrer' : rel}
      {...rest}
    >
      {children}
    </a>
  );
};
