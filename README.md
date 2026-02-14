# SmartMark - AI Bookmark Manager

A minimalist, real-time bookmark manager built using **Next.js 15** and **Supabase**.

The goal of this project was to move beyond a basic CRUD application and design a secure, multi-user system capable of handling real-time data synchronization across concurrent sessions.

> Built as a take-home challenge to demonstrate real-time systems, authentication, and secure multi-user data handling.

---

## Live Demo

👉 https://smart-bookmark-six-rouge.vercel.app

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19  
- **Backend / DB:** Supabase (PostgreSQL, Auth, Realtime)  
- **Auth:** Google OAuth 2.0  
- **Styling:** Tailwind CSS  
- **Deployment:** Vercel  

---

## Features

- **Google OAuth Authentication:** Secure, passwordless login  
- **Private Data Isolation:** Uses Row Level Security (RLS) to ensure users only see their own data  
- **Real-time Sync:** Instant UI updates across multiple tabs/devices without page refreshes  
- **Bento UI:** Clean, responsive grid layout with favicon previews  
- **Optimized State:** Handles synchronization between local React state and database updates (including realtime events)  

---

## System Design Approach

Instead of treating this as a simple CRUD app, I designed it as a **multi-user system with real-time synchronization and strict data isolation**.

---

### 1. Authentication & User Isolation

- Integrated **Supabase Auth** with Google OAuth  
- Each bookmark is linked to a `user_id`  
- Enforced access control using **Row Level Security (RLS)** so data is protected at the database level  

---

### 2. Database Design

Table: `bookmarks`

| Column      | Type      | Note                                |
|-------------|-----------|-------------------------------------|
| id          | UUID      | Primary Key (Auto-generated)        |
| created_at  | Timestamp | Default: `now()`                    |
| user_id     | UUID      | Foreign Key (linked to `auth.users`)|
| title       | Text      | Required                            |
| url         | Text      | Validated URL                       |

---

### 3. Real-time Updates

One of the core requirements was **live updates across tabs**.

- **Subscription:** Listens for changes on the `bookmarks` table  
- **Event Handling:**
  - `INSERT` → Prepended to UI state  
  - `DELETE` → Removed from local state  
- **Collision Prevention:** Used unique channel IDs per session to avoid cross-talk  

This allows a user to open multiple tabs and see updates instantly.

---

### 4. State Management Strategy

- **Hydration:** Initial data is fetched on load  
- **Optimistic Updates:** UI updates immediately before database confirmation  
- **Deduplication:** Prevents duplicate entries when realtime events fire  

---

### 5. Security Considerations

- **RLS Implementation:** All queries are scoped to the authenticated user  

- **Policy Example:**
```sql
-- Users can only access their own bookmarks
CREATE POLICY "Enable access for users based on user_id" 
ON public.bookmarks FOR ALL 
USING (auth.uid() = user_id);
```

---

## Challenges & Solutions

These issues mainly came from coordinating authentication, realtime subscriptions, and local state updates.

---

**1. Real-time updates not syncing across tabs**  
Initially, changes were not reflected in other browser tabs.  
- **Issue:** Realtime subscriptions were not authenticated properly  
- **Fix:** Added authentication to realtime channels  
  `await supabase.realtime.setAuth(session.access_token)`

---

**2. Duplicate entries from realtime events**  
When inserting a bookmark, duplicates sometimes appeared.  
- **Issue:** Both local state updates and realtime events were adding the same record  
- **Fix:** Added a check to ensure the record ID doesn’t already exist before updating state  

---

**3. RLS blocking inserts**  
Insert operations failed without clear errors.  
- **Issue:** The `user_id` field was missing, so RLS policies rejected the request  
- **Fix:** Explicitly included `user_id` from the current session in the insert payload  

---

**4. Session handling on refresh**  
Auth state was sometimes lost on page refresh.  
- **Issue:** `getUser()` returned null during initial load  
- **Fix:** Switched to `supabase.auth.getSession()` for more reliable session handling  

---

## Trade-offs

- **Client-side validation:** Faster feedback, while relying on RLS for security  
- **BaaS vs custom backend:** Chose Supabase for faster development and focus on core features  
- **Favicon API:** Lightweight approach for previews, but limited metadata  

---

## Possible Improvements

- Add edit functionality for bookmarks  
- Add tags or categories  
- Implement search and filtering  
- Fetch metadata (title, description) using a serverless function  
- Add pagination for large datasets  

---

## What I Learned

- Designing systems with **data isolation enforced at the database level (RLS)**  
- Handling **real-time synchronization across multiple clients**  
- Debugging interactions between **authentication, database policies, and UI state**  
- Managing conflicts between **optimistic updates and realtime events**  
- Building a product that behaves like a **production-style SaaS application**  
