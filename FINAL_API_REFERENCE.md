# CampusCompass – API Reference Manual

This manual documents the RESTful JSON endpoints exposed by the CampusCompass platform under the `/api` prefix.

---

## 1. Get Colleges Catalog (`GET /api/colleges`)

Retrieves a filtered, paginated list of colleges matching search query terms and sorting keys.

*   **URL**: `/api/colleges`
*   **Method**: `GET`
*   **Auth Required**: No
*   **Query Parameters**:
    *   `q` (string, optional): Text keyword matching college name, city, state, or description.
    *   `state` (string, optional): Comma-separated list of 2-letter state codes (e.g. `CA,MA`).
    *   `tuitionMin` (number, optional): Minimum out-of-state tuition fee cap.
    *   `tuitionMax` (number, optional): Maximum out-of-state tuition fee cap.
    *   `admissionRateMin` (float, optional): Range `0.0` to `1.0`.
    *   `admissionRateMax` (float, optional): Range `0.0` to `1.0`.
    *   `category` (string, optional): Comma-separated course categories (e.g. `Computer Science`).
    *   `page` (number, optional, default: `1`): Page index.
    *   `limit` (number, optional, default: `6`): Items per page.
    *   `sort` (string, optional, options: `name_asc`, `name_desc`, `tuition_asc`, `tuition_desc`, `admission_asc`, `admission_desc`, `graduation_desc`).

### Sample Response (`200 OK`)
```json
{
  "data": [
    {
      "id": "clz89d12a0001bc34def5678",
      "slug": "stanford-university",
      "name": "Stanford University",
      "city": "Stanford",
      "state": "CA",
      "tuitionOutState": 57693,
      "admissionRate": 0.04,
      "graduationRate": 0.94,
      "logoUrl": "https://...",
      "imageUrl": "https://...",
      "courses": [
        { "code": "CS-101", "name": "Introduction to Computer Science", "category": "Computer Science" }
      ],
      "_count": { "reviews": 2 }
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "pages": 2,
    "limit": 6
  }
}
```

---

## 2. Compare Colleges (`GET /api/colleges/compare`)

Fetches detailed statistical fields for up to 4 colleges to display in comparative dashboards.

*   **URL**: `/api/colleges/compare`
*   **Method**: `GET`
*   **Auth Required**: No
*   **Query Parameters**:
    *   `ids` (string, required): Comma-separated list of College IDs or Slugs.

### Sample Response (`200 OK`)
```json
{
  "colleges": [
    {
      "id": "clz89d12a0001bc34def5678",
      "name": "Stanford University",
      "slug": "stanford-university",
      "city": "Stanford",
      "state": "CA",
      "tuitionInState": 57693,
      "tuitionOutState": 57693,
      "admissionRate": 0.04,
      "graduationRate": 0.94,
      "logoUrl": "https://...",
      "courses": [
        { "code": "CS-101", "name": "Computer Science", "category": "Computer Science" }
      ],
      "stats": {
        "totalReviews": 2,
        "averageRating": 4.5
      }
    }
  ]
}
```

---

## 3. Submit Review (`POST /api/reviews`)

Submits a new review rating and text review for a college.

*   **URL**: `/api/reviews`
*   **Method**: `POST`
*   **Auth Required**: Yes (NextAuth Session)
*   **Headers**: `Content-Type: application/json`
*   **Payload Request Body**:
    ```json
    {
      "collegeId": "clz89d12a0001bc34def5678",
      "rating": 5,
      "content": "Excellent course structure and professional placement options!"
    }
    ```

### Sample Response (`21 Created`)
```json
{
  "success": true,
  "review": {
    "id": "clz89d23a0002cd45efg6789",
    "userId": "clz89d01a0000ab12cde3456",
    "collegeId": "clz89d12a0001bc34def5678",
    "rating": 5,
    "content": "Excellent course structure and professional placement options!",
    "createdAt": "2026-06-06T12:00:00.000Z"
  }
}
```

---

## 4. Bookmark College (`POST /api/save-college`)

Saves a college to the user's checklist.

*   **URL**: `/api/save-college`
*   **Method**: `POST`
*   **Auth Required**: Yes (NextAuth Session)
*   **Headers**: `Content-Type: application/json`
*   **Payload Request Body**:
    ```json
    {
      "collegeId": "clz89d12a0001bc34def5678",
      "notes": "Planning early application essays by November."
    }
    ```

### Sample Response (`200 OK`)
```json
{
  "success": true,
  "bookmark": {
    "id": "clz89d34a0003ef56ghi7890",
    "userId": "clz89d01a0000ab12cde3456",
    "collegeId": "clz89d12a0001bc34def5678",
    "notes": "Planning early application essays by November.",
    "category": "TARGET",
    "createdAt": "2026-06-06T12:00:00.000Z"
  }
}
```

---

## 5. Remove Bookmark (`DELETE /api/save-college/[id]`)

Removes a bookmarked college from the user's shortlist checklist.

*   **URL**: `/api/save-college/[id]` (where `[id]` is the College ID)
*   **Method**: `DELETE`
*   **Auth Required**: Yes (NextAuth Session)

### Sample Response (`200 OK`)
```json
{
  "success": true,
  "message": "College removed from bookmarks."
}
```
