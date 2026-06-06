# CampusCompass – Database Entity Relationship Diagram (ERD)

This document contains the complete database entity-relationship diagram and detailed model specification for the CampusCompass platform.

---

## 1. Entity-Relationship Diagram (ERD)

The diagram below details the 13 tables, their attributes, keys, and relational cardinatlites.

```mermaid
erDiagram
    User {
        String id PK
        String name
        String email UK
        DateTime emailVerified
        String image
        String password
        Role role
        DateTime createdAt
        DateTime updatedAt
    }
    
    Account {
        String id PK
        String userId FK
        String type
        String provider
        String providerAccountId
        String refresh_token
        String access_token
        Int expires_at
        String token_type
        String scope
        String id_token
        String session_state
    }
    
    Session {
        String id PK
        String sessionToken UK
        String userId FK
        DateTime expires
    }
    
    VerificationToken {
        String identifier
        String token UK
        DateTime expires
    }
    
    College {
        String id PK
        String slug UK
        String name
        String description
        String city
        String state
        String country
        Int tuitionInState
        Int tuitionOutState
        Float admissionRate
        Float graduationRate
        String imageUrl
        String logoUrl
        String websiteUrl
        Int satReadingMin
        Int satReadingMax
        Int satMathMin
        Int satMathMax
        Int actCompositeMin
        Int actCompositeMax
        Int medianSalary
        DateTime createdAt
        DateTime updatedAt
    }
    
    Course {
        String id PK
        String code UK
        String name UK
        String category
        DateTime createdAt
        DateTime updatedAt
    }
    
    CollegeCourse {
        String collegeId PK, FK
        String courseId PK, FK
    }
    
    Review {
        String id PK
        String userId FK
        String collegeId FK
        Int rating
        String content
        DateTime createdAt
        DateTime updatedAt
    }
    
    SavedCollege {
        String id PK
        String userId FK
        String collegeId FK
        String notes
        ShortlistCategory category
        DateTime createdAt
    }
    
    SearchHistory {
        String id PK
        String userId FK
        String query
        String filters
        DateTime createdAt
    }
    
    ComparisonHistory {
        String id PK
        String userId FK
        DateTime createdAt
    }

    ComparisonCollege {
        String comparisonId PK, FK
        String collegeId PK, FK
    }
    
    UserPreference {
        String id PK
        String userId UK, FK
        String preferredState
        String preferredCourse
        Int budgetMax
        String examType
        Int examScore
        DateTime createdAt
        DateTime updatedAt
    }
    
    CollegePrediction {
        String id PK
        String userId FK
        String collegeId FK
        Int matchScore
        String explanation
        DateTime createdAt
    }

    User ||--o{ Account : "has accounts"
    User ||--o{ Session : "has sessions"
    User ||--o{ SavedCollege : "bookmarks"
    User ||--o{ Review : "writes"
    User ||--o{ SearchHistory : "logs searches"
    User ||--o{ ComparisonHistory : "logs comparisons"
    User ||--o| UserPreference : "defines preferences"
    User ||--o{ CollegePrediction : "obtains predictions"
    
    College ||--o{ SavedCollege : "bookmarked by"
    College ||--o{ Review : "reviewed by"
    College ||--o{ CollegeCourse : "offers"
    Course ||--o{ CollegeCourse : "taught at"
    College ||--o{ CollegePrediction : "predicted for"

    ComparisonHistory ||--o{ ComparisonCollege : "includes"
    College ||--o{ ComparisonCollege : "added to"
```

---

## 2. Table Specifications

### 2.1 User
*   **Role**: Stores student/admin profile details.
*   **Attributes**:
    *   `id` (String, Primary Key): Unique identifier (CUID format).
    *   `email` (String, Unique Key): Login credential.
    *   `password` (String, Optional): Encrypted password for Credentials Provider.
    *   `role` (Enum: `USER`, `ADMIN`): System authorization level.

### 2.2 SavedCollege
*   **Role**: Junction table representing bookmarks.
*   **Attributes**:
    *   `id` (String, Primary Key): Unique identifier.
    *   `userId` (String, Foreign Key -> User.id): Owning student.
    *   `collegeId` (String, Foreign Key -> College.id): Bookmarked college.
    *   `category` (Enum: `DREAM`, `TARGET`, `SAFE`): Shortlist segment.
    *   `notes` (String, Optional): Custom student checklist.
*   **Unique Index**: `[userId, collegeId]` (a user can save a college only once).

### 2.3 UserPreference
*   **Role**: Stores student criteria for match predictor algorithms.
*   **Attributes**:
    *   `userId` (String, Unique Key, Foreign Key -> User.id): Owning student (1-to-1).
    *   `preferredState` (String, Optional): 2-letter state code.
    *   `preferredCourse` (String, Optional): Category name (e.g. "Computer Science").
    *   `budgetMax` (Int, Optional): Annual budget ceiling.
    *   `examType` (String, Optional): "SAT" or "ACT".
    *   `examScore` (Int, Optional): Standardized exam score.

### 2.4 ComparisonHistory & ComparisonCollege
*   **Role**: Tracks historical comparison queries to populate dashboard.
*   **ComparisonCollege (Junction Table)**:
    *   `comparisonId` (String, PK, FK -> ComparisonHistory.id): Parent log.
    *   `collegeId` (String, PK, FK -> College.id): Referenced college.

---

## 3. Indexing & Optimization Strategy

To maintain sub-5ms query times under high loads, indexing is configured on all foreign keys and commonly filtered columns:
1.  **SavedCollege**: Unique composite index on `[userId, collegeId]` prevents duplicate bookmarks.
2.  **College**: Indexes on `state`, `tuitionOutState`, and `admissionRate` optimize catalog filters.
3.  **SearchHistory**: Index on `userId` speeds up search history displays on the dashboard.
4.  **CollegeCourse**: Composite index `[collegeId, courseId]` speeds up major filtering.
