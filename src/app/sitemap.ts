import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:3000';

  // 1. Fetch all colleges to index their details pages
  let collegeUrls: MetadataRoute.Sitemap = [];
  try {
    const colleges = await db.college.findMany({
      select: { slug: true, updatedAt: true },
    });
    
    collegeUrls = colleges.map((col) => ({
      url: `${baseUrl}/colleges/${col.slug}`,
      lastModified: col.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to fetch colleges for dynamic sitemap:', error);
  }

  // 2. Static public route entries
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/colleges`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...collegeUrls];
}
