import { PrismaClient } from '@prisma/client';

const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

const ShortlistCategory = {
  DREAM: 'DREAM',
  TARGET: 'TARGET',
  SAFE: 'SAFE',
} as const;

const prisma = new PrismaClient();

// Hardcoded bcrypt hash for "password123"
const DEFAULT_PASSWORD_HASH = '$2b$12$L7R2Q5n4VfS9V1o1u1u1ue2L8HkZ4lC6BwLhZg5B3Dq/9UfH1yD72';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean up database in reverse dependency order
  console.log('🗑️ Cleaning existing database records...');
  await prisma.collegePrediction.deleteMany({});
  await prisma.userPreference.deleteMany({});
  await prisma.searchHistory.deleteMany({});
  await prisma.comparisonCollege.deleteMany({});
  await prisma.comparisonHistory.deleteMany({});
  await prisma.collegeCourse.deleteMany({});
  await prisma.savedCollege.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.college.deleteMany({});
  await prisma.course.deleteMany({});

  // 2. Create Users
  console.log('👤 Creating users...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Alex Admin',
      email: 'admin@collegeplatform.com',
      password: DEFAULT_PASSWORD_HASH,
      role: Role.ADMIN,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@student.com',
      password: DEFAULT_PASSWORD_HASH,
      role: Role.USER,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'john@student.com',
      password: DEFAULT_PASSWORD_HASH,
      role: Role.USER,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    },
  });

  console.log(`✅ Users created: ${adminUser.email}, ${student1.email}, ${student2.email}`);

  // 3. Seed User Preferences
  console.log('⚙️ Seeding user preference profiles...');
  await prisma.userPreference.create({
    data: {
      userId: student1.id,
      preferredState: 'CA',
      preferredCourse: 'Computer Science',
      budgetMax: 60000,
      examType: 'SAT',
      examScore: 1520,
    },
  });

  await prisma.userPreference.create({
    data: {
      userId: student2.id,
      preferredState: 'TX',
      preferredCourse: 'Business Administration',
      budgetMax: 45000,
      examType: 'ACT',
      examScore: 31,
    },
  });

  // 4. Create Courses
  console.log('📚 Creating courses/majors...');
  const coursesData = [
    { code: 'CS-101', name: 'Computer Science', category: 'Computer Science' },
    { code: 'ME-201', name: 'Mechanical Engineering', category: 'Engineering' },
    { code: 'BUS-110', name: 'Business Administration', category: 'Business' },
    { code: 'BIO-150', name: 'Biology & Life Sciences', category: 'Sciences' },
    { code: 'PSY-101', name: 'Psychology', category: 'Social Sciences' },
    { code: 'NUR-301', name: 'Nursing & Healthcare', category: 'Health' },
    { code: 'FIN-310', name: 'Finance & Economics', category: 'Business' },
    { code: 'ENG-250', name: 'English Literature', category: 'Humanities' },
  ];

  const courses: Record<string, any> = {};
  for (const c of coursesData) {
    courses[c.code] = await prisma.course.create({ data: c });
  }
  console.log(`✅ ${Object.keys(courses).length} courses created.`);

  // 5. Create Colleges with SAT/ACT scores and median earnings
  console.log('🏫 Creating colleges with score bands...');
  const collegesData = [
    {
      slug: 'stanford-university',
      name: 'Stanford University',
      description: 'Stanford University is a private research university in Stanford, California. It is known for its academic strength, wealth, close proximity to Silicon Valley, and ranking as one of the world\'s top universities.',
      city: 'Stanford',
      state: 'CA',
      country: 'USA',
      tuitionInState: 57693,
      tuitionOutState: 57693,
      admissionRate: 0.04,
      graduationRate: 0.94,
      imageUrl: 'https://images.unsplash.com/photo-1581078426770-6d336e5de7bf?auto=format&fit=crop&q=80&w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=120',
      websiteUrl: 'https://www.stanford.edu',
      satReadingMin: 680,
      satReadingMax: 760,
      satMathMin: 720,
      satMathMax: 800,
      actCompositeMin: 32,
      actCompositeMax: 35,
      medianSalary: 94300,
    },
    {
      slug: 'harvard-university',
      name: 'Harvard University',
      description: 'Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636, Harvard is the oldest institution of higher learning in the United States and among the most prestigious in the world.',
      city: 'Cambridge',
      state: 'MA',
      country: 'USA',
      tuitionInState: 55587,
      tuitionOutState: 55587,
      admissionRate: 0.05,
      graduationRate: 0.96,
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=120',
      websiteUrl: 'https://www.harvard.edu',
      satReadingMin: 710,
      satReadingMax: 770,
      satMathMin: 730,
      satMathMax: 800,
      actCompositeMin: 33,
      actCompositeMax: 35,
      medianSalary: 91200,
    },
    {
      slug: 'massachusetts-institute-of-technology',
      name: 'Massachusetts Institute of Technology (MIT)',
      description: 'MIT is a private land-grant research university in Cambridge, Massachusetts. Established in 1861, MIT has since played a key role in the development of modern technology and science, ranking among the world\'s top academic institutions.',
      city: 'Cambridge',
      state: 'MA',
      country: 'USA',
      tuitionInState: 55878,
      tuitionOutState: 55878,
      admissionRate: 0.04,
      graduationRate: 0.95,
      imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&q=80&w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1568790308569-b557022068aa?auto=format&fit=crop&q=80&w=120',
      websiteUrl: 'https://www.mit.edu',
      satReadingMin: 730,
      satReadingMax: 780,
      satMathMin: 790,
      satMathMax: 800,
      actCompositeMin: 34,
      actCompositeMax: 36,
      medianSalary: 104500,
    },
    {
      slug: 'university-of-california-berkeley',
      name: 'University of California, Berkeley',
      description: 'UC Berkeley is a public land-grant research university in Berkeley, California. Founded in 1868 as the state\'s first land-grant university, it is the founding campus of the University of California system and is highly ranked globally.',
      city: 'Berkeley',
      state: 'CA',
      country: 'USA',
      tuitionInState: 14226,
      tuitionOutState: 44007,
      admissionRate: 0.14,
      graduationRate: 0.92,
      imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=120',
      websiteUrl: 'https://www.berkeley.edu',
      satReadingMin: 640,
      satReadingMax: 730,
      satMathMin: 660,
      satMathMax: 770,
      actCompositeMin: 28,
      actCompositeMax: 34,
      medianSalary: 83700,
    },
    {
      slug: 'university-of-michigan',
      name: 'University of Michigan',
      description: 'The University of Michigan is a public research university in Ann Arbor, Michigan. Founded in 1817 in Detroit, the university was moved to Ann Arbor in 1837. It is one of the premier public universities in the United States.',
      city: 'Ann Arbor',
      state: 'MI',
      country: 'USA',
      tuitionInState: 15948,
      tuitionOutState: 52266,
      admissionRate: 0.20,
      graduationRate: 0.90,
      imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=120',
      websiteUrl: 'https://umich.edu',
      satReadingMin: 650,
      satReadingMax: 730,
      satMathMin: 670,
      satMathMax: 780,
      actCompositeMin: 29,
      actCompositeMax: 34,
      medianSalary: 72100,
    },
    {
      slug: 'university-of-texas-at-austin',
      name: 'University of Texas at Austin',
      description: 'UT Austin is a public research university in Austin, Texas. Founded in 1883, the University of Texas is a member of the Association of American Universities and is recognized as a Public Ivy, offering world-class programs.',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      tuitionInState: 11752,
      tuitionOutState: 40996,
      admissionRate: 0.29,
      graduationRate: 0.88,
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200',
      logoUrl: 'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&q=80&w=120',
      websiteUrl: 'https://www.utexas.edu',
      satReadingMin: 620,
      satReadingMax: 720,
      satMathMin: 630,
      satMathMax: 760,
      actCompositeMin: 27,
      actCompositeMax: 33,
      medianSalary: 69800,
    },
  ];

  const colleges: Record<string, any> = {};
  for (const col of collegesData) {
    colleges[col.slug] = await prisma.college.create({ data: col });
  }
  console.log(`✅ ${Object.keys(colleges).length} colleges created.`);

  // 6. Connect Colleges and Courses (Many-to-Many via CollegeCourse join model)
  console.log('🔗 Connecting colleges to courses...');
  const collegeCourseRelations = [
    // Stanford
    { collegeSlug: 'stanford-university', courseCode: 'CS-101' },
    { collegeSlug: 'stanford-university', courseCode: 'BIO-150' },
    { collegeSlug: 'stanford-university', courseCode: 'PSY-101' },
    { collegeSlug: 'stanford-university', courseCode: 'BUS-110' },
    
    // Harvard
    { collegeSlug: 'harvard-university', courseCode: 'BUS-110' },
    { collegeSlug: 'harvard-university', courseCode: 'FIN-310' },
    { collegeSlug: 'harvard-university', courseCode: 'BIO-150' },
    { collegeSlug: 'harvard-university', courseCode: 'ENG-250' },

    // MIT
    { collegeSlug: 'massachusetts-institute-of-technology', courseCode: 'CS-101' },
    { collegeSlug: 'massachusetts-institute-of-technology', courseCode: 'ME-201' },
    
    // UC Berkeley
    { collegeSlug: 'university-of-california-berkeley', courseCode: 'CS-101' },
    { collegeSlug: 'university-of-california-berkeley', courseCode: 'ME-201' },
    { collegeSlug: 'university-of-california-berkeley', courseCode: 'BIO-150' },
    { collegeSlug: 'university-of-california-berkeley', courseCode: 'FIN-310' },

    // Michigan
    { collegeSlug: 'university-of-michigan', courseCode: 'BUS-110' },
    { collegeSlug: 'university-of-michigan', courseCode: 'PSY-101' },
    { collegeSlug: 'university-of-michigan', courseCode: 'NUR-301' },
    { collegeSlug: 'university-of-michigan', courseCode: 'ME-201' },

    // UT Austin
    { collegeSlug: 'university-of-texas-at-austin', courseCode: 'BUS-110' },
    { collegeSlug: 'university-of-texas-at-austin', courseCode: 'CS-101' },
    { collegeSlug: 'university-of-texas-at-austin', courseCode: 'BIO-150' },
    { collegeSlug: 'university-of-texas-at-austin', courseCode: 'FIN-310' },
  ];

  for (const rel of collegeCourseRelations) {
    await prisma.collegeCourse.create({
      data: {
        collegeId: colleges[rel.collegeSlug].id,
        courseId: courses[rel.courseCode].id,
      },
    });
  }
  console.log('✅ College-Course associations created.');

  // 7. Create Reviews
  console.log('✍️ Creating reviews...');
  await prisma.review.create({
    data: {
      userId: student1.id,
      collegeId: colleges['stanford-university'].id,
      rating: 5,
      content: 'Incredible campus, top-tier research, and extremely close connections with startups in Silicon Valley. Highly recommend the Computer Science program!',
    },
  });

  await prisma.review.create({
    data: {
      userId: student2.id,
      collegeId: colleges['stanford-university'].id,
      rating: 4,
      content: 'The weather is great, resources are unmatched, but the pressure and workload can get intense. Take advantage of office hours and mental health support.',
    },
  });

  await prisma.review.create({
    data: {
      userId: student1.id,
      collegeId: colleges['harvard-university'].id,
      rating: 5,
      content: 'Brimming with history, world-class professors, and an outstanding alumni network. It can feel traditional, but the opportunities are unparalleled.',
    },
  });

  await prisma.review.create({
    data: {
      userId: student2.id,
      collegeId: colleges['university-of-california-berkeley'].id,
      rating: 4,
      content: 'Extremely competitive and academically rigorous. The campus is beautiful and very politically active. Classes can be large, but the professors are superstars.',
    },
  });

  console.log('✅ Reviews created.');

  // 8. Create Saved Colleges with Shortlist Categories
  console.log('💾 Seeding bookmarks (SavedColleges)...');
  await prisma.savedCollege.create({
    data: {
      userId: student1.id,
      collegeId: colleges['stanford-university'].id,
      notes: 'Planning to apply Early Action. Need to complete essays and submit SAT scores by November.',
      category: ShortlistCategory.DREAM,
    },
  });

  await prisma.savedCollege.create({
    data: {
      userId: student1.id,
      collegeId: colleges['massachusetts-institute-of-technology'].id,
      notes: 'Reach school. CS program is legendary. Check application deadline and references.',
      category: ShortlistCategory.TARGET,
    },
  });

  await prisma.savedCollege.create({
    data: {
      userId: student1.id,
      collegeId: colleges['university-of-california-berkeley'].id,
      notes: 'Top in-state target choice. Affordable option with a very strong CS reputation.',
      category: ShortlistCategory.SAFE,
    },
  });

  await prisma.savedCollege.create({
    data: {
      userId: student2.id,
      collegeId: colleges['university-of-california-berkeley'].id,
      notes: 'Top out-of-state choice. CS reputation is stellar.',
      category: ShortlistCategory.DREAM,
    },
  });

  await prisma.savedCollege.create({
    data: {
      userId: student2.id,
      collegeId: colleges['university-of-texas-at-austin'].id,
      notes: 'Good fallback choice. Great city and strong business school.',
      category: ShortlistCategory.SAFE,
    },
  });

  console.log('✅ SavedColleges seeded.');

  // 9. Seed Search History
  console.log('🔍 Seeding user search logs...');
  await prisma.searchHistory.create({
    data: {
      userId: student1.id,
      query: 'Stanford Computer Science',
      filters: JSON.stringify({ state: ['CA'], category: ['Computer Science'] }),
    },
  });

  await prisma.searchHistory.create({
    data: {
      userId: student1.id,
      query: 'MIT Engineering',
      filters: JSON.stringify({ category: ['Engineering'] }),
    },
  });

  await prisma.searchHistory.create({
    data: {
      userId: student2.id,
      query: 'Texas Business',
      filters: JSON.stringify({ state: ['TX'] }),
    },
  });

  // 10. Seed Comparison History
  console.log('📊 Seeding comparison histories...');
  await prisma.comparisonHistory.create({
    data: {
      userId: student1.id,
      colleges: {
        create: [
          { collegeId: colleges['stanford-university'].id },
          { collegeId: colleges['massachusetts-institute-of-technology'].id },
          { collegeId: colleges['university-of-california-berkeley'].id },
        ],
      },
    },
  });

  await prisma.comparisonHistory.create({
    data: {
      userId: student2.id,
      colleges: {
        create: [
          { collegeId: colleges['university-of-texas-at-austin'].id },
          { collegeId: colleges['university-of-michigan'].id },
        ],
      },
    },
  });

  console.log('🎉 Database seeding successfully completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
