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
-----
---

## 🏗 Challenges & Learnings

**1. Real-time not updating across tabs** Initially, changes were not reflected in other browser contexts.
- **Issue:** Real-time subscriptions were not properly authenticated.
- **Fix:** `await supabase.realtime.setAuth(session.access_token)`

**2. Duplicate data from real-time events** When inserting data, the UI occasionally showed duplicates.
- **Issue:** The local state update and the real-time event were both adding the same record.
- **Fix:** Added a check to verify if the record ID already exists in state before updating.

**3. RLS blocking inserts** Insert operations failed silently even when authenticated.
- **Issue:** The `user_id` was missing from the payload.
- **Fix:** Explicitly attached the `user_id` from the active session before the insert call.

**4. Session handling inconsistencies** `getUser()` sometimes returned null on page refresh.
- **Fix:** Switched to `supabase.auth.getSession()` for more reliable session persistence in the App Router.

---

## 🔄 Trade-offs

- **Client-Side Validation:** Prioritized for faster iteration and better user feedback.
- **BaaS vs. Custom Backend:** Chose Supabase for rapid backend setup, allowing me to focus on the real-time logic and UI/UX.
- **Favicon API:** Used a simple favicon service for link previews to keep the application lightweight without scraping full site metadata.

---

## 📈 Possible Improvements

- **Edit / Update:** Add functionality to rename bookmarks.
- **Categorization:** Tagging system for better organization.
- **Search & Filter:** Client-side search for large datasets.
- **Metadata Extraction:** Implementing a serverless function to fetch page titles and descriptions automatically.

---

## 💡 What I Learned

- Designing systems with **user isolation** as a priority.
- Handling **real-time data synchronization** across distributed clients.
- Debugging complex interactions between **auth, database policies, and UI state**.
- Building a product that behaves like a **real SaaS tool**, not just a technical demo.
