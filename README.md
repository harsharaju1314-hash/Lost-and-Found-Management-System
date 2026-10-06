# Lost & Found Management System

A full-stack web application designed to help communities, universities, and organizations manage lost and found property. The system provides structured item reporting, multi-criteria searching, a deterministic rule-based matching engine, and a verified claim review workflow with full status tracking.

---

## Overview

Handling misplaced property via bulletin boards, messaging channels, or informal physical desks often leads to poor recovery rates and administrative overhead. The **Lost & Found Management System** centralizes this process with a single platform where users report items, discover potential matches through rule-based scoring, and submit ownership claims with private verification details. Administrators can review submitted proof, resolve claims, add audit notes, and update item lifecycle states.

---

## Problem Statement

1. **Information Fragmentation**: Lost property reports and found items are rarely indexed in a single queryable catalog.
2. **Privacy Risks**: Displaying identifying markings or serial numbers publicly enables fraudulent claims.
3. **Manual Matching Friction**: Reconnecting owners with items requires manual keyword cross-referencing without automated heuristics.
4. **Lack of Transparency**: Claimants have no visibility into the review status of their claimed property once submitted.

---

## Key Features

- **Structured Item Reporting**: Dedicated workflows to report lost and found items with standardized categories, dates, approximate locations, descriptions, and optional image attachments.
- **Search & Filtering Catalog**: Multi-criteria search by keywords, category, location, item type (*lost* vs. *found*), and status (*open*, *claimed*, *returned*).
- **Rule-Based Matching Engine**: Deterministic scoring mechanism evaluating category match, location token overlap, date proximity, and title/description keywords to suggest potential matches without external AI dependencies.
- **Privacy-Preserving Claim System**: Public listings conceal sensitive verification proof. Claimants submit identifying details (distinguishing marks, serial numbers, wallpapers) visible only to reviewers.
- **Claim Code Tracking**: Each claim generates a unique tracking identifier (e.g. `CLM-9021A4`) allowing claimants to check review progress and audit timeline history.
- **Administrator Review Portal**: Role-protected dashboard for reviewers to inspect claim evidence, approve or reject claims, append resolution notes, and update item lifecycle status.
- **Audit Logging**: Immutable tracking of all claim status transitions with timestamps and reviewer notes.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, JavaScript (ES6+), HTML5, CSS3 (Figma-inspired custom design tokens), Lucide React |
| **Backend** | Node.js, Express.js, REST API architecture |
| **Database** | SQLite3 (`better-sqlite3` driver) |
| **Testing** | Jest, Supertest (Backend), Vitest, React Testing Library, jsdom (Frontend) |
| **Version Control** | Git, GitHub |

---

## System Architecture / Workflow

The system follows a standard three-tier monolithic architecture:

```
User / Client  ──►  REST API Layer  ──►  Business Logic Layer  ──►  SQLite Database
   (React)           (Express.js)       - Rule-Based Matching        (better-sqlite3)
                                        - Claim Status Engine
                                        - Role Authorization
```

### Request Flow
$$\text{User Request} \longrightarrow \text{Express Route} \longrightarrow \text{Middleware (Auth / Validation)} \longrightarrow \text{Controller / Service} \longrightarrow \text{SQLite Database} \longrightarrow \text{JSON Response}$$

---

## Project Structure

```text
Lost-and-Found-Management-System/
├── package.json                 # Root script orchestrator
├── README.md                    # Project documentation
├── TECHNICAL_DESIGN.md          # In-depth architectural specification
├── USER_GUIDE.md                # End-user and admin guide
├── server/                      # Backend REST API
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── app.js               # Express application configuration
│   │   ├── server.js            # Server entrypoint and auto-seed check
│   │   ├── config/              # Environment settings
│   │   ├── database/
│   │   │   ├── db.js            # SQLite database connection helper
│   │   │   ├── schema.sql       # SQL table schemas & indexes
│   │   │   └── seed.js          # Realistic sample data seed script
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT authentication and admin role guard
│   │   │   ├── validate.js      # Request validation schemas
│   │   │   ├── upload.js        # Multer image upload filter
│   │   │   └── errorHandler.js  # Global error handling
│   │   ├── services/
│   │   │   └── matchingService.js # Deterministic rule-based matching engine
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── itemController.js
│   │   │   ├── claimController.js
│   │   │   └── statsController.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── itemRoutes.js
│   │       ├── claimRoutes.js
│   │       └── statsRoutes.js
│   └── tests/                   # Backend Jest integration tests
│       ├── auth.test.js
│       ├── items.test.js
│       ├── claims.test.js
│       └── matching.test.js
└── client/                      # Frontend React SPA
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx              # Main routing and layout component
        ├── main.jsx             # React DOM root
        ├── context/
        │   ├── AuthContext.jsx
        │   └── NotificationContext.jsx
        ├── services/
        │   ├── api.js           # Fetch wrapper with JWT interceptor
        │   ├── authService.js
        │   ├── itemService.js
        │   ├── claimService.js
        │   └── statsService.js
        ├── styles/
        │   ├── theme.css        # Design tokens & CSS variables
        │   └── components.css   # Reusable component styles
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ItemCard.jsx
        │   ├── StatusBadge.jsx
        │   ├── MatchCard.jsx
        │   ├── ClaimModal.jsx
        │   ├── ConfirmModal.jsx
        │   ├── EmptyState.jsx
        │   └── LoadingSpinner.jsx
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── SearchItemsPage.jsx
        │   ├── ReportItemPage.jsx
        │   ├── ItemDetailPage.jsx
        │   ├── TrackClaimPage.jsx
        │   └── AdminDashboardPage.jsx
        └── __tests__/           # Frontend RTL/Vitest tests
            ├── ItemCard.test.jsx
            ├── MatchCard.test.jsx
            ├── ReportItemPage.test.jsx
            ├── SearchItemsPage.test.jsx
            ├── TrackClaimPage.test.jsx
            └── AdminDashboardPage.test.jsx
```

---

## How It Works

1. **Reporting**: A user logs a lost or found item. The backend stores the record in SQLite with status `open`.
2. **Matching Engine**: When viewing an item, the backend executes `findMatches()`. It compares open items of the opposite type and scores them against category equality, location keywords, date proximity, and description tokens.
3. **Claiming**: A user submits a claim on a found item. They enter distinguishing proof (e.g. engravings, internal contents) that remains hidden from public search results.
4. **Review**: Administrators log into `/admin` to evaluate claims. Approving a claim automatically updates the item's status to `claimed` and appends an entry to the `claim_updates` audit trail.
5. **Tracking**: The claimant uses their tracking code (e.g., `CLM-9021A4`) to view their review status and resolution notes in real-time.

---

## API Endpoints

### Authentication
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user or administrator (with secret key) |
| `POST` | `/api/auth/login` | Authenticate credentials and receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |

### Items
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/items` | Query items with keyword search, category, location, type, and status filters |
| `GET` | `/api/items/:id` | Get public item details and rule-based potential matches |
| `GET` | `/api/items/:id/matches` | Get scored match candidates with breakdown reasons |
| `POST` | `/api/items` | Report a new lost or found item (supports image upload) |
| `PATCH` | `/api/items/:id` | Update item status or metadata (Admin or Creator) |
| `DELETE` | `/api/items/:id` | Remove item listing (Admin only) |

### Claims
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/items/:id/claims` | Submit an ownership claim with verification proof |
| `GET` | `/api/claims/track/:code` | Public status tracking and timeline by Claim Tracking Code |
| `GET` | `/api/claims` | List claims (Admin all claims, or filtered by claimant email) |
| `GET` | `/api/claims/:id` | Get detailed claim with audit history (Admin or Claimant) |
| `PATCH` | `/api/claims/:id` | Review claim, update status (`approved`/`rejected`/`under_review`), add resolution note |

### Statistics
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/stats/overview` | Fetch counts for total lost, found, resolved items, and pending claims |

---

## Database Schema

```
+--------------------+        +--------------------+
|       users        |        |       items        |
+--------------------+        +--------------------+
| id (PK)            |◄───┐   | id (PK)            |◄───┐
| username           |    │   | type (lost/found)  |    │
| email              |    │   | title              |    │
| password_hash      |    │   | category           |    │
| role (admin/user)  |    │   | description        |    │
| created_at         |    │   | location           |    │
+--------------------+    │   | date_occurred      |    │
                          │   | status             |    │
                          │   | image_url          |    │
                          │   | created_by_user_id ┼────┘
                          │   | created_at         |
                          │   +--------------------+
                          │             ▲
                          │             │ (item_id)
                          │   +---------┴----------+
                          │   |       claims       |
                          │   +--------------------+
                          │   | id (PK)            |◄───┐
                          │   | claim_code         |    │
                          │   | item_id            |    │
                          │   | claimant_name      |    │
                          │   | claimant_email     |    │
                          │   | description_proof  |    │
                          │   | status             |    │
                          └───┼─reviewed_by_user_id│    │
                              | admin_notes        |    │
                              | created_at         |    │
                              +--------------------+    │
                                        ▲               │
                                        │ (claim_id)    │
                              +---------┴----------+    │
                              |   claim_updates    |    │
                              +--------------------+    │
                              | id (PK)            |    │
                              | claim_id           ├────┘
                              | previous_status    |
                              | new_status         |
                              | note               |
                              | updated_by         |
                              | created_at         |
                              +--------------------+
```

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- [Git](https://git-scm.com/)

### 1. Clone Repository
```bash
git clone https://github.com/harsharaju1314-hash/Lost-and-Found-Management-System.git
cd Lost-and-Found-Management-System
```

### 2. Install Dependencies
Install all root, backend, and frontend packages:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 3. Environment Configuration
Create the environment configuration in the `server` directory:
```bash
cp server/.env.example server/.env
```

Default variables in `server/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_for_lost_and_found_system_2026
ADMIN_SECRET_KEY=admin_secret_lostfound_2026
DATABASE_FILE=./database.sqlite
CLIENT_URL=http://localhost:5173
```

### 4. Seed Sample Data
Populate the SQLite database with realistic initial items, users, and claims:
```bash
npm run seed
```

---

## Running the Application

### Option A: Run Both Client and Server Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### Option B: Run Services Independently

**Start Backend Server:**
```bash
cd server
npm run dev
```

**Start Frontend Client:**
```bash
cd client
npm run dev
```

---

## Default Demo Credentials

| Role | Email / Identifier | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@lostfound.local` | `admin123` | Full access to review claims and manage items |
| **Regular User** | `john.doe@example.com` | `user123` | Standard reporting and search permissions |

---

## Testing

The project includes unit and integration tests across both the server (API & database layer) and the client (UI & component layer).

### Run All Test Suites
```bash
npm test
```

### Run Backend Tests Only
```bash
npm run test:server
```
*Tests cover item creation, validation, search filters, rule-based matching calculations, claim submission, tracking codes, authorization checks, and claim status transitions.*

### Run Frontend Tests Only
```bash
npm run test:client
```
*Tests cover card rendering, form input validation, search filtering, claim tracking displays, admin login, and reviewer queue interaction.*

---

## Sample Usage Scenarios

1. **Reporting a Misplaced Item**: Navigate to "Report Lost", fill in details for a misplaced item (e.g., "Sony WH-1000XM4 Headphones"), and view instant rule-based match suggestions against existing found records.
2. **Submitting a Claim**: Search for a found item (e.g., "Black Bifold Leather Wallet"), open details, and click "Claim This Item". Provide identifying information and save the generated tracking code `CLM-XXXXXX`.
3. **Admin Verification**: Sign into `/admin`, locate the pending claim in the queue, review the claimant's submitted proof against the item description, add a resolution note, and click "Approve Claim".

---

## Future Improvements

- [ ] Exportable CSV reports of resolved items for institutional inventory audits.
- [ ] Automated email notifications to claimants upon status updates using Nodemailer / SMTP.
- [ ] QR code generation on item tags for physical lost-and-found intake stations.
- [ ] Geofenced building boundary selection for campus-specific drop-off desks.

---

## Key Takeaways / What I Learned

- Built a modular REST API architecture with clean separation between controllers, services, database access, and error middleware.
- Implemented a deterministic rule-based matching engine with stopword filtering and weighted scoring heuristics without relying on heavy external AI services.
- Designed a privacy-conscious data workflow that conceals sensitive verification evidence from public search queries.
- Created a cohesive, accessible Figma-inspired UI design system in pure CSS with responsive flexbox and grid layouts.
- Wrote end-to-end automated unit and integration tests with Jest, Supertest, Vitest, and React Testing Library.

---

## Author

**Harsha Raju**  
GitHub: [@harsharaju1314-hash](https://github.com/harsharaju1314-hash)
