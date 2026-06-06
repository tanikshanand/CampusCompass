import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'College ID or slug is required' }, { status: 400 });
    }

    // Try finding by ID first, fallback to slug if ID is not found or not in cuid format
    const college = await db.college.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      include: {
        courses: {
          select: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                category: true,
              },
            },
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // Calculate aggregate metrics on the fly
    const totalReviews = college.reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((college.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
        : null;

    // Flatten courses structure for cleaner API response
    const formattedCollege = {
      ...college,
      courses: college.courses.map(c => c.course),
      stats: {
        totalReviews,
        averageRating,
      },
    };

    return NextResponse.json(formattedCollege);
  } catch (error) {
    console.error('API Error in GET /api/colleges/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
