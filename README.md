# Gala11 Standalone Landing Page

This is a standalone version of the Gala11 Landing Page, ready to be deployed to GitHub Pages.

## How to use

1. **Copy Assets**:
   Copy the following files from your main project's `apps/frontend/public/` into this project's `public/` folder:
   - `logo.png`
   - `demo-preview.webp`

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Build**:
   ```bash
   npm run build
   ```

5. **Deploy to GitHub Pages**:
   - Push this code to a new GitHub repository.
   - Go to **Settings > Pages**.
   - Select **GitHub Actions** as the build/deployment source, or push the `dist` folder to a `gh-pages` branch.

## Features
- Pixel-perfect design preserved from the main app.
- Full "Electric" animations and styles.
- Multi-step Waitlist form with Supabase integration.
- Zero dependencies on the main monorepo.

## Supabase Setup (Optional)

If you want the waitlist to actually save data:

1.  **Create a Table**: In your Supabase SQL Editor, run:
    ```sql
    create table waitlist (
      id uuid default gen_random_uuid() primary key,
      email text unique not null,
      name text,
      company text,
      role text,
      created_at timestamp with time zone default now()
    );

    -- Enable RLS
    alter table waitlist enable row level security;

    -- Allow anyone to insert (Waitlist signup)
    create policy "Allow public inserts" on waitlist for insert with check (true);
    ```

2.  **Environment Variables**:
    Create a `.env` file in this directory and add your keys from Supabase Settings > API:
    ```
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```

3.  **GitHub Pages**: Add these same keys as "Secrets" in your GitHub Repository settings if using GitHub Actions for deployment.

