# Vercel Deployment Guide

## Environment Variables Required

You need to set these environment variables in your Vercel project settings:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following variables:

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Use these values for the environment variables above

## Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy

## Troubleshooting

If the app still doesn't work:
1. Check Vercel build logs for errors
2. Ensure all environment variables are set correctly
3. Verify your Supabase project is active and accessible 