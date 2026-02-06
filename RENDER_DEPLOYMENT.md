# Render Deployment Guide

## Deploy to Render (Frontend + Backend Together)

### Unified Deployment (Recommended)
Both frontend and backend now run together in a single Render Web Service, just like local development!

1. **Create Render Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New** → **Web Service**
   - Connect your GitHub repo

2. **Configure Build Settings:**
   - **Name:** `grasp-hackathon` (or your choice)
   - **Root Directory:** `learning-tutor-backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

3. **Environment Variables:**
   - **GROQ_API_KEY:** Your Groq API key
   - **NODE_ENV:** production

4. **Deploy:**
   - Click **Create Web Service**
   - Render will build the frontend, copy it to backend, and start the server

### What Happens During Build:
1. `npm install` installs backend dependencies
2. `npm run build` builds the frontend and copies to `frontend/` directory
3. Server starts and serves both frontend (static files) and backend (API)

### URLs After Deployment:
- **Full App:** `https://your-service-name.onrender.com`
- **API Health:** `https://your-service-name.onrender.com/health`
- **API Endpoints:** `https://your-service-name.onrender.com/analyze`

### Testing:
1. **Visit the main URL** - you should see the React app
2. **Check API health:** `/health` endpoint
3. **Test the app** - paste code and get AI tutoring!

### Benefits:
- ✅ **Single service** - simpler deployment
- ✅ **No CORS issues** - both run on same domain
- ✅ **Just like local dev** - frontend and backend together
- ✅ **Free tier available**

**This is the cleanest setup - one service, everything works together!** 🎉
