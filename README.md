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
