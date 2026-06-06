'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const prefSchema = z.object({
  preferredState: z
    .string()
    .length(2, 'State must be a 2-letter abbreviation (e.g. CA)')
    .toUpperCase()
    .optional()
    .nullable()
    .or(z.literal('')),
  preferredCourse: z.string().max(100).optional().nullable().or(z.literal('')),
  budgetMax: z.preprocess(
    (v) => (v === '' ? null : v),
    z.coerce.number().int().positive('Budget must be a positive number').optional().nullable()
  ),
  examType: z.enum(['SAT', 'ACT']).optional().nullable().or(z.literal('')),
  examScore: z.preprocess(
    (v) => (v === '' ? null : v),
    z.coerce.number().int().positive('Score must be a positive number').optional().nullable()
  ),
});

export type PreferenceFormState = {
  success?: boolean;
  message?: string;
  error?: string;
};

/**
 * Upserts the authenticated user's preferences.
 */
export async function savePreferenceAction(
  prevState: PreferenceFormState,
  formData: FormData
): Promise<PreferenceFormState> {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    return { error: 'Unauthorized. Please log in.' };
  }

  const preferredState = formData.get('preferredState') as string;
  const preferredCourse = formData.get('preferredCourse') as string;
  const budgetMaxRaw = formData.get('budgetMax') as string;
  const examType = formData.get('examType') as string;
  const examScoreRaw = formData.get('examScore') as string;

  // Validate fields
  const validation = prefSchema.safeParse({
    preferredState,
    preferredCourse,
    budgetMax: budgetMaxRaw,
    examType,
    examScore: examScoreRaw,
  });

  if (!validation.success) {
    const errorMsg = Object.values(validation.error.flatten().fieldErrors)
      .flat()
      .join(' ');
    return { error: errorMsg || 'Validation failed.' };
  }

  const data = validation.data;

  try {
    await db.userPreference.upsert({
      where: { userId },
      update: {
        preferredState: data.preferredState || null,
        preferredCourse: data.preferredCourse || null,
        budgetMax: data.budgetMax || null,
        examType: data.examType || null,
        examScore: data.examScore || null,
      },
      create: {
        userId,
        preferredState: data.preferredState || null,
        preferredCourse: data.preferredCourse || null,
        budgetMax: data.budgetMax || null,
        examType: data.examType || null,
        examScore: data.examScore || null,
      },
    });

    revalidatePath('/saved');
    revalidatePath('/predict');
    return { success: true, message: 'Preferences updated successfully!' };
  } catch (error) {
    console.error('Failed to save preferences:', error);
    return { error: 'Failed to update preferences. Please try again.' };
  }
}
