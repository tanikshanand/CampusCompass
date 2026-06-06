import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collegesQuerySchema } from '@/schemas/api';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Helper to extract and normalize potentially repeating or comma-separated query parameters
    const getQueryArray = (key: string): string[] | undefined => {
      const vals = searchParams.getAll(key).flatMap(v => v.split(',')).map(v => v.trim()).filter(Boolean);
      return vals.length > 0 ? vals : undefined;
    };

    // Construct raw query object for Zod validation
    const rawQuery = {
      q: searchParams.get('q') || undefined,
      state: getQueryArray('state'),
      tuitionMin: searchParams.get('tuitionMin') || undefined,
      tuitionMax: searchParams.get('tuitionMax') || undefined,
      admissionRateMin: searchParams.get('admissionRateMin') || undefined,
      admissionRateMax: searchParams.get('admissionRateMax') || undefined,
      category: getQueryArray('category'),
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      sort: searchParams.get('sort') || undefined,
    };

    // Validate using Zod
    const result = collegesQuerySchema.safeParse(rawQuery);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const {
      q,
      state,
      tuitionMin,
      tuitionMax,
      admissionRateMin,
      admissionRateMax,
      category,
      page,
      limit,
      sort,
    } = result.data;

    // Build the dynamic Prisma filter object
    const where: Prisma.CollegeWhereInput = {};

    // 1. Text Search (Matches Name or Description)
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { city: { contains: q } },
      ];
    }

    // 2. State Filter
    if (state && state.length > 0) {
      where.state = { in: state };
    }

    // 3. Tuition Range Filter (Using Out-of-State as standard baseline)
    if (tuitionMin !== undefined || tuitionMax !== undefined) {
      where.tuitionOutState = {
        gte: tuitionMin ?? 0,
        lte: tuitionMax ?? 200000,
      };
    }

    // 4. Admission Rate Range Filter
    if (admissionRateMin !== undefined || admissionRateMax !== undefined) {
      where.admissionRate = {
        gte: admissionRateMin ?? 0.0,
        lte: admissionRateMax ?? 1.0,
      };
    }

    // 5. Course/Major Category Filter (Relation filter)
    if (category && category.length > 0) {
      where.courses = {
        some: {
          course: {
            category: {
              in: category,
            },
          },
        },
      };
    }

    // Determine Sort Order
    let orderBy: Prisma.CollegeOrderByWithRelationInput = { name: 'asc' };
    switch (sort) {
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'tuition_asc':
        orderBy = { tuitionOutState: 'asc' };
        break;
      case 'tuition_desc':
        orderBy = { tuitionOutState: 'desc' };
        break;
      case 'admission_asc':
        orderBy = { admissionRate: 'asc' };
        break;
      case 'admission_desc':
        orderBy = { admissionRate: 'desc' };
        break;
      case 'graduation_desc':
        orderBy = { graduationRate: 'desc' };
        break;
      case 'name_asc':
      default:
        orderBy = { name: 'asc' };
        break;
    }

    // Execute paginated queries in parallel for efficiency
    const skip = (page - 1) * limit;
    const [colleges, totalCount] = await Promise.all([
      db.college.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          courses: {
            select: {
              course: {
                select: {
                  code: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      db.college.count({ where }),
    ]);

    const formattedColleges = colleges.map(col => ({
      ...col,
      courses: col.courses.map(c => c.course),
    }));

    return NextResponse.json({
      data: formattedColleges,
      pagination: {
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('API Error in GET /api/colleges:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
