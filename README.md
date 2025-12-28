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
- Multi-step Waitlist form (simulated for standalone use).
- Zero dependencies on the main monorepo.

