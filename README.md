# SmartMark - AI Bookmark Manager

A minimalist, real-time bookmark manager built using **Next.js 15** and **Supabase**.

The goal of this project was to move beyond a basic CRUD application and design a secure, multi-user system capable of handling real-time data synchronization across concurrent sessions.

---

##  Live Demo

👉 [https://smart-bookmark-six-rouge.vercel.app](https://smart-bookmark-six-rouge.vercel.app)

---

##  Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19
- **Backend / DB:** Supabase (PostgreSQL, Auth, Realtime)
- **Auth:** Google OAuth 2.0
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

##  Features

- **Google OAuth Authentication:** Secure, passwordless login.
- **Private Data Isolation:** Uses Row Level Security (RLS) to ensure users only see their own data.
- **Real-time Sync:** Instant UI updates across multiple tabs/devices without page refreshes.
- **Bento UI:** Clean, responsive grid layout with automatic favicon extraction.
- **Optimized State:** Smooth synchronization between local React state and the PostgreSQL database.

---

##  System Design Approach

Instead of a simple CRUD app, I approached this as a **multi-user system with real-time requirements**.

### 1. Authentication & User Isolation
- Integrated **Supabase Auth** with Google OAuth.
- Each bookmark is strictly linked to a `user_id`.
- Enforced access control using **Row Level Security (RLS)** so data is protected at the database level, not just the UI.

---

### 2. Database Design

Table: `bookmarks`

| Column      | Type      | Note                               |
|-------------|-----------|------------------------------------|
| id          | UUID      | Primary Key (Auto-generated)       |
| created_at  | Timestamp | Default: `now()`                     |
| user_id     | UUID      | Foreign Key (tied to `auth.users`)   |
| title       | Text      | Mandatory Title                    |
| url         | Text      | Validated Source URL               |

---

### 3. Real-time Updates

One of the core requirements was **live updates across tabs**. I implemented Supabase Realtime to handle this:

- **Subscription:** Listens for changes on the `bookmarks` table.
- **Event Handling:** - `INSERT` → Dynamically prepended to the UI state.
  - `DELETE` → Filtered out of local state by ID.
- **Collision Prevention:** Used unique channel IDs per session to avoid event cross-talk.

This allows a user to open two tabs, delete a bookmark in one, and see it disappear instantly in the other.

---

### 4. State Management Strategy

- **Hydration:** Initial data is fetched on the server/client during the first load.
- **Optimistic Updates:** Local state is managed to ensure the UI stays responsive while the database syncs.
- **Deduplication:** Implemented logic to prevent duplicate entries when real-time events fire for data already in the local state.

---

### 5. Security Considerations

- **RLS Implementation:** All database queries are scoped to the authenticated user.
- **Policy Example:**
```sql
-- Enforce that users can only see their own data
CREATE POLICY "Enable access for users based on user_id" 
ON public.bookmarks FOR ALL 
USING (auth.uid() = user_id);
  ```


---

##  Challenges & Learnings

Building a real-time, multi-user system exposed several non-trivial challenges beyond basic CRUD operations.

### 1. Real-time Updates Not Syncing Across Tabs  
Initially, changes made in one tab were not reflected in others.

- **Issue:** Realtime subscriptions were not properly authenticated.  
- **Fix:** Explicitly set the access token for realtime channels:  
  ```js
  await supabase.realtime.setAuth(session.access_token)
  ```

---

### 2. Duplicate Entries from Realtime Events  
On inserting new bookmarks, duplicate entries occasionally appeared in the UI.

- **Issue:** Both optimistic UI updates and realtime events were adding the same record.  
- **Fix:** Implemented a deduplication check to ensure the record ID does not already exist in the local state before updating.

---

### 3. Row Level Security (RLS) Blocking Inserts  
Insert operations were silently failing despite the user being authenticated.

- **Issue:** The `user_id` field was missing in the payload, causing RLS policies to reject the insert.  
- **Fix:** Explicitly attached the `user_id` from the active session before performing the insert operation.

---

### 4. Session Handling Inconsistencies  
On page refresh, authentication state was sometimes lost.

- **Issue:** `getUser()` occasionally returned `null` during hydration.  
- **Fix:** Switched to `supabase.auth.getSession()` for more reliable session persistence in the App Router.

---

##  Trade-offs

### Client-Side Validation  
- Prioritized client-side validation for faster feedback and smoother UX.  
- Trade-off: Requires careful backend enforcement (via RLS) for security.

### BaaS vs Custom Backend  
- Chose **Supabase** to accelerate development and focus on product logic.  
- Trade-off: Less control compared to a fully custom backend.

### Lightweight Metadata (Favicon API)  
- Used a simple favicon service for link previews.  
- Trade-off: Faster and lightweight, but lacks rich metadata (title, description).

---

##  Possible Improvements

- **Edit / Update:** Allow users to rename bookmarks.  
- **Categorization:** Introduce tags or folders for better organization.  
- **Search & Filter:** Add client-side or indexed search for scalability.  
- **Metadata Extraction:** Use a serverless function to fetch page titles and descriptions.  
- **Pagination / Infinite Scroll:** Improve performance for large datasets.  

---

##  What I Learned

- Designing systems with **user isolation as a core principle** using database-level security (RLS).  
- Handling **real-time data synchronization** across multiple clients without conflicts.  
- Debugging complex interactions between **authentication, database policies, and UI state**.  
- Managing **optimistic UI updates vs server-driven events**.  
- Building a product that behaves like a **real SaaS application**, not just a technical demo.  


