import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { reviewSchema } from '@/schemas/api';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // 2. Validate input parameters
    const body = await request.json();
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { collegeId, rating, content } = result.data;

    // 3. Confirm target College exists
    const college = await db.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // 4. Enforce unique review constraint (1 review per user per college)
    const existingReview = await db.review.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this college.' },
        { status: 409 }
      );
    }

    // 5. Create Review
    const newReview = await db.review.create({
      data: {
        userId,
        collegeId,
        rating,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
