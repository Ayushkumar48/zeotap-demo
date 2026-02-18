# Incident Management Dashboard

A simple, type-safe incident management dashboard built with Next.js, Hono, and oRPC.

## Setup & Run

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Database Setup:**
   Ensure you have a local SQLite database (it will auto-create if needed via `.env` path).
   ```bash
   bun run db:push
   ```

3. **Start Development:**
   ```bash
   bun run dev
   ```
   - Web: [http://localhost:3001](http://localhost:3001)
   - API: [http://localhost:3000](http://localhost:3000)

## API Overview

The backend is an **oRPC** server. All procedures are prefixed with `/rpc`.
- `POST /rpc/incident/getAllWithPaginationAndFilter`: List incidents with filtering.
- `POST /rpc/incident/getIncident`: Fetch a single incident.
- `POST /rpc/incident/createIncident`: Create an incident.
- `POST /rpc/incident/updateIncident`: Update an incident.
- `POST /rpc/incident/deleteIncident`: Delete an incident.

You can also view the interactive **Swagger/OpenAPI** docs at:
`http://localhost:3000/api-reference`

## Design Decisions & Tradeoffs

- **Monorepo Structure**: Used Turborepo/Bun to keep the API schema and DB types shared between `apps/web` and `apps/server`. It makes typing trivial but adds complexity to the build folder structure.
- **Mobile First**: Swapped the heavy table for a card-based view on small screens. Tables are a nightmare on mobile, so this was the most usable tradeoff.
- **oRPC over REST**: Chose oRPC to get "Zod-to-Zod" type safety without needing an extra client generator like Swagger (though it still generates OpenAPI docs automatically).
- **SQLite**: Used SQLite for simplicity in this demo. It's fast and file-based, avoiding the need for a Dockerized PG instance for a quick setup.

## Future Improvements

- **Real-time updates**: Add WebSockets or Server-Sent Events (SSE) so the dashboard updates live as new incidents come in.
- **Auth**: Currently, there's no login. Adding Clerk or NextAuth would be the first step for a real production tool.
- **Charts**: A "Severity Trend" or "Time-to-Resolve" graph would add a lot of value to the home page.
- **Advanced Search**: Implementation of full-text search (FTS) for the incident summaries.

---

### Can I host this on Vercel?
**Yes, absolutely.** Since the frontend is a Next.js app, you can host it on Vercel. However, because this is a monorepo with a separate Hono server:
1. You'd deploy the `apps/web` as a Vercel project.
2. You can deploy the `apps/server` as **Vercel Functions** or to a platform like **Railway/Render/Fly.io**.
3. If you want everything on Vercel, you'd need to move the Hono router into a Next.js API route (`/api/[...hono]`), which is very easy with `hono/nextjs`.
