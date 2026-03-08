<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy to Vercel.

View your app in AI Studio: https://ai.studio/apps/a7bcb032-0e28-497b-9f9d-e5b65ddc2c1c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/your-repo)

### Manual Deployment

1. **Push to Git Repository** (GitHub, GitLab, or Bitbucket)

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Configure project settings (auto-detected from `vercel.json`)

3. **Set Environment Variables** in Vercel Dashboard:
   - `JWT_SECRET` - Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `NODE_ENV` - Set to `production`

4. **Deploy!**

### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

📖 **Full deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

### ⚠️ Important Notes

- **Database**: This app uses SQLite which doesn't persist on Vercel's serverless platform
- **For production**: Migrate to a cloud database (Vercel Postgres, Planetscale, etc.)
- **Default credentials**: username: `admin`, password: `admin123` (change after first login!)

## Project Structure

```
├── api/              # Vercel serverless functions
├── src/              # React frontend source
├── server.ts         # Express server (local development)
├── vercel.json       # Vercel deployment configuration
└── DEPLOYMENT.md     # Detailed deployment guide
```

## Features

- 🔐 Authentication with JWT
- 📊 Dashboard with analytics
- 📦 Product management
- 👥 Customer management
- 🧾 Invoice/Billing system
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast development with Vite
