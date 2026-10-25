---
name: endpoint-checklist
description: Use when writing tests for an API endpoint, to make sure no standard case is missed.
---

# Endpoint test checklist
Cover each applicable item for the endpoint:
- Happy path (status + response shape)
- Validation failures (missing fields, wrong types, negative or zero price/quantity) -> 400
- No token -> 401; malformed/expired token -> 401
- Wrong role (non-admin on admin-only endpoint) -> 403
- Unknown id -> 404
- Business rule conflicts (out of stock, duplicate email) -> 409
- Response never leaks password hash
- Side effects verified in the DB (not just the response)
List which items you skipped and why.
