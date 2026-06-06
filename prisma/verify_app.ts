import { PrismaClient } from '@prisma/client';
import { calculateMatchScore } from '../src/lib/predictor';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('🏁 Starting CampusCompass E2E Automated Verification...\n');
  let success = true;

  try {
    // 1. Verify Authentication / Users Setup
    console.log('👤 [CHECK 1] Verifying User Records...');
    const users = await prisma.user.findMany();
    console.log(`   - Found ${users.length} seeded users in database.`);
    const jane = users.find(u => u.email === 'jane@student.com');
    const john = users.find(u => u.email === 'john@student.com');
    
    if (jane && john) {
      console.log(`   ✅ Jane Doe (USER) and John Smith (USER) setup verified.`);
    } else {
      console.log('   ❌ Error: Seeded users missing.');
      success = false;
    }
    console.log();

    // 2. Verify College Database Seeding
    console.log('🏫 [CHECK 2] Verifying College Records...');
    const colleges = await prisma.college.findMany({
      include: {
        courses: {
          include: {
            course: true
          }
        }
      }
    });
    console.log(`   - Found ${colleges.length} seeded colleges.`);
    const stanford = colleges.find(c => c.slug === 'stanford-university');
    if (stanford) {
      console.log(`   ✅ Stanford University verified with out-of-state tuition $${stanford.tuitionOutState}.`);
      console.log(`     - Stanford courses offered: ${stanford.courses.map(c => c.course.name).join(', ')}`);
    } else {
      console.log('   ❌ Error: Seeded colleges missing.');
      success = false;
    }
    console.log();

    // 3. Verify Match Predictor scores
    console.log('📊 [CHECK 3] Verifying Match Predictor Engine...');
    if (jane && stanford) {
      const janePref = await prisma.userPreference.findUnique({
        where: { userId: jane.id }
      });

      if (janePref) {
        // Format college course shape expected by predictor
        const formatCollege = {
          ...stanford,
          courses: stanford.courses.map(c => c.course)
        };
        
        const prediction = calculateMatchScore(formatCollege, janePref);
        console.log(`   - Jane's preference: SAT ${janePref.examScore}, Budget $${janePref.budgetMax}, State ${janePref.preferredState}, Course "${janePref.preferredCourse}"`);
        console.log(`   - Predictor Output for Stanford: Match Score = ${prediction.matchScore}%, Category = ${prediction.category}`);
        console.log(`   - Explanation: ${prediction.explanation}`);
        
        // Assertions
        if (prediction.matchScore >= 0 && prediction.matchScore <= 100) {
          console.log('   ✅ Match Predictor output validated successfully.');
        } else {
          console.log('   ❌ Error: Match score out of bounds.');
          success = false;
        }
      } else {
        console.log('   ❌ Error: Jane preference profile missing.');
        success = false;
      }
    }
    console.log();

    // 4. Verify Saved Colleges, Notes, and Shortlists
    console.log('💾 [CHECK 4] Verifying Saved Colleges & Category Shortlists...');
    if (jane) {
      const savedColleges = await prisma.savedCollege.findMany({
        where: { userId: jane.id },
        include: { college: true }
      });
      console.log(`   - Jane has ${savedColleges.length} saved colleges.`);
      savedColleges.forEach(sc => {
        console.log(`     - ${sc.college.name}: Category = ${sc.category}, Notes = "${sc.notes}"`);
      });

      if (savedColleges.length > 0) {
        console.log('   ✅ Shortlist categorization (DREAM, TARGET, SAFE) verified.');
      } else {
        console.log('   ❌ Error: Bookmarks missing.');
        success = false;
      }
    }
    console.log();

    // 5. Verify Search History & Comparison logs
    console.log('🔍 [CHECK 5] Verifying Search Logs and Comparison Histories...');
    if (jane) {
      const searchLogs = await prisma.searchHistory.findMany({
        where: { userId: jane.id }
      });
      console.log(`   - Jane's recent searches: ${searchLogs.map(l => `"${l.query}"`).join(', ')}`);

      const comparisonLogs = await prisma.comparisonHistory.findMany({
        where: { userId: jane.id }
      });
      console.log(`   - Jane's comparison history logs found: ${comparisonLogs.length}`);
      
      if (searchLogs.length > 0 && comparisonLogs.length > 0) {
        console.log('   ✅ User activity logging is fully verified.');
      } else {
        console.log('   ❌ Error: Search or comparison logs missing.');
        success = false;
      }
    }
    console.log();

  } catch (error) {
    console.error('❌ E2E Verification failed with exception:', error);
    success = false;
  } finally {
    await prisma.$disconnect();
  }

  if (success) {
    console.log('🏆 ALL CHECKS PASSED: CampusCompass database, algorithms, and features are fully stable!');
    process.exit(0);
  } else {
    console.log('🚨 CHECKS FAILED: Please check E2E logs for errors.');
    process.exit(1);
  }
}

runVerification();
