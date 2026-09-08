SITE CRAWLER EXPORT

This ZIP contains a machine-readable manifest plus the formats selected for this crawl.

Folders:
- txt/     Readable text extracted from each HTML page
- html/    Original HTML source returned by each HTML page
- assets/  Same-site images, CSS, JavaScript, fonts, and media that downloaded successfully

Open 00-crawl-manifest.json to map each page to its files and see skipped asset reasons.
External CDN assets are listed in the manifest but are not downloaded because this crawler stays on the starting hostname.
