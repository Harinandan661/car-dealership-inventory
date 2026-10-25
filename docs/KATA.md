# TDD Kata: Car Dealership Inventory System (requirements)

Goal: design, build and test a full-stack Car Dealership Inventory System (API, DB, frontend, tests, modern workflow incl. AI).

## 1. Backend API (RESTful)
- Tech: Node/TypeScript (Express/NestJS), or Python (Django/FastAPI), or Ruby (Rails).
- Database required (PostgreSQL, MongoDB, SQLite...). In-memory DB is NOT sufficient.
- Auth: users register and log in; token-based auth (e.g. JWT) secures certain endpoints.
- Endpoints:
  - Auth: POST /api/auth/register, POST /api/auth/login
  - Vehicles (protected):
    - POST /api/vehicles : add a vehicle
    - GET /api/vehicles : list all available vehicles
    - GET /api/vehicles/search : search by make, model, category, or price range
    - PUT /api/vehicles/:id : update vehicle details
    - DELETE /api/vehicles/:id : delete (Admin only)
  - Inventory (protected):
    - POST /api/vehicles/:id/purchase : purchase, decreasing quantity
    - POST /api/vehicles/:id/restock : restock, increasing quantity (Admin only)
- Vehicle fields: unique ID, make, model, category, price, quantity in stock.

## 2. Frontend (SPA)
- Must use HTML5, CSS3, Tailwind, React.
- Registration and login forms.
- Dashboard/homepage showing all available vehicles.
- Search and filter.
- "Purchase" button on each vehicle, disabled when quantity is zero.
- Admin users: forms/UI to add, update, delete vehicles.
- Design: visually appealing, responsive, great UX.

## Process
1. TDD: tests before implementation. Clear Red-Green-Refactor pattern in commit history, esp. backend. High, meaningful coverage.
2. Clean code: SOLID, documented, clear naming.
3. Git: frequent, descriptive commits.
4. AI usage policy: AI use is expected but must be transparent.
   - Every commit where AI was used MUST add the AI as co-author (trailer at end of message, after a blank line):
     Co-authored-by: AI Tool Name <AI@users.noreply.github.com>
   - README must contain a detailed section titled "My AI Usage": which tools, how used, reflection on impact.
   - Be ready to discuss AI usage in the interview.

## Deliverables
- Public Git repo link.
- README.md: project explanation; local setup for backend and frontend; screenshots; mandatory "My AI Usage" section; test report of the test suite results.
- Root PROMPTS.md: raw, unedited AI chat logs or public chat links (NO AI-generated summaries).
- Optional: deployed live app link.

Plagiarism (code copied from other repos/developers) = immediate rejection.
