# Technical Design: Lost & Found Management System

## 1. Overview and Problem Context
Misplaced property in campus and community settings frequently goes unrecovered due to fragmented communication channels (e.g., physical bulletin boards, scattered social media posts). This project provides a structured, centralized web application where users can report lost or found property, search items, receive deterministic match suggestions, and securely submit verification claims without exposing sensitive ownership proof to the public.

---

## 2. System Architecture

The application follows a monolithic client-server architecture with separation between the React Single-Page Application (SPA) frontend, Express.js REST API backend, and an embedded SQLite relational database.

```
+-------------------------------------------------------------------+
|                        React Frontend (SPA)                       |
|  - React 19 / Vite                                                |
|  - Figma-Inspired Custom CSS Design System                        |
|  - Context API (AuthContext, NotificationContext)                  |
+---------------------------------+---------------------------------+
                                  |
                                  | HTTP / JSON (REST API)
                                  v
+-------------------------------------------------------------------+
|                     Express.js Backend API                        |
|  - Express Routing & Controller Layer                             |
|  - JWT Authentication & Role-Based Authorization                  |
|  - Multer Safe File Upload Handling (MIME & Size validation)       |
|  - Deterministic Rule-Based Heuristic Matching Service            |
+---------------------------------+---------------------------------+
                                  |
                                  | SQL Queries (better-sqlite3)
                                  v
+-------------------------------------------------------------------+
|                       SQLite Relational DB                        |
|  - Tables: users, items, claims, claim_updates                    |
|  - Foreign Key Constraints & Performance Indexes                  |
+-------------------------------------------------------------------+
```

---

## 3. Data Model & Database Schema

The database utilizes SQLite with foreign key enforcement (`PRAGMA foreign_keys = ON`).

### 3.1 `users`
Represents standard users and administrators.
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `username` TEXT UNIQUE NOT NULL
- `email` TEXT UNIQUE NOT NULL
- `password_hash` TEXT NOT NULL (Bcrypt hashed)
- `role` TEXT NOT NULL DEFAULT 'user' ('admin', 'user')
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

### 3.2 `items`
Represents lost and found property postings.
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `type` TEXT NOT NULL ('lost', 'found')
- `title` TEXT NOT NULL
- `category` TEXT NOT NULL ('Electronics', 'Wallets & Bags', 'Keys & Badges', 'Documents & IDs', 'Clothing & Accessories', 'Jewelry', 'Books & Stationery', 'Other')
- `description` TEXT NOT NULL
- `location` TEXT NOT NULL
- `date_occurred` TEXT NOT NULL (YYYY-MM-DD)
- `status` TEXT NOT NULL DEFAULT 'open' ('open', 'claimed', 'returned', 'closed')
- `image_url` TEXT
- `contact_name` TEXT
- `contact_email` TEXT
- `contact_phone` TEXT
- `created_by_user_id` INTEGER (FK -> users.id)
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP

### 3.3 `claims`
Stores verification claims submitted by users for specific items.
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `claim_code` TEXT UNIQUE NOT NULL (e.g. `CLM-9021A4`)
- `item_id` INTEGER NOT NULL (FK -> items.id ON DELETE CASCADE)
- `claimant_name` TEXT NOT NULL
- `claimant_email` TEXT NOT NULL
- `claimant_phone` TEXT
- `description_proof` TEXT NOT NULL (confidential ownership evidence)
- `date_lost` TEXT
- `status` TEXT NOT NULL DEFAULT 'pending' ('pending', 'under_review', 'approved', 'rejected')
- `admin_notes` TEXT (reviewer resolution note)
- `reviewed_by_user_id` INTEGER (FK -> users.id)
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP

### 3.4 `claim_updates`
Maintains an immutable audit log of all claim status transitions.
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `claim_id` INTEGER NOT NULL (FK -> claims.id ON DELETE CASCADE)
- `previous_status` TEXT NOT NULL
- `new_status` TEXT NOT NULL
- `note` TEXT
- `updated_by` TEXT NOT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

---

## 4. Rule-Based Matching Engine Specification

Rather than relying on non-deterministic machine learning or external cloud services, the platform implements a transparent, deterministic heuristic scoring engine in `src/services/matchingService.js`.

### 4.1 Heuristic Weights (Total Score: 0 to 100)
1. **Category Equality (35 points)**: Exact match between target item and candidate item category.
2. **Location Similarity (25 points)**: Keyword token intersection on normalized location strings after filtering stopwords.
3. **Date Proximity (20 points)**:
   - $\le 2$ days difference: 20 points
   - $\le 5$ days difference: 15 points
   - $\le 10$ days difference: 10 points
   - $\le 30$ days difference: 5 points
4. **Description & Title Keyword Overlap (20 points)**: Alphanumeric token extraction from title and description against common English stopwords; 6 points per shared keyword up to 20 points maximum.

### 4.2 Confidence Thresholds
- **High Confidence**: Score $\ge 70$
- **Medium Confidence**: $45 \le \text{Score} < 70$
- **Low Confidence**: $30 \le \text{Score} < 45$
- Scores below 30 are excluded from recommendation lists.

---

## 5. Security and Privacy Safeguards

1. **Information Masking**: The public `GET /api/items/:id` endpoint does not expose sensitive ownership proof from claims.
2. **Claim Isolation**: Detailed claimant evidence (`description_proof`) is only queryable by administrators or the claimant possessing matching session credentials.
3. **Upload Validation**: Image uploads are strictly checked for valid MIME types (`image/jpeg`, `image/png`, `image/webp`) with a 5MB size limit and sanitized filenames to prevent directory traversal.
4. **Role Enforcement**: Critical administrative routes (`PATCH /api/claims/:id`, `DELETE /api/items/:id`) verify signed JWT tokens containing the `admin` role.

---

## 6. Frontend Component Architecture

- **Context Layer**:
  - `AuthContext`: Manages JWT tokens, user state, and role checks.
  - `NotificationContext`: Manages floating toast notifications with auto-dismissal.
- **Pages**:
  - `LandingPage`: Overview dashboard, 4 core navigation paths, system metrics, and workflow cards.
  - `ReportItemPage`: Tabbed Lost/Found item form with validation and instant match recommendations.
  - `SearchItemsPage`: Multi-filter search catalog with pagination and empty states.
  - `ItemDetailPage`: Full item profile, rule-based match breakdown, and claim modal trigger.
  - `TrackClaimPage`: Claim code tracker with live status and audit timeline.
  - `AdminDashboardPage`: Admin authentication gate, claims verification table, resolution modal, and catalog manager.
