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

## API Overview & Testing

The backend is an **oRPC** server. Because procedures take input, they require **POST** requests with a JSON body. 

### 🟢 Best Way to Test (Interactive Docs)
The easiest way to explore and call the API is through the built-in **Swagger/OpenAPI UI**:
👉 **[http://localhost:3000/api-reference](http://localhost:3000/api-reference)**

### RPC Procedures
All calls are prefixed with `/rpc`:
- `POST /rpc/incident/getAllWithPaginationAndFilter`: List incidents with filtering.
- `POST /rpc/incident/getIncident`: Fetch a single incident.
- `POST /rpc/incident/createIncident`: Create an incident.
- `POST /rpc/incident/updateIncident`: Update an incident.
- `POST /rpc/incident/deleteIncident`: Delete an incident.

*Note: Accessing these paths directly in a browser via GET will return a "Method Not Supported" error.*

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
