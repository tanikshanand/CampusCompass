import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const ids = searchParams.get('ids')?.split(',').map(id => id.trim()).filter(Boolean) || [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "ids" (comma-separated list of IDs or slugs) is required.' },
        { status: 400 }
      );
    }

    if (ids.length > 4) {
      return NextResponse.json(
        { error: 'You can compare a maximum of 4 colleges at a time.' },
        { status: 400 }
      );
    }

    // Fetch details for all requested colleges
    const colleges = await db.college.findMany({
      where: {
        OR: [
          { id: { in: ids } },
          { slug: { in: ids } }
        ]
      },
      include: {
        courses: {
          select: {
            course: {
              select: {
                name: true,
                code: true,
                category: true,
              },
            },
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Format results and calculate ratings
    const formattedComparison = colleges.map(col => {
      const totalReviews = col.reviews.length;
      const averageRating =
        totalReviews > 0
          ? Number((col.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
          : null;

      return {
        id: col.id,
        name: col.name,
        slug: col.slug,
        city: col.city,
        state: col.state,
        tuitionInState: col.tuitionInState,
        tuitionOutState: col.tuitionOutState,
        admissionRate: col.admissionRate,
        graduationRate: col.graduationRate,
        websiteUrl: col.websiteUrl,
        logoUrl: col.logoUrl,
        imageUrl: col.imageUrl,
        courses: col.courses.map(c => c.course),
        stats: {
          totalReviews,
          averageRating,
        },
      };
    });

    return NextResponse.json({
      colleges: formattedComparison,
    });
  } catch (error) {
    console.error('API Error in GET /api/colleges/compare:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
