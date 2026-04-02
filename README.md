# The Haus by DOW

Static site for **The Haus by DOW** (DeeOnlyWay): home, product pages, cart, and Stripe Payment Links checkout.

## GitHub Pages

1. Create a new repository on GitHub (empty, no README if you will push this repo).
2. Add the remote and push:

   ```bash
   cd /path/to/DOW
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment**
   - **Source:** Deploy from a branch
   - **Branch:** `main` and folder **`/ (root)`**
   - Save.

4. After a minute, the site is available at:

   `https://YOUR_USER.github.io/YOUR_REPO/`

5. **Stripe:** Add Payment Link URLs in `js/checkout.config.js` on the deployed branch.

The `.nojekyll` file disables Jekyll so static HTML and assets are served as-is.

## Local preview

Open `index.html` in a browser, or run a static server from this folder:

```bash
npx --yes serve .
```

## Optional: Stripe serverless

`api/create-checkout-session.js` and `npm install` are only needed if you use Checkout Sessions (not Payment Links). GitHub Pages does not run Node APIs; use Vercel/Netlify for that route.
