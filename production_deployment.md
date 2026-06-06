# Production Deployment Guide: PostgreSQL & SQLite Fallback

This guide provides instructions to deploy **CampusCompass** with PostgreSQL (production database) using Neon serverless PostgreSQL, while maintaining a local SQLite database for offline development.

---

## 1. Schema Configuration Overview

We support two schema files in the `prisma` directory:
1.  **`prisma/schema.prisma`**: The primary database schema, configured to use **PostgreSQL**. It uses native database enums and `@db.Text` annotations.
2.  **`prisma/schema.sqlite.prisma`**: The development fallback schema, configured for **SQLite**. It maps enums to `String` fields and uses standard `String` representations instead of Postgres-specific types.

### Primary PostgreSQL Schema (`prisma/schema.prisma`)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum ShortlistCategory {
  DREAM
  TARGET
  SAFE
}

model User {
  id            String         @id @default(cuid())
  name          String?
  email         String?        @unique
  emailVerified DateTime?
  image         String?
  password      String?        
  role          Role           @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  // Relations
  savedColleges SavedCollege[]
  reviews       Review[]
  searchHistory     SearchHistory[]
  comparisonHistory ComparisonHistory[]
  predictions       CollegePrediction[]
  preference        UserPreference?
}
```

---

## 2. Neon PostgreSQL Deployment Guide

### Step 1: Provision a Neon Serverless PostgreSQL Database
1.  Sign in to [Neon Console](https://console.neon.tech/).
2.  Click **Create a Project**.
3.  Name your project (e.g., `campus-compass`), select your database version (PostgreSQL 16 recommended), and pick a region close to your target deployment (e.g., AWS US East).
4.  Click **Create Project**.

### Step 2: Retrieve the Connection String
1.  In your project dashboard, navigate to the **Connection Details** section.
2.  Select **Prisma** from the dropdown menu (or copy the direct PostgreSQL string).
3.  Your connection string will look similar to this:
    ```
    postgresql://neondb_owner:npg_YOUR_PASSWORD@ep-cool-snowflake-a5t2zdb3.us-east-2.aws.neon.tech/neondb?sslmode=require
    ```

### Step 3: Configure `.env` for Production
Update the `.env` file in the root of your application with the Neon connection string:
```env
DATABASE_URL="postgresql://neondb_owner:npg_YOUR_PASSWORD@ep-cool-snowflake-a5t2zdb3.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="openssl-rand-base64-generated-key-here"
```

---

## 3. Database Migration & Setup Strategy

We have configured custom npm scripts in `package.json` to handle database operations cleanly for both targets.

### Case A: Deploying to Production (PostgreSQL / Neon)
1.  **Generate Prisma Client**:
    ```bash
    npm run db:generate:pg
    ```
2.  **Run Migrations**:
    Apply current migrations to your live database and initialize tables:
    ```bash
    npm run db:migrate:pg
    ```
3.  **Seed the Database**:
    Seed reference colleges, course mappings, user accounts, and activity logs:
    ```bash
    npm run db:seed
    ```

### Case B: Running Locally (SQLite Fallback)
1.  Ensure `.env` has:
    ```env
    DATABASE_URL="file:./dev.db"
    ```
2.  **Generate Prisma Client**:
    ```bash
    npm run db:generate:sqlite
    ```
3.  **Push Database Schema**:
    Deploy schema directly to your local database file without tracking schema files:
    ```bash
    npm run db:push:sqlite
    ```
4.  **Seed the Database**:
    ```bash
    npm run db:seed
    ```

---

## 4. Environment Variables Templates

### Production Environment (`.env.production` / Vercel Settings)
```env
# Database
DATABASE_URL="postgresql://neondb_owner:[PASSWORD]@[HOST]/neondb?sslmode=require"

# NextAuth Settings
NEXTAUTH_URL="https://campus-compass.vercel.app"
NEXTAUTH_SECRET="32_BYTE_BASE64_KEY_HERE"
```

### Local Development Environment (`.env`)
```env
# Database (SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth Settings
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="super-secret-local-auth-key-change-in-production-12345"
```

---

## 5. Verification Checklist

Ensure that the application is fully validated prior to submission:
- [x] **Schema Verification**: Validate that the schema contains no errors:
  ```bash
  npx prisma validate --schema=prisma/schema.prisma
  ```
- [x] **Seeding Validation**: Seed script is fully functional and populates tables without record conflicts:
  ```bash
  npm run db:seed
  ```
- [x] **Type Safety Check**: Confirm typescript compiles cleanly:
  ```bash
  npx tsc --noEmit
  ```
- [x] **Production Compilation**: Confirm that Next.js optimizes dynamic routes and builds static bundles successfully:
  ```bash
  npm run build
  ```
