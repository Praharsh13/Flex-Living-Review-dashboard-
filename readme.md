Flex Living – Reviews Dashboard (Assessment Documentation)

## Tech Stack Used

Backend:

Node.js + Express for the API server

MongoDB (Mongoose) for persisting reviews and approval state (instead of raw JSON files, to scale better)

dotenv for environment config (HOSTAWAY_ACCOUNT_ID, HOSTAWAY_API_KEY, MONGODB_URI)

ES Modules and a simple MVC folder structure (models, services, controllers, routes)

JWT Token for access/role based access i.e ADMIN Access

Frontend:

React + TypeScript + Vite for a modern dev setup

Tailwind CSS for clean, responsive UI and 

React Router for navigation (Public pages + Admin Dashboard + Review Details)

Others:

Unsplash placeholder images for properties

date-fns for safe date parsing and formatting

##--------------------------------------------------------------------------------------##

## Key Design and Logical Decisions

Normalization Layer:
Hostaway reviews don’t always have a top-level rating. To handle this, I wrote a normalizer that:

Computes an average from category ratings when rating is null.

Converts submittedAt into an ISO date string (so frontend can sort easily).

Wraps categories as { key, rating } objects.

Adds approved: false by default (dashboard can toggle).

Why MongoDB Instead of Files:
I first tried storing approvals in a JSON file. It worked, but felt clunky (file locks, no queries). I switched to MongoDB because it’s much easier to upsert reviews by ID, track approval state, and later extend to multiple sources (Google).

Frontend Filtering:
I debated whether to implement filters on the backend or frontend. To keep things simple and fast to iterate, I kept all filtering client-side in state, with helper utilities (filterRows, sortRows, groupByListing). This means the backend always returns the full dataset in a consistent shape.

Dashboard Insights:
While building the admin dashboard, I realized it’s not enough to just show a table. So I added:

KPIs: total reviews, average rating, approved share

Per-property cards with trend sparkline and recurring issues (categories averaging < 7)

A side drawer to review and toggle approvals property-wise
This made the dashboard feel closer to what a manager would actually use.

Where I Got Stuck:

I hit a “Hooks order changed” error in React when conditionally returning before calling all hooks. I fixed it by always calling hooks unconditionally, with safe defaults.

I initially used .at(-1) in arrays for trends, but TypeScript complained (ES2022). I fixed it by using array[array.length - 1] instead.

Pagination and making entire rows clickable was tricky — I had to prevent the checkbox from triggering navigation (using stopPropagation).

API Behaviors

GET /api/reviews/hostaway
Returns normalized mock Hostaway reviews. Shape:

{
  "status": "success",
  "total": 3,
  "groupedByListing": {
    "2B N1 A - 29 Shoreditch Heights": [ { ...normalized review... } ]
  },
  "result": [ { ...normalized review... } ]
}


POST /api/reviews/approve/:id
Toggles approved flag for the review with that ID. Returns:

{ "ok": true, "id": "7453", "approved": true }


GET /api/reviews/public (optional helper)
Returns only approved reviews, grouped by listing — used by the public-facing pages.


Google Reviews Findings

I explored integrating Google Places API. Technically possible via Google Places Details API (reviews field), but two blockers:

Requires a real Place ID and billing-enabled API key.

Free tier only gives limited requests/day, which isn’t ideal for a demo.

Strong deadline so though of making basic first , however I will carry this assessment to integrate it.


## Seeding the Database

Because the Hostaway sandbox API doesn’t return live reviews, I created a seed script to populate MongoDB from the local mock JSON file (data/mock/hostaway.json).

Command:
npm run seed


Script: src/scripts/seed.js

Connects to MongoDB (MONGODB_URI from .env).

Reads the mock JSON.

Normalizes each review (computes average rating if missing, converts dates, etc.).

Upserts into the reviews collection by a composite key (channel:id).

This ensures that if you run the seed multiple times, it updates existing reviews instead of duplicating them.


Why this design:

I first tried just reading from the JSON file on every request, but that made it hard to persist approval toggles.

By seeding into MongoDB, I can treat reviews as proper documents and persist changes (like approved: true).

Upsert logic means I can rerun the seed whenever I want to refresh or extend the dataset without clearing the DB.

