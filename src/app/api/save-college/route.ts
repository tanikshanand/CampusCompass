import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { saveCollegeSchema } from '@/schemas/api';

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
    const result = saveCollegeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { collegeId, notes } = result.data;

    // 3. Confirm target College exists
    const college = await db.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    // 4. Save or Update bookmark
    const existingSaved = await db.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId,
        },
      },
    });

    if (existingSaved) {
      // If it exists already, we update the notes field
      const updatedSaved = await db.savedCollege.update({
        where: {
          userId_collegeId: {
            userId,
            collegeId,
          },
        },
        data: {
          notes: notes !== undefined ? notes : existingSaved.notes,
        },
      });
      return NextResponse.json({
        message: 'Saved college notes updated successfully.',
        data: updatedSaved,
      });
    }

    // Otherwise, create a new saved record
    const newSaved = await db.savedCollege.create({
      data: {
        userId,
        collegeId,
        notes,
      },
    });

    return NextResponse.json(
      {
        message: 'College bookmarked successfully.',
        data: newSaved,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API Error in POST /api/save-college:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
