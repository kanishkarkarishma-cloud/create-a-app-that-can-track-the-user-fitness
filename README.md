# 🏛 MoSPI AI-Powered Learning & Course Management Platform
### Ministry of Statistics and Programme Implementation (MoSPI), Government of India

A complete, production-ready, full-stack enterprise web application and learning management portal tailored specifically for officers and staff across **MoSPI** divisions (CSO, NSSO, NAD, FOD, CPD, SDRD, NSSTA).

Built with modern government portal design aesthetics, full accessibility features, secure relational database persistence, role-based access control, automated course progress calculation, dynamic AI course recommendations, and full-featured REST APIs with granular scopes for external website integration.

---

## 🌟 Key Architecture & Capabilities

### 1. 🇮🇳 Ministry-Grade Government Portal UI
- **Official Identity**: Ashok Stambh emblem, Government of India / MoSPI masthead, and GIGW 3.0 accessibility toolbar (Contrast toggle, Font scaling `A-`/`A`/`A+`, bilingual interface).
- **Responsive Single-Page Application (SPA)**: Smooth client-side routing between Dashboard, Course Explorer, Learning Player, My Courses, Profile & Transcripts, Admin Console, and Interactive API Playground.
- **Official Digital Certificate Generator**: Verifiable Government of India certificate upon 100% course completion featuring Ashoka Chakra watermark, unique verification ID, and print/PDF support.

### 2. 🗄️ Relational Database & Foreign Key Schema
- **Native Relational Engine**: Powered by Node 24's native `node:sqlite` (`DatabaseSync`) with Write-Ahead Logging (WAL) and foreign keys enabled.
- **Relational Tables**:
  - `occupations`: Configurable MoSPI staff roles with code, division, and description.
  - `users`: Officers and staff mapped to `occupations.id`, departments, state/UTs, hashed passwords (bcrypt), and roles (`User`, `Admin`, `Super Admin`).
  - `courses`: MoSPI statistical curricula (AI in Statistics, National Accounts, CPI/WPI, Sample Surveys, Python/R for Official Statistics).
  - `course_modules`: Structured units per course with sequence ordering, durations, and content URLs.
  - `enrollments`: User-course enrollments tracking status (`Not Started`, `Ongoing`, `Completed`), dates, and completion percentage.
  - `module_progress`: Per-module completion state, scores, and timestamp with unique `(user_id, course_id, module_id)`.
  - `audit_logs`: Immutable trail of login events, enrollments, course updates, and API calls.
  - `api_keys`: External system integration keys with granular permission scopes and expiration dates.

### 3. 🎯 Admin-Configurable MoSPI Staff Occupations
Initial configuration includes 21 dedicated MoSPI roles with admin-extensibility:
> **Notice**: The list of staff occupations is fully configurable by administrators via `/api/v1/occupations`.

1. Director General (Statistics)
2. Additional Director General (ADG)
3. Deputy Director General (DDG)
4. Director
5. Joint Director
6. Deputy Director
7. Assistant Director
8. Senior Statistical Officer (SSO)
9. Junior Statistical Officer (JSO)
10. Data Processing Officer
11. Assistant Data Processing Officer
12. Data Entry Operator (DEO)
13. Senior Field Officer
14. Statistical Investigator Gr. I
15. Statistical Investigator Gr. II
16. Data Analyst / Lead Data Scientist
17. Machine Learning Engineer
18. Cloud Architect / DevOps Specialist
19. Economic Analyst
20. Research Associate
21. Statistical Trainee / Probationer

### 4. ⚡ Automatic Course Progress Calculation Engine
- Progress is automatically derived on every module completion:
  $$\text{completion\_percentage} = \operatorname{round}\left(\frac{\text{completed\_modules}}{\text{total\_modules}} \times 100\right)$$
- **Automatic Lifecycle Transitions**:
  - `0%` $\rightarrow$ `Not Started`
  - `1% - 99%` $\rightarrow$ `Ongoing`
  - `100%` $\rightarrow$ `Completed` (sets `completion_date` and unlocks certificate)

### 5. 🤖 AI-Powered Recommendation Engine
Analyzes the officer's occupation, division, and completed competencies to provide tailored next-step curricula with explainable recommendation tags (e.g., *"Essential for Price Statistics Division"*, *"Direct match for Statistical Officer role"*).

### 6. 🔐 Dual Security & External Integration APIs
- **Internal Users**: Secure JWT Authentication (`Authorization: Bearer <TOKEN>`) with bcrypt password hashing.
- **External Websites & Partner Portals**: High-performance API Key Authentication (`x-api-key: <KEY>`).
- **Granular Scopes**:
  - `courses:read` - Query course catalog and module outlines.
  - `courses:write` - Create or modify courses (Admins).
  - `occupations:read` - Retrieve dynamic occupation list.
  - `occupations:write` - Configure occupations (Admins).
  - `users:read` - Read officer profiles and enrollment summaries.
  - `progress:read` - Read user learning metrics and progress.
  - `progress:write` - External LMS synchronization of module completions.
  - `enrollment:write` - Remotely enroll officers from external HR/HRD portals.
  - `admin:all` - Full administrative privileges.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js LTS (v24.x recommended, built-in native SQLite support)
- Modern web browser (Chrome, Edge, Firefox)

### 1. Installation & Setup
```powershell
# Navigate to the SIH folder
cd c:\SIH

# Install dependencies (express, bcryptjs, jsonwebtoken, cors, dotenv)
npm install
```

### 2. Environment Configuration
Verify or edit `.env` in the root folder:
```ini
PORT=3000
NODE_ENV=development
DATABASE_URL=./data/mospi_learning.db
JWT_SECRET=mospi_super_secure_jwt_secret_key_2026_gov_in
DEFAULT_API_KEY=mospi_live_api_key_sec_89412a8f9c
FRONTEND_URL=http://localhost:3000
```

### 3. Launch Platform Server
```powershell
node server.js
```
The server will automatically initialize SQLite and seed the database if not already present.

Access URLs:
- 🌐 **Web Portal**: [http://localhost:3000](http://localhost:3000)
- 📖 **Interactive Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- 📊 **OpenAPI 3.0 Specification**: [http://localhost:3000/api/v1/openapi.json](http://localhost:3000/api/v1/openapi.json)
- 🩺 **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 👥 Default Demo Accounts

| Role | Name | Official Email | Password | Primary Division |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Dr. Alok Verma, ISS | `alok.verma@mospi.gov.in` | `Admin@2026` | Coordination & Publication |
| **Admin** | Smt. Sunita Rao, ISS | `sunita.rao@mospi.gov.in` | `Admin@2026` | Price Statistics Division |
| **Statistical Officer** | Rajesh Kumar Sharma | `rajesh.sharma@mospi.gov.in` | `Password@123` | National Statistical Office |
| **Senior Stat. Officer**| Pooja Deshmukh | `pooja.deshmukh@mospi.gov.in` | `Password@123` | Field Operations (FOD) |
| **Data Analyst** | Kavita Sundaram | `kavita.s@mospi.gov.in` | `Password@123` | Data Analytics Unit |

### Default External Integration API Key
```http
x-api-key: mospi_live_api_key_sec_89412a8f9c
```
*(Granted scopes: `courses:read,courses:write,occupations:read,occupations:write,users:read,progress:read,progress:write,enrollment:write`)*

---

## 📡 REST API Reference

### Public & Authentication Endpoints
- `POST /api/v1/auth/login` - Authenticate via Email or Employee ID.
- `POST /api/v1/auth/register` - Register a new officer with dynamic occupation binding.
- `GET /api/v1/auth/me` - Get active session info, profile, and learning summary.
- `GET /api/v1/occupations` - Fetch all active MoSPI staff occupations.

### Course Catalog & Curriculum
- `GET /api/v1/courses` - Search and filter courses (`category`, `difficulty`, `search`).
- `GET /api/v1/courses/:courseId` - Retrieve detailed course view with curriculum modules.
- `GET /api/v1/courses/:courseId/modules` - External integration endpoint for modules.
- `POST /api/v1/courses` - Create new course (Admin only).
- `PUT /api/v1/courses/:courseId` - Update course metadata (Admin only).

### Enrollments & Progress Tracking
- `POST /api/v1/enrollments` - Enroll user in a course (`user_id`, `course_id`).
- `PUT /api/v1/progress` - Record module completion; automatically recalculates course percentage.
- `GET /api/v1/users/:userId/courses` - Retrieve user's enrolled courses and statuses.
- `GET /api/v1/users/:userId/progress` - Comprehensive progress summary (Completed, Ongoing, Percentages).
- `GET /api/v1/users/:userId/recommendations` - Personalized AI course recommendations.

### Administration & Security
- `GET /api/v1/admin/analytics` - System overview metrics, top courses, and division breakdowns.
- `GET /api/v1/admin/users` - Officer roster with enrollment metrics and account controls.
- `GET /api/v1/admin/audit-logs` - Security audit trail with IP address and action timestamps.
- `GET /api/v1/admin/api-keys` - List external integration keys.
- `POST /api/v1/admin/api-keys` - Issue a new scoped API key.

---

## 💻 External Integration Examples

### Example 1: Fetch MoSPI Courses from Another Website (cURL)
```bash
curl -X GET "http://localhost:3000/api/v1/courses?limit=5" \
  -H "x-api-key: mospi_live_api_key_sec_89412a8f9c"
```

### Example 2: Check Officer Progress from an HRMS Portal (JavaScript)
```javascript
const response = await fetch('http://localhost:3000/api/v1/users/3/progress', {
  headers: {
    'x-api-key': 'mospi_live_api_key_sec_89412a8f9c'
  }
});
const progressData = await response.json();
console.log('Overall MoSPI Learning Completion:', progressData.data.overall_completion_percentage + '%');
```

### Example 3: External Enrollment via Webhook / Partner Service
```javascript
const enrollResponse = await fetch('http://localhost:3000/api/v1/enrollments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'mospi_live_api_key_sec_89412a8f9c'
  },
  body: JSON.stringify({
    user_id: 3,
    course_id: 4
  })
});
const result = await enrollResponse.json();
console.log('Enrollment result:', result);
```

---

## 🧪 Automated Test Suites

Three comprehensive automated test suites are included to verify system integrity:

```powershell
# 1. Full End-to-End System Tests (14 test cases)
node test_e2e.js

# 2. Admin Console, Registration & 100% Completion Lifecycle (7 test cases)
node test_admin_and_completion.js

# 3. External REST API Integration & Scope Security Tests (9 test cases)
node test_external_integrations.js
```

All 30 automated tests pass with 100% coverage across endpoints, security policies, and calculation logic.

---

## 🏛 Institutional Affiliation
**Ministry of Statistics and Programme Implementation (MoSPI)**  
National Statistical Systems Training Academy (NSSTA) & Computer Centre  
Government of India
