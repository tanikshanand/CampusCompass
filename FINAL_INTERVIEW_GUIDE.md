# CampusCompass – Interview Guide & Production Pitch

This guide acts as a cheat sheet for technical code reviews and engineering interviews. It details the system mechanics, design tradeoffs, and a video walkthrough structure.

---

## 1. Feature Traceability Matrix

This matrix maps high-value application features to their implementation files, database relations, and E2E verification files.

| Feature Area | Routing & Implementation Files | Database Models | E2E Verification Tests |
| :--- | :--- | :--- | :--- |
| **Authentication** | `src/auth.ts`, `src/middleware.ts`, `src/app/(auth)/login`, `register` | `User`, `Account`, `Session` | `prisma/verify_app.ts` (Check 1) |
| **College Catalog** | `/colleges`, `/colleges/[slug]` | `College`, `Course`, `CollegeCourse` | `prisma/verify_app.ts` (Check 2) |
| **Activity Tracking** | `/colleges` (search history logging), `/compare` | `SearchHistory`, `ComparisonHistory`, `ComparisonCollege` | `prisma/verify_app.ts` (Check 5) |
| **Shortlist Board** | `/saved`, `src/app/actions/saved.ts` | `SavedCollege` (`ShortlistCategory`) | `prisma/verify_app.ts` (Check 4) |
| **Predictor Engine** | `/predict`, `src/lib/predictor.ts` | `UserPreference`, `CollegePrediction` | `prisma/verify_app.ts` (Check 3) |
| **KPI & Charting** | `/saved`, `/components/dashboard/DashboardCharts` | `SavedCollege`, `UserPreference` | Compilation build traces |

---

## 2. Production Performance & Security Enhancements

Key engineering highlights to talk about during interviews:
1.  **Database Indexing**: Explicit compound index on `SavedCollege(userId, collegeId)` prevents duplicate bookmarks at the DB engine level. Indexes on `College(state, tuitionOutState, admissionRate)` keep search filter queries fast.
2.  **Next.js Cache Revalidation**: Rather than querying databases on every click, pages use React Server Components. When mutations occur (e.g. moving a college to another shortlist category), Server Actions use `revalidatePath` to surgically revalidate only the changed data routes.
3.  **Hydration Match Protection**: React 19 and Next.js can trigger hydration errors when rendering SVGs (like Recharts grids) on the server that differ from the client. We implement a mounting guard (`isMounted` state) to defer Recharts rendering until client-side hydration completes.
4.  **Database Portability**: The schema structures enums and relationships to ensure zero-modification compatibility between SQLite (local dev) and PostgreSQL (production).

---

## 3. Loom Walkthrough Script (5-Minute Presentation)

### Segment 1: Introduction & High-Level Architecture (0:00 - 1:00)
> *"Hello! Today I am presenting CampusCompass, a smart college discovery and decision platform built with Next.js 15, React 19, TypeScript, and Prisma.*
> *This app is built to solve a key student pain point: managing the college admission search. The system uses a custom-weighted algorithm to calculate a student's matching score based on their SAT/ACT test scores, tuition budget, location, and preferred major.*
> *Let's log in using our seeded test student account."*

### Segment 2: Authentication & Search Catalog (1:00 - 2:00)
> *(Navigate to `/colleges` and interact with filters)*
> *"We protect routes using NextAuth. Here in the catalog, students can search and filter by tuition ranges, selectivity, and majors. Notice that search filters are responsive and run server-side queries.*
> *Each search term and applied filter is automatically logged to the database search history table, allowing the system to customize student dashboard recommendations.*
> *Let's bookmark a few colleges, and select Stanford and MIT for comparison."*

### Segment 3: Compare & Highlight Value (2:00 - 3:00)
> *(Navigate to `/compare`)*
> *"Our side-by-side comparison page pulls detailed college statistics. The system dynamically highlights 'Best Values' — such as the lowest tuition costs, highest graduation rates, or highest post-graduation earnings. This comparison tool uses joint tables to retrieve data, ensuring high performance."*

### Segment 4: Student Hub Dashboard & Shortlists (3:00 - 4:15)
> *(Navigate to `/saved`)*
> *"Welcome to the Student Hub. The dashboard compiles KPIs for total bookmarked colleges, logged searches, and comparison counts. We use Recharts to display an interactive tuition comparison chart, comparing college out-of-state tuition fees against the student's personal budget cap (indicated by the pink target threshold line).*
> *Our saved colleges are grouped into Dream, Target, and Safe categories. Using Next.js Server Actions, when a student changes a category via the dropdown, the data is updated and the layout reorganizes instantly without a full-page reload."*

### Segment 5: Match Predictor & Conclusion (4:15 - 5:00)
> *(Navigate to `/predict`)*
> *"Our Match Predictor lets students define their academic criteria. If we input an SAT score of 1520, a budget of $60,000, and CA as our preferred state, the weighted predictor calculates matching likelihoods.*
> *For Stanford, we get a 94% match. The dashboard details exactly why: comparing our scores against Stanford's 25th-75th percentile bands, verifying the tuition budget fit, and checking if the college offers our preferred major category.*
> *This completes the overview. The project compiles with clean TypeScript and supports both SQLite and PostgreSQL. Thank you!"*
