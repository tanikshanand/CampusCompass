# CampusCompass – Smart College Discovery & Decision Platform

CampusCompass is a premium full-stack web application designed to help students discover, compare, and shortlist universities while calculating their admission matches. It is built using the Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Prisma ORM, and supports both PostgreSQL (primary/production) and SQLite (local-development fallback).

---

## 🚀 Tech Stack

*   **Framework**: Next.js 15 (App Router)
*   **Library**: React 19 (Server Components, Client Components, Server Actions)
*   **Language**: TypeScript
*   **Database ORM**: Prisma ORM v5
*   **Databases**:
    *   **PostgreSQL**: Production database (optimized for serverless Neon PostgreSQL)
    *   **SQLite**: Development fallback database (zero-configuration local file)
*   **Authentication**: NextAuth.js v5 (Beta)
*   **Styling**: Tailwind CSS
*   **Data Visualization**: Recharts (fully responsive charts)

---

## ✨ Features

1.  **Search & Catalog**: Full-text search and advanced filters for tuition fees, selectivity rates, and major categories.
2.  **Admissions Match Predictor**: A custom-weighted algorithm that scores a student's matching probability based on SAT/ACT scores, tuition budgets, preferred locations, and majors.
3.  **Side-by-Side College Comparison**: Compare up to 4 universities side-by-side with highlight states identifying the best value metrics.
4.  **Student Hub Dashboard**: Displays dynamic KPIs (shortlisted count, search logs, comparison count) and visualizes college tuition fees against the student's budget cap.
5.  **Smart Shortlists**: Organize bookmarked colleges into Dream, Target, and Safe boards with real-time categorizations and notes.
6.  **User Activity Logging**: Records search keywords and comparison logs to build personalized recommendation profiles.

---

## 🛠️ Setup Instructions

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Configurations
Create a `.env` file in the root of the project (copying `.env.example` as a template):
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="some-secure-nextauth-secret-key"

# SQLite local development database url
DATABASE_URL="file:./dev.db"
```

### 3. Generate Client and Database Seeding (SQLite Local Fallback)
```bash
# Generate Prisma Client for SQLite
npm run db:generate:sqlite

# Push the schema and create tables in dev.db
npm run db:push:sqlite

# Seed the database
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the platform. You can log in using the pre-seeded account:
*   **Email**: `jane@student.com`
*   **Password**: `password123`

---

## 🌐 Production PostgreSQL & Neon Deployment

To deploy the application with a PostgreSQL database (e.g., Neon serverless PostgreSQL):

1.  Update your connection string in `.env`:
    ```env
    DATABASE_URL="postgresql://neondb_owner:password@ep-cool-snowflake-a5t2zdb3.us-east-2.aws.neon.tech/campuscompass?sslmode=require"
    ```
2.  Generate the Prisma Client for PostgreSQL:
    ```bash
    npm run db:generate:pg
    ```
3.  Run migrations to build the tables:
    ```bash
    npm run db:migrate:pg
    ```
4.  Seed the production database:
    ```bash
    npm run db:seed
    ```
5.  Build and compile the Next.js bundle:
    ```bash
    npm run build
    ```

---

## 📁 System Architecture & Diagrams

Details regarding the software design and data flows are documented in:
*   [FINAL_ARCHITECTURE.md](file:///c:/Users/anand/OneDrive/Documents/intern%201/FINAL_ARCHITECTURE.md)
*   [FINAL_DATABASE_ERD.md](file:///c:/Users/anand/OneDrive/Documents/intern%201/FINAL_DATABASE_ERD.md)
*   [FINAL_API_REFERENCE.md](file:///c:/Users/anand/OneDrive/Documents/intern%201/FINAL_API_REFERENCE.md)
*   [FINAL_INTERVIEW_GUIDE.md](file:///c:/Users/anand/OneDrive/Documents/intern%201/FINAL_INTERVIEW_GUIDE.md)
*   [FINAL_PROJECT_REPORT.md](file:///c:/Users/anand/OneDrive/Documents/intern%201/FINAL_PROJECT_REPORT.md)
