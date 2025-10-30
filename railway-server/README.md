# Sugar Detective API - Railway Deployment

Long-running analysis API for Sugar Detective (>10 seconds), bypassing Vercel's 10s timeout limit.

## Quick Deploy to Railway

1. Go to https://railway.app and login/signup
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository: `vmaretto/sugar-detective`
4. Railway will detect Node.js and ask for root directory
5. Set root directory to: `railway-server`
6. Add environment variable: `OPENAI_API_KEY` (your OpenAI key)
7. Deploy!
8. Copy the Railway URL (e.g., `https://sugar-detective-api-production-xxxx.up.railway.app`)
9. In Vercel, add env variable: `REACT_APP_INSIGHTS_API_URL` = Railway URL
10. Redeploy Vercel

Done! Analysis will now use Railway with no timeout limits.

## Local Testing

```bash
cd railway-server
npm install
export OPENAI_API_KEY="sk-..."
npm start
```

Test: `curl http://localhost:3000/health`

## Endpoints

- `GET /health` - Health check
- `POST /api/insights` - Long-running analysis (~2-3 min)
