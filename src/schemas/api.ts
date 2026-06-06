import { z } from 'zod';

// Schema to parse and validate search & filtering query params
export const collegesQuerySchema = z.object({
  q: z.string().optional(),
  state: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',') : val),
    z.array(z.string()).optional()
  ),
  tuitionMin: z.coerce.number().int().nonnegative().optional(),
  tuitionMax: z.coerce.number().int().nonnegative().optional(),
  admissionRateMin: z.coerce.number().min(0).max(1).optional(),
  admissionRateMax: z.coerce.number().min(0).max(1).optional(),
  category: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',') : val),
    z.array(z.string()).optional()
  ),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  sort: z.enum([
    'name_asc', 
    'name_desc', 
    'tuition_asc', 
    'tuition_desc', 
    'admission_asc', 
    'admission_desc', 
    'graduation_desc'
  ]).default('name_asc'),
});

// Schema for creating/updating college reviews
export const reviewSchema = z.object({
  collegeId: z.string().cuid('Invalid College ID format'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  content: z.string().min(10, 'Review must be at least 10 characters long').max(2000, 'Review is too long (max 2000 characters)'),
});

// Schema for bookmarking/saving a college
export const saveCollegeSchema = z.object({
  collegeId: z.string().cuid('Invalid College ID format'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
});
