'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ShortlistCategory } from '@/lib/types';

const bookmarkSchema = z.object({
  collegeId: z.string().cuid('Invalid College ID format'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
});

/**
 * Saves or updates a bookmark for a college.
 */
export async function saveCollegeAction(collegeId: string, notes?: string | null) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    throw new Error('Unauthorized. Please log in.');
  }

  // Validate fields
  const validation = bookmarkSchema.safeParse({ collegeId, notes });
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const collegeExists = await db.college.findUnique({ where: { id: collegeId } });
  if (!collegeExists) {
    throw new Error('College not found.');
  }

  const bookmark = await db.savedCollege.upsert({
    where: {
      userId_collegeId: {
        userId,
        collegeId,
      },
    },
    update: {
      notes: notes !== undefined ? notes : undefined,
    },
    create: {
      userId,
      collegeId,
      notes,
    },
  });

  // Revalidate query caches to trigger instant UI updates
  revalidatePath('/saved');
  revalidatePath('/colleges');
  revalidatePath(`/colleges/${collegeExists.slug}`);

  return bookmark;
}

/**
 * Deletes a college bookmark.
 */
export async function removeCollegeAction(collegeId: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    throw new Error('Unauthorized. Please log in.');
  }

  const collegeExists = await db.college.findUnique({ where: { id: collegeId } });
  if (!collegeExists) {
    throw new Error('College not found.');
  }

  await db.savedCollege.delete({
    where: {
      userId_collegeId: {
        userId,
        collegeId,
      },
    },
  });

  // Revalidate query caches to trigger instant UI updates
  revalidatePath('/saved');
  revalidatePath('/colleges');
  revalidatePath(`/colleges/${collegeExists.slug}`);

  return { success: true };
}

/**
 * Updates the shortlist category (DREAM, TARGET, SAFE) of a saved college.
 */
export async function updateShortlistCategoryAction(collegeId: string, category: 'DREAM' | 'TARGET' | 'SAFE') {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    throw new Error('Unauthorized. Please log in.');
  }

  const collegeExists = await db.college.findUnique({ where: { id: collegeId } });
  if (!collegeExists) {
    throw new Error('College not found.');
  }

  const updatedBookmark = await db.savedCollege.update({
    where: {
      userId_collegeId: {
        userId,
        collegeId,
      },
    },
    data: {
      category: ShortlistCategory[category],
    },
  });

  // Revalidate cached views
  revalidatePath('/saved');
  revalidatePath('/colleges');
  revalidatePath(`/colleges/${collegeExists.slug}`);

  return updatedBookmark;
}
