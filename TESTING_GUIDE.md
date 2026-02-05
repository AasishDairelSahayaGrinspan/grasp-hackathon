# 🎓 Learning-First AI Coding Tutor - Complete Testing Guide

## Project Overview

This project has **3 parts**:
1. **Backend** (`learning-tutor-backend/`) - The AI brain (Node.js + Express)
2. **Frontend** (`learning-tutor-frontend/`) - Web application (React + Vite)
3. **VS Code Extension** (`learning-tutor-vscode/`) - Editor integration

---

## 🚀 How to Test Everything

### Step 1: Start the Backend (Required First!)

```bash
# Terminal 1: Start the backend
cd /Users/darrelvengeance/Documents/grasp-hackathon/learning-tutor-backend
npm install
npm run dev
```

You should see:
```
╔══════════════════════════════════════════════════════════════╗
║     🎓 Learning-First AI Coding Tutor - Backend Server       ║
╠══════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:3001                    ║
║  Health check:      http://localhost:3001/health             ║
╚══════════════════════════════════════════════════════════════╝
```

**Test the backend directly:**
```bash
# Health check
curl http://localhost:3001/health

# Test analyze endpoint
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def greet(name)\n    print(name)",
    "language": "python",
    "level": "basic",
    "hintLevel": 1
  }'
```

---

### Step 2: Start the Web Frontend

```bash
# Terminal 2: Start the frontend
cd /Users/darrelvengeance/Documents/grasp-hackathon/learning-tutor-frontend
npm install
npm run dev
```

Open your browser to: **http://localhost:5173**

**What to test:**
1. ✅ See the "Backend Connected" status (green)
2. ✅ Default Python code loads with a bug (missing colon)
3. ✅ Click "Analyze My Code" → See explanation, analogy, hint
4. ✅ Click "Need More Hint" to get stronger hints (up to level 5)
5. ✅ Switch languages (Python, C, C++, Java)
6. ✅ Switch levels (Basic, Moderate, Complex)
7. ✅ Click "Listen" for voice explanation
8. ✅ See time complexity analysis
9. ✅ Watch progress stats at the bottom

---

### Step 3: Test the VS Code Extension

```bash
# Terminal 3: Open VS Code with the extension
cd /Users/darrelvengeance/Documents/grasp-hackathon/learning-tutor-vscode
code --extensionDevelopmentPath=. ../
```

This opens VS Code in **Extension Development Mode**.

**What to test:**
1. ✅ Look for the graduation cap (🎓) icon in the Activity Bar (left side)
2. ✅ Click it to open the "Learning Tutor" sidebar
3. ✅ Open any Python/C/C++/Java file
4. ✅ Click "Analyze Current File"
5. ✅ See explanation, analogy, hint in the sidebar
6. ✅ Click "Need More Hint" for progressive hints

---

## 🔧 Optional: Add OpenAI API Key

For smarter AI responses (not required - fallback works great!):

```bash
# Edit the backend .env file
cd /Users/darrelvengeance/Documents/grasp-hackathon/learning-tutor-backend
nano .env
```

Add your key:
```
OPENAI_API_KEY=sk-your-api-key-here
```

Restart the backend after adding the key.

---

## 📋 Feature Checklist

| Feature | Web | VS Code | Status |
|---------|-----|---------|--------|
| Python support | ✅ | ✅ | Ready |
| C support | ✅ | ✅ | Ready |
| C++ support | ✅ | ✅ | Ready |
| Java support | ✅ | ✅ | Ready |
| Basic/Moderate/Complex levels | ✅ | ✅ | Ready |
| Progressive hints (1-5) | ✅ | ✅ | Ready |
| Explanations without code | ✅ | ✅ | Ready |
| Real-world analogies | ✅ | ✅ | Ready |
| Time complexity analysis | ✅ | ✅ | Ready |
| Syntax highlighting (Monaco) | ✅ | Native | Ready |
| Voice explanation (female) | ✅ | ❌ | Web only |
| Progress tracking | ✅ | ❌ | Web only |
| Color-coded feedback | ✅ | ✅ | Ready |
| Works without API key | ✅ | ✅ | Ready |

---

## 🐛 Troubleshooting

### "Backend Offline" in frontend
- Make sure the backend is running on port 3001
- Check: `curl http://localhost:3001/health`

### VS Code extension not showing
- Make sure you opened VS Code with `--extensionDevelopmentPath`
- Press `Cmd+Shift+P` → "Developer: Reload Window"

### No response from analyze
- Check the backend terminal for errors
- Ensure the code field is not empty

---

## 🎯 Core Rule Verification

**THE SYSTEM NEVER GIVES CODE SOLUTIONS.**

Test this by:
1. Submitting broken code
2. Verify the response only contains:
   - Conceptual explanations
   - Real-world analogies
   - Progressive hints
   - **NO corrected code**

---

## 📁 Project Structure

```
grasp-hackathon/
├── learning-tutor-backend/     # Node.js + Express API
│   ├── src/
│   │   ├── index.js           # Server entry
│   │   ├── routes/analyze.js  # /analyze endpoint
│   │   ├── services/aiService.js
│   │   ├── prompts/analysisPrompts.js
│   │   └── utils/
│   └── package.json
│
├── learning-tutor-frontend/    # React + Vite Web App
│   ├── src/
│   │   ├── App.jsx            # Main component
│   │   ├── App.css            # Styles
│   │   └── services/          # API, progress, voice
│   └── package.json
│
└── learning-tutor-vscode/      # VS Code Extension
    ├── src/extension.ts       # Extension code
    ├── media/icon.svg         # Sidebar icon
    └── package.json           # Extension manifest
```

---

**Built with ❤️ for students who want to LEARN, not just copy!**
