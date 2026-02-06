# Render Deployment Guide

## Deploy to Render (Frontend + Backend)

### Backend Deployment (Already Done)
- **Service:** `grasp-hackathon` (Web Service)
- **URL:** `https://grasp-hackathon.onrender.com`
- **Root Directory:** `learning-tutor-backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Frontend Deployment (New)

1. **Create New Render Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New** → **Static Site**
   - Connect your GitHub repo

2. **Configure Build Settings:**
   - **Name:** `learning-tutor-frontend`
   - **Root Directory:** `learning-tutor-frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

3. **Deploy:**
   - Click **Create Static Site**
   - Render will build and deploy automatically

### URLs After Deployment:
- **Backend API:** `https://grasp-hackathon.onrender.com`
- **Frontend App:** `https://learning-tutor-frontend.onrender.com`

### Testing:
1. **Backend:** Visit `https://grasp-hackathon.onrender.com/health`
2. **Frontend:** Visit your frontend URL and test the app

### Notes:
- Frontend automatically connects to backend via API calls
- No CORS issues since both are on Render
- Free tier available for both services
