# backend-node (Express + Mongoose)

Lightweight Node/Express replacement for the Python backend. API paths mirror the original FastAPI app so the frontend requires no changes.

Environment variables: copy `.env.example` to `.env` and set values.

Run:

```
npm install
npm run dev
```

Default admin:
- email: admin@tripplanner.com
- password: admin123

Endpoints:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/trips
- POST /api/trips (admin)
- GET /api/trips/:id
- PUT /api/trips/:id (admin)
- DELETE /api/trips/:id (admin)
- POST /api/bookings
- GET /api/bookings/my
- GET /api/bookings (admin)
- PATCH /api/bookings/:id/status (admin)
- POST /api/contact
- GET /api/contact (admin)
- PATCH /api/contact/:id/reply (admin)
- GET /api/dashboard/stats (admin)
