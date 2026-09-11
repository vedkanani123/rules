// Static HTML Pre-rendering Script for PropFirmRules.io
// Transforms client-side React SPA into fully pre-rendered static HTML documents for SEO crawlers and users
// Preserves React hydration on the client side

import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { ALL_SEO_ROUTES, RouteSEOData } from '../src/core/seo/routesRegistry.ts';
import { BASE_URL } from '../src/core/seo/schemaGenerator.ts';
import { App } from '../src/App.tsx';

// Setup Mock DOM environment for Node SSR
function setupMockDom(targetPath: string) {
  (globalThis as any).window = {
    location: {
      pathname: targetPath,
      search: '',
      hash: '',
      href: `${BASE_URL}${targetPath}`,
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false }),
    scrollTo: () => {},
    dataLayer: [],
  };

  (globalThis as any).document = {
    title: '',
    head: { appendChild: () => {} },
    body: { style: {} },
    documentElement: { style: {} },
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      setAttribute: () => {},
      appendChild: () => {},
    }),
  };
}

async function prerender() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('Error: dist/index.html not found! Run "vite build" first.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  console.log(`Starting SEO pre-rendering for ${ALL_SEO_ROUTES.length} routes...`);

  let renderedCount = 0;

  for (const route of ALL_SEO_ROUTES) {
    setupMockDom(route.path);

    // 1. Render App component into HTML string
    let appHtml = '';
    try {
      appHtml = ReactDOMServer.renderToString(React.createElement(App));
    } catch (err) {
      console.error(`Error rendering route ${route.path}:`, err);
      continue;
    }

    // 2. Build JSON-LD block
    const jsonLdBlock = route.schemaGraph && route.schemaGraph.length > 0
      ? `<script type="application/ld+json">\n${JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': route.schemaGraph,
        }, null, 2)}\n</script>`
      : '';

    // 3. Inject metadata, canonical, and rendered HTML into template
    let pageHtml = template;

    // Update <title>
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);
    pageHtml = pageHtml.replace(/<meta name="title" content=".*?" \/>/i, `<meta name="title" content="${route.title}" />`);

    // Update <meta name="description">
    pageHtml = pageHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${route.metaDescription}" />`);

    // Update <meta name="keywords">
    if (route.keywords) {
      pageHtml = pageHtml.replace(/<meta name="keywords" content=".*?" \/>/i, `<meta name="keywords" content="${route.keywords}" />`);
    }

    // Update OpenGraph and Twitter
    pageHtml = pageHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${route.title}" />`);
    pageHtml = pageHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${route.metaDescription}" />`);
    pageHtml = pageHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${route.canonicalUrl}" />`);
    pageHtml = pageHtml.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${route.title}" />`);
    pageHtml = pageHtml.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${route.metaDescription}" />`);
    pageHtml = pageHtml.replace(/<meta name="twitter:url" content=".*?" \/>/i, `<meta name="twitter:url" content="${route.canonicalUrl}" />`);

    // Inject Canonical URL
    const canonicalTag = `<link rel="canonical" href="${route.canonicalUrl}" />`;
    if (!pageHtml.includes('rel="canonical"')) {
      pageHtml = pageHtml.replace('</head>', `    ${canonicalTag}\n  </head>`);
    } else {
      pageHtml = pageHtml.replace(/<link rel="canonical" href=".*?" \/>/i, canonicalTag);
    }

    // Inject Schema JSON-LD before </head>
    if (jsonLdBlock) {
      pageHtml = pageHtml.replace('</head>', `  ${jsonLdBlock}\n  </head>`);
    }

    // Inject prerendered App HTML inside <div id="root">
    pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    // 4. Save to dist directory structure
    let outFilePath = '';
    if (route.path === '/') {
      outFilePath = path.join(distDir, 'index.html');
    } else {
      const relPath = route.path.replace(/^\//, '');
      const outDir = path.join(distDir, relPath);
      fs.mkdirSync(outDir, { recursive: true });
      outFilePath = path.join(outDir, 'index.html');
    }

    fs.writeFileSync(outFilePath, pageHtml, 'utf-8');
    renderedCount++;
  }

  console.log(`Successfully pre-rendered ${renderedCount} / ${ALL_SEO_ROUTES.length} static HTML pages!`);
}

prerender().catch((err) => {
  console.error('Fatal pre-rendering error:', err);
  process.exit(1);
});
