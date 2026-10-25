# Fixed design decisions (do not re-debate; document them in README)

## Ambiguities in the spec and how we resolve them
- Roles: `user` and `admin`. Register ALWAYS creates `user` (ignore any role/is_admin field in the body, no admin toggle in the UI). Admin is created by `python -m app.seed` from ADMIN_EMAIL / ADMIN_PASSWORD env vars; README lists the demo admin credentials for reviewers.
- Authorization: POST/PUT vehicles require a valid token (any role), following the literal API spec. DELETE vehicle and restock require admin. The frontend only SHOWS add/edit/restock/delete UI to admins.
- GET /api/vehicles returns ALL vehicles including quantity 0 (UI disables Purchase). README explains this.
- Purchase decrements quantity by exactly 1. Restock body: { "quantity": positive integer }.

## API conventions
- JWT (PyJWT) in `Authorization: Bearer <token>`, 1h expiry, claims { sub, role }. Secret from env.
- Vehicle: id (uuid string), make, model, category, price (Numeric, > 0), quantity (int >= 0).
- Search query params (all optional, combinable): make, model (case-insensitive partial), category (case-insensitive exact), min_price, max_price.
- Declare /api/vehicles/search BEFORE /api/vehicles/{id}.
- Error body: { "error": { "code": "STRING", "message": "text" } } via exception handlers.
- Status codes: 400 validation, 401 missing/invalid token, 403 forbidden role, 404 not found, 409 out of stock / duplicate email.

## Safety
- Use the `bcrypt` package directly (passlib breaks with newer bcrypt). Never return password hashes. Validate all input with Pydantic.
- Purchase MUST be atomic: ONE conditional UPDATE (quantity = quantity - 1 WHERE id = :id AND quantity > 0), then check rowcount. Never read-then-write.
- SQLite: set a busy timeout (connect arg `timeout`) and enable WAL so parallel writers wait instead of erroring. Include a concurrency test (e.g. 10 parallel purchases on quantity 5 -> exactly 5 succeed, 5 get 409).

## Testing
- Tests use a FILE-based temporary SQLite DB (pytest tmp_path) via dependency override. Never in-memory, never the real dealership.db.
- dealership.db is gitignored; README documents how to create it (app creates tables on startup) and seed the admin.

## Frontend
- Token kept in localStorage (note the XSS tradeoff in README). Fetch wrapper adds the header. Route guards for auth and admin.
