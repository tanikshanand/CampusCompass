interface PreferenceInput {
  examType: string | null;
  examScore: number | null;
  budgetMax: number | null;
  preferredState: string | null;
  preferredCourse: string | null;
}

interface CollegeInput {
  slug: string;
  name: string;
  state: string;
  tuitionOutState: number;
  satReadingMin: number | null;
  satReadingMax: number | null;
  satMathMin: number | null;
  satMathMax: number | null;
  actCompositeMin: number | null;
  actCompositeMax: number | null;
  courses?: Array<{ name: string; category: string }>;
}

export interface PredictionResult {
  matchScore: number;
  category: 'DREAM' | 'TARGET' | 'SAFE';
  explanation: string;
}

/**
 * Calculates a match score (0-100) and provides a ranking explanation.
 * Weights:
 * - Academics (SAT/ACT Match): 40%
 * - Financials (Tuition budget): 30%
 * - Location (Preferred State): 15%
 * - Course (Preferred Course offered): 15%
 */
export function calculateMatchScore(
  college: CollegeInput,
  pref: PreferenceInput
): PredictionResult {
  let academicPoints = 25; // Default middle score if no data
  let academicExplanation = 'Academic profile matching is standard.';

  let financialPoints = 15;
  let financialExplanation = 'Tuition cost details.';

  let locationPoints = 5;
  let locationExplanation = 'Location matching.';

  let coursePoints = 3;
  let courseExplanation = 'Academic program matching.';

  // 1. Academic Calculation (40%)
  if (pref.examType && pref.examScore !== null) {
    if (pref.examType === 'SAT') {
      const minSat = (college.satReadingMin || 500) + (college.satMathMin || 500);
      const maxSat = (college.satReadingMax || 800) + (college.satMathMax || 800);
      const avgSat = Math.round((minSat + maxSat) / 2);

      if (pref.examScore >= maxSat) {
        academicPoints = 40;
        academicExplanation = `Your SAT score of ${pref.examScore} exceeds the typical 75th percentile (${maxSat}) at ${college.name}, making you a highly competitive applicant.`;
      } else if (pref.examScore <= minSat) {
        academicPoints = 10;
        academicExplanation = `Your SAT score of ${pref.examScore} falls below the typical 25th percentile (${minSat}) at ${college.name}. This is a reach school academically.`;
      } else {
        // Linear interpolation between 15 and 40 points
        const ratio = (pref.examScore - minSat) / (maxSat - minSat);
        academicPoints = Math.round(15 + ratio * 25);
        academicExplanation = `Your SAT score of ${pref.examScore} is competitive, placing you within the core 25th-75th percentile band (${minSat}-${maxSat}) of admitted students.`;
      }
    } else if (pref.examType === 'ACT') {
      const minAct = college.actCompositeMin || 20;
      const maxAct = college.actCompositeMax || 36;

      if (pref.examScore >= maxAct) {
        academicPoints = 40;
        academicExplanation = `Your ACT score of ${pref.examScore} exceeds the typical 75th percentile (${maxAct}) at ${college.name}, placing you in the strongest applicant tier.`;
      } else if (pref.examScore <= minAct) {
        academicPoints = 10;
        academicExplanation = `Your ACT score of ${pref.examScore} is below the typical 25th percentile (${minAct}) at ${college.name}, representing an academic stretch.`;
      } else {
        const ratio = (pref.examScore - minAct) / (maxAct - minAct);
        academicPoints = Math.round(15 + ratio * 25);
        academicExplanation = `Your ACT score of ${pref.examScore} is competitive, matching the median composite bands (${minAct}-${maxAct}) of admitted students.`;
      }
    }
  } else {
    academicExplanation = 'Add your SAT/ACT scores in preferences to calculate dynamic academic matching.';
  }

  // 2. Financial Calculation (30%)
  if (pref.budgetMax !== null) {
    if (college.tuitionOutState <= pref.budgetMax) {
      financialPoints = 30;
      financialExplanation = `Out-of-state tuition ($${college.tuitionOutState.toLocaleString()}) fits fully within your annual budget of $${pref.budgetMax.toLocaleString()}.`;
    } else {
      const excess = college.tuitionOutState - pref.budgetMax;
      if (excess > 15000) {
        financialPoints = 5;
        financialExplanation = `Out-of-state tuition ($${college.tuitionOutState.toLocaleString()}) exceeds your budget cap by $${excess.toLocaleString()}. Additional financial aid or scholarships will be required.`;
      } else {
        const ratio = excess / 15000;
        financialPoints = Math.round(30 - ratio * 25);
        financialExplanation = `Out-of-state tuition ($${college.tuitionOutState.toLocaleString()}) is slightly above your budget by $${excess.toLocaleString()}, which may require minor financial planning.`;
      }
    }
  } else {
    financialExplanation = 'Specify your annual budget limit to calculate cost feasibility matching.';
  }

  // 3. Location Calculation (15%)
  if (pref.preferredState) {
    if (college.state.toUpperCase() === pref.preferredState.toUpperCase()) {
      locationPoints = 15;
      locationExplanation = `${college.name} is located in ${college.state}, which matches your preferred state choice.`;
    } else {
      locationPoints = 5;
      locationExplanation = `Located in ${college.state} rather than your preferred state ${pref.preferredState}.`;
    }
  } else {
    locationExplanation = 'Define a preferred state to rank location suitability.';
  }

  // 4. Course Offered Calculation (15%)
  if (pref.preferredCourse && college.courses) {
    const hasCourseMatch = college.courses.some(
      (c) =>
        c.name.toLowerCase().includes(pref.preferredCourse!.toLowerCase()) ||
        c.category.toLowerCase().includes(pref.preferredCourse!.toLowerCase())
    );

    if (hasCourseMatch) {
      coursePoints = 15;
      courseExplanation = `Offers courses matching your preferred major category: "${pref.preferredCourse}".`;
    } else {
      coursePoints = 3;
      courseExplanation = `Does not explicitly offer programs listed under your preferred major "${pref.preferredCourse}".`;
    }
  } else {
    courseExplanation = 'Provide a preferred major to analyze academic program suitability.';
  }

  // Compute total
  const matchScore = academicPoints + financialPoints + locationPoints + coursePoints;

  // Determine Categorization
  let category: 'DREAM' | 'TARGET' | 'SAFE' = 'TARGET';
  if (matchScore >= 80) {
    category = 'SAFE';
  } else if (matchScore < 55) {
    category = 'DREAM';
  }

  // Build unified explanation string
  const explanation = `${academicExplanation} ${financialExplanation} ${locationExplanation} ${courseExplanation}`;

  return {
    matchScore,
    category,
    explanation,
  };
}
