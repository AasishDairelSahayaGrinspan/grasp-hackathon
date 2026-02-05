# Learning-First AI Coding Tutor - Backend

The **shared AI brain** for the entire Learning Tutor system. Both the web frontend and VS Code extension communicate with this single backend.

## 🎯 Core Philosophy

**We NEVER give students complete code solutions.**  
We help them LEARN by explaining concepts, using analogies, and providing progressive hints.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create your .env file
cp .env.example .env

# (Optional) Add your OpenAI API key to .env
# The system works without it using fallback responses!

# Start the development server
npm run dev
```

## 📁 Project Structure

```
learning-tutor-backend/
├── src/
│   ├── index.js              # Express server entry point
│   ├── routes/
│   │   └── analyze.js        # POST /analyze endpoint
│   ├── services/
│   │   └── aiService.js      # AI integration + fallback logic
│   ├── prompts/
│   │   └── analysisPrompts.js # AI prompt templates
│   └── utils/
│       ├── validators.js     # Request validation
│       ├── complexityAnalyzer.js # Time complexity heuristics
│       └── errorDetector.js  # Code error detection
├── .env.example              # Environment variable template
├── .env                      # Your local environment (git ignored)
└── package.json
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```
Returns server status. Use this to verify the backend is running.

### Analyze Code
```
POST /analyze
```

**Request Body:**
```json
{
  "code": "def add(a, b):\n  return a + b",
  "language": "python",
  "level": "basic",
  "hintLevel": 1
}
```

**Parameters:**
- `code` (string, required): The student's code to analyze
- `language` (string, required): One of `python`, `c`, `cpp`, `java`
- `level` (string, required): Student level - `basic`, `moderate`, `complex`
- `hintLevel` (number, optional): Hint strength 1-5 (default: 1)

**Response:**
```json
{
  "explanation": "Conceptual explanation of the issue (NO CODE)",
  "analogy": "Real-world analogy to help understanding",
  "hint": "Progressive hint based on hintLevel (NO CODE)",
  "hintLevel": 1,
  "complexity": {
    "best": "O(1)",
    "worst": "O(1)",
    "average": "O(1)",
    "explanation": "No loops detected"
  },
  "detectedErrors": []
}
```

## 🛡️ Safety Features

1. **AI Prompt Engineering**: The system prompt strictly forbids code generation
2. **Response Sanitization**: Any code that slips through is automatically removed
3. **Fallback Responses**: Works without AI using heuristic-based feedback

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `OPENAI_API_KEY` | OpenAI API key for AI features | No* |
| `NODE_ENV` | `development` or `production` | No |

*The system works without an API key using intelligent fallback responses.

## 🧪 Testing

```bash
# Test the health endpoint
curl http://localhost:3001/health

# Test the analyze endpoint
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "for i in range(10)\n  print(i)",
    "language": "python",
    "level": "basic",
    "hintLevel": 1
  }'
```

## 📝 Adding New Languages

1. Add the language to `SUPPORTED_LANGUAGES` in `validators.js`
2. Add detection patterns in `errorDetector.js`
3. Add language context in `analysisPrompts.js`
4. Update complexity patterns in `complexityAnalyzer.js` if needed

---

Built with ❤️ for students who want to LEARN, not just copy.
