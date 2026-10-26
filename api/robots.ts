import fs from 'fs';
import path from 'path';
import { initResponseHelpers } from './_helpers.ts';

const ROBOTS_TXT_CONTENT = `# https://www.theimpart.com/robots.txt
# Конфігурація індексації для пошукових систем видання The Impart

User-agent: *
Allow: /

# Заборона індексації адміністративних та службових розділів
Disallow: /admin
Disallow: /admin/
Disallow: /editor
Disallow: /editor/
Disallow: /login
Disallow: /login/
Disallow: /api/

# Карти сайту (Sitemap)
Sitemap: https://www.theimpart.com/sitemap.xml
Sitemap: https://www.theimpart.com/news-sitemap.xml
`;

export default function handler(req: any, res: any) {
  initResponseHelpers(res);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(405).send('Method Not Allowed');
  }

  // Спробувати прочитати актуальний файл з диска (public/robots.txt), якщо доступний
  let contentToSend = ROBOTS_TXT_CONTENT;
  const candidatePaths = [
    path.join(process.cwd(), 'public', 'robots.txt'),
    path.join(process.cwd(), 'dist', 'robots.txt'),
    path.resolve('public/robots.txt'),
    path.resolve('dist/robots.txt'),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const fileContent = fs.readFileSync(p, 'utf-8');
        if (fileContent && fileContent.trim()) {
          contentToSend = fileContent;
          break;
        }
      }
    } catch {}
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  return res.status(200).send(contentToSend);
}
