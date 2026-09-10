// Dynamic Sitemap Generator for PropFirmRules.io
// Extracts all verified, indexable 200 OK routes from routesRegistry.ts with real lastmod dates
// Writes sitemap.xml to both public/ (for dev/build) and dist/ (for production deployment)

import fs from 'node:fs';
import path from 'node:path';
import { ALL_SEO_ROUTES } from '../src/core/seo/routesRegistry.ts';
import { BASE_URL } from '../src/core/seo/schemaGenerator.ts';

function generateSitemapXml(): string {
  const indexableRoutes = ALL_SEO_ROUTES.filter((r) => r.isIndexable);

  const urlEntries = indexableRoutes.map((route) => {
    let priority = '0.7';
    let changefreq = 'weekly';

    if (route.path === '/') {
      priority = '1.0';
      changefreq = 'daily';
    } else if (route.pageType === 'core') {
      priority = '0.9';
      changefreq = 'daily';
    } else if (route.pageType === 'firm') {
      priority = '0.85';
      changefreq = 'weekly';
    } else if (route.pageType === 'rule') {
      priority = '0.8';
      changefreq = 'weekly';
    } else if (route.pageType === 'compare') {
      priority = '0.8';
      changefreq = 'weekly';
    } else if (route.pageType === 'attribute') {
      priority = '0.8';
      changefreq = 'weekly';
    } else if (route.pageType === 'account') {
      priority = '0.75';
      changefreq = 'weekly';
    } else if (route.pageType === 'legal') {
      priority = '0.5';
      changefreq = 'monthly';
    }

    const loc = `${BASE_URL}${route.path === '/' ? '' : route.path}`;

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;
}

function main() {
  const xml = generateSitemapXml();

  // 1. Write to public/sitemap.xml
  const publicPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf-8');
  console.log(`Generated public sitemap with ${ALL_SEO_ROUTES.length} URLs -> ${publicPath}`);

  // 2. Write to dist/sitemap.xml if dist directory exists
  const distDir = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    const distPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distPath, xml, 'utf-8');
    console.log(`Generated dist sitemap with ${ALL_SEO_ROUTES.length} URLs -> ${distPath}`);
  }
}

main();
