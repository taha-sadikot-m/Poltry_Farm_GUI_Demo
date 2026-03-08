# Deployment Guide - Vercel

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Git installed on your system

## Important Notes

### ⚠️ Database Limitation
This application currently uses SQLite, which **will not persist data** on Vercel's serverless environment. The database is stored in `/tmp` which is ephemeral and cleared between function invocations.

**Recommended Solutions:**
1. **Vercel Postgres** (Recommended) - Native Vercel database solution
2. **Planetscale** - MySQL-compatible serverless database
3. **Supabase** - PostgreSQL with additional features
4. **MongoDB Atlas** - NoSQL option

For production use, you **must** migrate to a cloud database.

## Deployment Steps

### 1. Install Vercel CLI (Optional but recommended)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard (Easiest Method)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to https://vercel.com/new
3. Import your repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add environment variables (see below)
6. Click "Deploy"

### 3. Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Environment Variables

Set these in your Vercel project settings (Settings → Environment Variables):

| Variable | Value | Description |
|----------|-------|-------------|
| `JWT_SECRET` | (your secret key) | Secret key for JWT token signing |
| `NODE_ENV` | `production` | Environment mode |

**Note**: Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Post-Deployment

### Access Your Application
After deployment, Vercel will provide a URL like: `https://your-app-name.vercel.app`

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials immediately after first login!

## Troubleshooting

### API Routes Not Working
- Ensure all `/api/*` routes are properly configured in `vercel.json`
- Check Vercel function logs in the dashboard

### Database Issues
- Remember: SQLite data is **not persistent** on Vercel
- Migrate to a cloud database for production use

### Build Failures
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Local Development

To test locally:
```bash
npm install
npm run dev
```

The application will run on http://localhost:3000

## Continuous Deployment

Once connected to Git:
- Every push to the main branch = Production deployment
- Every push to other branches = Preview deployment

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set environment variables
3. ⚠️ Migrate to a cloud database
4. ✅ Test all functionality
5. ✅ Change default admin credentials
6. ✅ Configure custom domain (optional)

## Support

For issues specific to Vercel deployment:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
