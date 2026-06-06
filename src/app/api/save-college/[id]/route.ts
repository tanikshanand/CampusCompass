import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Saved College ID or College ID is required' }, { status: 400 });
    }

    // 2. Locate the bookmark (we allow deleting by SavedCollege.id or College.id)
    const savedRecord = await db.savedCollege.findFirst({
      where: {
        userId,
        OR: [
          { id: id },
          { collegeId: id }
        ]
      }
    });

    if (!savedRecord) {
      return NextResponse.json(
        { error: 'Bookmark not found or you are not authorized to delete it.' },
        { status: 404 }
      );
    }

    // 3. Remove bookmark
    await db.savedCollege.delete({
      where: {
        id: savedRecord.id,
      },
    });

    return NextResponse.json({
      message: 'College removed from bookmarks successfully.',
      deletedId: savedRecord.id,
    });
  } catch (error) {
    console.error('API Error in DELETE /api/save-college/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
