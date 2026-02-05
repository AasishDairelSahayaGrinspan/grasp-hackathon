/**
 * Learning-First AI Coding Tutor - Professional Chat Interface
 *
 * A professional tutor that helps students LEARN through interactive conversation
 */

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { analyzeCode, checkHealth } from './services/api';
import { getProgress, updateProgress, addTimeSpent, formatTime } from './services/progress';
import { initVoices, speak, stopSpeaking, isSpeaking } from './services/voice';
import './App.css';

// Language options with Monaco language IDs
const LANGUAGES = [
  { value: 'python', label: 'Python', monacoId: 'python' },
  { value: 'c', label: 'C', monacoId: 'c' },
  { value: 'cpp', label: 'C++', monacoId: 'cpp' },
  { value: 'java', label: 'Java', monacoId: 'java' }
];

// Difficulty levels
const LEVELS = [
  { value: 'basic', label: 'Beginner', description: 'Gentle hints for beginners' },
  { value: 'moderate', label: 'Intermediate', description: 'Balanced guidance' },
  { value: 'complex', label: 'Advanced', description: 'Challenge mode' }
];

// Default code samples for each language
const DEFAULT_CODE = {
  python: `# Write your Python code here
def greet(name):
    print("Hello, " + name)

greet("World")`,
  c: `// Write your C code here
#include <stdio.h>

int main() {
    printf("Hello, World!");
    return 0;
}`,
  cpp: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  java: `// Write your Java code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
};

// Features data for landing page
const FEATURES = [
  {
    icon: '🧠',
    title: 'Learning-First Approach',
    description: 'We never give you the answer. Instead, we guide you to discover solutions through hints and explanations.'
  },
  {
    icon: '💬',
    title: 'Interactive Chat',
    description: 'Have a natural conversation with your AI tutor. Ask questions, get hints, and learn at your own pace.'
  },
  {
    icon: '🔊',
    title: 'Voice Explanations',
    description: 'Listen to explanations with our text-to-speech feature. Perfect for auditory learners.'
  },
  {
    icon: '🌐',
    title: 'Multi-Language Support',
    description: 'Learn Python, C, C++, and Java with language-specific guidance and best practices.'
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    description: 'Track your learning journey with detailed statistics on questions asked and time spent.'
  },
  {
    icon: '🎯',
    title: 'Adaptive Difficulty',
    description: 'Choose your skill level - Beginner, Intermediate, or Advanced - for personalized hints.'
  }
];

// Landing Page Component
function LandingPage({ onStartLearning }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">AI-Powered Learning</div>
          <h1 className="hero-title">
            CodeMentor<span className="highlight">AI</span>
          </h1>
          <p className="hero-subtitle">
            The intelligent coding tutor that helps you <strong>learn</strong>, not just copy.
            Master programming through guided discovery and interactive conversations.
          </p>
          <div className="hero-actions">
            <button className="cta-button primary" onClick={onStartLearning}>
              Start Learning Now
              <span className="arrow">→</span>
            </button>
            <button className="cta-button secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">4</span>
              <span className="stat-text">Languages</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">3</span>
              <span className="stat-text">Skill Levels</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">∞</span>
              <span className="stat-text">Learning</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="code-preview">
            <div className="code-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="file-name">main.py</span>
            </div>
            <pre className="code-content">
{`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# AI Tutor says:
# "Think about what happens when
#  you call this with n=5..."`}
            </pre>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Why Choose CodeMentorAI?</h2>
          <p>Built for learners who want to truly understand programming, not just memorize solutions.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to better coding skills</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Write Your Code</h3>
            <p>Paste or write your code in our Monaco-powered editor with syntax highlighting.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Ask Questions</h3>
            <p>Chat with the AI tutor about your code. Ask for hints, explanations, or analysis.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Learn & Grow</h3>
            <p>Understand your mistakes through analogies and guided hints. Build real skills.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Learn Coding the Right Way?</h2>
        <p>Join thousands of learners who are building real programming skills with CodeMentorAI.</p>
        <button className="cta-button primary large" onClick={onStartLearning}>
          Launch Tutor
          <span className="arrow">→</span>
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 CodeMentorAI - Learning First, Always</p>
      </footer>
    </div>
  );
}

function App() {
  // State for page navigation
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' or 'tutor'

  // Tutor State
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [language, setLanguage] = useState('python');
  const [level, setLevel] = useState('basic');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Coding Tutor. Paste your code in the editor and ask me any questions. I\'ll help you understand your mistakes and guide you to the solution without giving away the answer.',
      timestamp: new Date()
    }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [progress, setProgress] = useState(getProgress());
  const [sessionTime, setSessionTime] = useState(0);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);

  // Refs
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));

    // Initialize voice
    initVoices();

    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionTime(prev => {
        const newTime = prev + 1;
        // Save every 30 seconds
        if (newTime % 30 === 0) {
          addTimeSpent(30);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      addTimeSpent(sessionTime % 30); // Save remaining time
      stopSpeaking();
    };
  }, []);

  // Update code when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
  };

  // Handle user submitting a question or requesting analysis
  const handleSendMessage = async () => {
    const message = userMessage.trim();

    if (!message && !code.trim()) {
      return;
    }

    // Add user message to chat
    const userMsg = {
      role: 'user',
      content: message || 'Please analyze my code',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserMessage('');
    setLoading(true);

    try {
      // Send code and message to backend for analysis
      const response = await analyzeCode({
        code,
        language,
        level,
        hintLevel: 1,
        userQuestion: message
      });

      // Create assistant response based on the analysis
      let assistantMessage = '';

      if (response.explanation) {
        assistantMessage += `${response.explanation}\n\n`;
      }

      if (response.analogy) {
        assistantMessage += `💡 **Think of it like this:** ${response.analogy}\n\n`;
      }

      if (response.hint) {
        assistantMessage += `🔑 **Hint:** ${response.hint}`;
      }

      const assistantMsg = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
        rawResponse: response
      };

      setChatMessages(prev => [...prev, assistantMsg]);

      // Update progress
      const newProgress = updateProgress(language, level, 1);
      setProgress(newProgress);

      // Auto-speak if enabled
      if (autoSpeak) {
        speakMessage(assistantMessage);
      }

    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `I'm having trouble analyzing your code right now. Error: ${err.message}`,
        timestamp: new Date(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      messageInputRef.current?.focus();
    }
  };

  // Handle Enter key in message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const handleQuickAction = (action) => {
    let message = '';
    switch (action) {
      case 'analyze':
        message = 'Please analyze my code for any issues';
        break;
      case 'explain':
        message = 'Can you explain what this code does?';
        break;
      case 'hint':
        message = 'Give me a hint about what might be wrong';
        break;
      case 'logic':
        message = 'Help me understand the logic of this code';
        break;
    }
    setUserMessage(message);
  };

  // Voice control
  const speakMessage = (text) => {
    stopSpeaking();
    // Remove markdown and emojis for cleaner voice output
    const cleanText = text.replace(/\*\*/g, '').replace(/💡/g, '').replace(/🔑/g, '');
    speak(cleanText);
    setIsSpeakingNow(true);

    // Check when speaking ends
    const checkSpeaking = setInterval(() => {
      if (!isSpeaking()) {
        setIsSpeakingNow(false);
        clearInterval(checkSpeaking);
      }
    }, 100);
  };

  const toggleSpeaking = () => {
    if (isSpeakingNow) {
      stopSpeaking();
      setIsSpeakingNow(false);
    } else {
      const lastAssistantMsg = [...chatMessages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMsg) {
        speakMessage(lastAssistantMsg.content);
      }
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return '#10b981';
      case 'disconnected': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  // If on landing page, show landing page
  if (currentPage === 'landing') {
    return <LandingPage onStartLearning={() => setCurrentPage('tutor')} />;
  }

  // Tutor Interface
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 onClick={() => setCurrentPage('landing')} style={{ cursor: 'pointer' }}>
              CodeMentor<span className="highlight-text">AI</span>
            </h1>
            <p className="tagline">Learn programming through guided conversation</p>
          </div>
          <div className="header-right">
            <div className="status-badge" style={{ backgroundColor: getStatusColor() }}>
              {backendStatus === 'connected' ? '● Connected' :
               backendStatus === 'disconnected' ? '● Offline' : '● Checking...'}
            </div>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Left Panel - Code Editor */}
        <aside className="editor-sidebar">
          <div className="editor-header">
            <h2>Code Editor</h2>
            <div className="editor-controls">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="select-input"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="select-input"
              >
                {LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={LANGUAGES.find(l => l.value === language)?.monacoId}
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 10, bottom: 10 }
              }}
            />
          </div>

          <div className="editor-footer">
            <div className="stats">
              <span>{code.length} characters</span>
              <span>•</span>
              <span>{code.split('\n').length} lines</span>
            </div>
          </div>
        </aside>

        {/* Right Panel - Chat Interface */}
        <main className="chat-container">
          <div className="chat-header">
            <h2>Conversation</h2>
            <div className="chat-controls">
              <button
                onClick={toggleSpeaking}
                className={`icon-button ${isSpeakingNow ? 'active' : ''}`}
                title={isSpeakingNow ? 'Stop speaking' : 'Read last message aloud'}
              >
                {isSpeakingNow ? '🔊' : '🔈'}
              </button>
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`icon-button ${autoSpeak ? 'active' : ''}`}
                title="Auto-speak responses"
              >
                {autoSpeak ? '🔔' : '🔕'}
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-header">
                  <span className="message-role">
                    {msg.role === 'user' ? 'You' : 'AI Tutor'}
                  </span>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-header">
                  <span className="message-role">AI Tutor</span>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="quick-actions">
              <button onClick={() => handleQuickAction('analyze')} className="quick-btn">
                Analyze Code
              </button>
              <button onClick={() => handleQuickAction('explain')} className="quick-btn">
                Explain Logic
              </button>
              <button onClick={() => handleQuickAction('hint')} className="quick-btn">
                Get Hint
              </button>
            </div>

            <div className="input-row">
              <textarea
                ref={messageInputRef}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a question about your code or request analysis..."
                className="message-input"
                rows="2"
                disabled={loading || backendStatus !== 'connected'}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || backendStatus !== 'connected'}
                className="send-button"
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Footer - Progress Stats */}
      <footer className="footer">
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-label">Questions Asked</span>
            <span className="stat-value">{progress.totalAnalyses}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Hints Used</span>
            <span className="stat-value">{progress.hintsUsed}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Learning Time</span>
            <span className="stat-value">{formatTime(progress.timeSpent + sessionTime)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">This Session</span>
            <span className="stat-value">{formatTime(sessionTime)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;


