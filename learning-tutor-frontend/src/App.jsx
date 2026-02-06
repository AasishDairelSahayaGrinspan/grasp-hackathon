/**
 * Learning-First AI Coding Tutor - Professional Chat Interface
 *
 * A professional tutor that helps students LEARN through interactive conversation
 */

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { analyzeCode, checkHealth, runCode, analyzeProblemImage } from './services/api';
import { getProgress, updateProgress, addTimeSpent, formatTime, getLearningState, updateLearningState, resetSessionState } from './services/progress';
import { getAvailableSounds, playSound, stopSound, setVolume } from './services/sounds';
import './App.css';

// UI Icons as SVG components for professional look
const Icons = {
  // Stats & Navigation Icons
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  lightbulb: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  pause: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  play: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  refresh: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6"/>
      <path d="M1 20v-6h6"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  chartBar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  chartUp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="23" y1="6" x2="17" y2="12"/>
      <polyline points="17 6 23 6 23 12"/>
      <line x1="1" y1="18" x2="23" y2="18"/>
      <polyline points="3 14 9 8 13 12 17 6"/>
    </svg>
  ),
  sun: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  moon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  // Action Icons
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  book: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  sparkles: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
      <path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z"/>
      <path d="M19 5l.5 1.5L21 7l-1.5.5L19 9l-.5-1.5L17 7l1.5-.5L19 5z"/>
    </svg>
  ),
  camera: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  loader: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  send: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  // Voice Icons
  volumeHigh: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  volumeLow: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  bellOff: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
      <path d="M18 8a6 6 0 0 0-9.33-5"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  // Sound control icons
  volume2: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  headphones: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  ),
  volumeX: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  ),
  // Feature Icons
  brain: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54"/>
    </svg>
  ),
  messageSquare: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  volume: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  globe: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  trendingUp: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  rocket: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  playCircle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="10 8 16 12 10 16 10 8"/>
    </svg>
  )
};

// Language Icons as SVG components
const LanguageIcons = {
  python: (
    <svg viewBox="0 0 128 128" width="20" height="20">
      <linearGradient id="python-original-a" gradientUnits="userSpaceOnUse" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)">
        <stop offset="0" stopColor="#5A9FD4"/>
        <stop offset="1" stopColor="#306998"/>
      </linearGradient>
      <linearGradient id="python-original-b" gradientUnits="userSpaceOnUse" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)">
        <stop offset="0" stopColor="#FFD43B"/>
        <stop offset="1" stopColor="#FFE873"/>
      </linearGradient>
      <path fill="url(#python-original-a)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z"/>
      <path fill="url(#python-original-b)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z"/>
    </svg>
  ),
  c: (
    <svg viewBox="0 0 128 128" width="20" height="20">
      <path fill="#659AD3" d="M115.4 30.7L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.7z"/>
      <path fill="#03599C" d="M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8l-106.6 62z"/>
      <path fill="#fff" d="M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8l-12.9-7.6z"/>
    </svg>
  ),
  cpp: (
    <svg viewBox="0 0 128 128" width="20" height="20">
      <path fill="#659AD3" d="M115.4 30.7L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.7z"/>
      <path fill="#03599C" d="M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8l-106.6 62z"/>
      <path fill="#fff" d="M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8l-12.9-7.6z"/>
      <path fill="#fff" d="M82 58h-5v-5h-5v5h-5v5h5v5h5v-5h5zM102 58h-5v-5h-5v5h-5v5h5v5h5v-5h5z"/>
    </svg>
  ),
  java: (
    <svg viewBox="0 0 128 128" width="20" height="20">
      <path fill="#0074BD" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z"/>
      <path fill="#EA2D2E" d="M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z"/>
      <path fill="#0074BD" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z"/>
      <path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z"/>
      <path fill="#0074BD" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z"/>
    </svg>
  )
};

// Language options with Monaco language IDs
const LANGUAGES = [
  { value: 'python', label: 'Python', monacoId: 'python' },
  { value: 'c', label: 'C', monacoId: 'c' },
  { value: 'cpp', label: 'C++', monacoId: 'cpp' },
  { value: 'java', label: 'Java', monacoId: 'java' }
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
    icon: 'brain',
    title: 'Learning-First Approach',
    description: 'We never give you the answer. Instead, we guide you to discover solutions through hints and explanations.'
  },
  {
    icon: 'messageSquare',
    title: 'Interactive Chat',
    description: 'Have a natural conversation with your AI tutor. Ask questions, get hints, and learn at your own pace.'
  },
  {
    icon: 'volume',
    title: 'Voice Explanations',
    description: 'Listen to explanations with our text-to-speech feature. Perfect for auditory learners.'
  },
  {
    icon: 'globe',
    title: 'Multi-Language Support',
    description: 'Learn Python, C, C++, and Java with language-specific guidance and best practices.'
  },
  {
    icon: 'trendingUp',
    title: 'Progress Tracking',
    description: 'Track your learning journey with detailed statistics on questions asked and time spent.'
  },
  {
    icon: 'rocket',
    title: 'Step-by-Step Guidance',
    description: 'Get clear, structured help with syntax examples to guide you through any problem.'
  }
];

/**
 * Render markdown content with proper code block formatting
 * Handles ```language code``` blocks and inline `code`
 */
function renderMarkdown(content) {
  if (!content) return null;

  const parts = [];
  let key = 0;

  // Process code blocks first (```language\ncode```)
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      parts.push(...renderTextWithInlineCode(textBefore, key));
      key += 100;
    }

    // Add the code block
    const language = match[1] || 'plaintext';
    const code = match[2].trim();
    parts.push(
      <div key={`code-${key++}`} className="code-block">
        <div className="code-block-header">
          <span className="code-language">{language}</span>
        </div>
        <pre className="code-block-content">
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last code block
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    parts.push(...renderTextWithInlineCode(remainingText, key));
  }

  // If no code blocks were found, just render with inline code
  if (parts.length === 0) {
    return renderTextWithInlineCode(content, 0);
  }

  return parts;
}

/**
 * Render text with inline code (`code`) and line breaks
 */
function renderTextWithInlineCode(text, startKey) {
  const parts = [];
  let key = startKey;

  // Split by lines first
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      // Don't add break for empty lines at the start
      if (line.trim() || lineIndex > 0) {
        parts.push(<br key={`br-${key++}`} />);
      }
    }

    // Process inline code in each line
    const inlineCodeRegex = /`([^`]+)`/g;
    let lastIdx = 0;
    let inlineMatch;

    while ((inlineMatch = inlineCodeRegex.exec(line)) !== null) {
      // Text before inline code
      if (inlineMatch.index > lastIdx) {
        parts.push(
          <span key={`text-${key++}`}>
            {renderBoldAndItalic(line.slice(lastIdx, inlineMatch.index))}
          </span>
        );
      }

      // Inline code
      parts.push(
        <code key={`inline-${key++}`} className="inline-code">
          {inlineMatch[1]}
        </code>
      );

      lastIdx = inlineMatch.index + inlineMatch[0].length;
    }

    // Remaining text after last inline code
    if (lastIdx < line.length) {
      parts.push(
        <span key={`text-${key++}`}>
          {renderBoldAndItalic(line.slice(lastIdx))}
        </span>
      );
    }
  });

  return parts;
}

/**
 * Render bold (**text**) and italic (*text*) formatting
 */
function renderBoldAndItalic(text) {
  // Handle **bold**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    parts.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>);
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts.length > 0 ? parts : text;
}

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
              <div className="feature-icon">{Icons[feature.icon]}</div>
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
  // State for page navigation - 'landing', 'editor', or 'chat'
  const [currentPage, setCurrentPage] = useState('landing');

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useState(() => localStorage.getItem('ui_theme') || (prefersDark ? 'dark' : 'light'));

  // Tutor State
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [language, setLanguage] = useState('python');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hey there! I\'m your AI Coding Mentor.\n\nI\'m here to help you learn and understand programming better. You can ask me questions about your code, request hints when you\'re stuck, or just have a conversation about coding concepts.\n\nFeel free to use the Quick Actions menu above, or simply type your question. What would you like to work on today?',
      timestamp: new Date()
    }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [codeOutput, setCodeOutput] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  // Progress tracking (still saved to localStorage even if not displayed)
  // eslint-disable-next-line no-unused-vars
  const [progress, setProgress] = useState(getProgress());
  const [sessionTime, setSessionTime] = useState(0);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageName, setUploadedImageName] = useState('');
  const [uploadedImageText, setUploadedImageText] = useState('');

  // Learning state for pedagogical tracking
  const [learningState, setLearningState] = useState(getLearningState());

  // Resizable panel state
  const [editorWidth, setEditorWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);

  // Timer control state
  const [showTimer, setShowTimer] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false); // Timer doesn't start automatically

  // Sound state
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [currentSoundId, setCurrentSoundId] = useState(null);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const availableSounds = getAvailableSounds();

  // Refs
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const resizeRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));

    // Reset session-specific learning state (but keep mastered concepts)
    const newState = resetSessionState();
    setLearningState(newState);
  }, []);

  // Session timer - controlled by timerRunning state
  useEffect(() => {
    if (timerRunning) {
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
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        addTimeSpent(sessionTime % 30); // Save remaining time
      }
    };
  }, [timerRunning]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ui_theme', theme);
  }, [theme]);

  // Handle panel resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(300, Math.min(700, e.clientX));
      setEditorWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Handle resize start
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  // Update code when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
  };

  const buildMentorResponse = ({ response }) => {
    // Use the natural reply from the LLM
    if (response?.reply) {
      return response.reply;
    }

    // Fallback if no reply (shouldn't happen with new system)
    return "I'm here to help! What would you like to know about your code?";
  };

  // Detect if message contains code
  const isCodePasted = (text) => {
    const codePatterns = [
      /\b(def|class|import|from|if|for|while|return)\s/i, // Python
      /\b(int|void|public|private|static|class)\s/i, // Java/C/C++
      /[{}\[\]();=<>]/g, // Common code symbols
      /\n.*[=+\-*/].*/g, // Multi-line with operators
    ];

    const hasMultipleLines = (text.match(/\n/g) || []).length >= 2;
    const hasCodePatterns = codePatterns.some(pattern => pattern.test(text));

    return hasMultipleLines && hasCodePatterns;
  };

  // Handle user submitting a question or requesting analysis
  const handleSendMessage = async () => {
    const message = userMessage.trim();

    if (!message && !code.trim()) {
      return;
    }

    // Check if user pasted code in the chat
    const isPastedCode = isCodePasted(message);

    // Add user message to chat
    const userMsg = {
      role: 'user',
      content: message || 'Please analyze my code',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserMessage('');

    // If code was pasted, automatically trigger explanation
    if (isPastedCode && message && !message.toLowerCase().includes('explain') && !message.toLowerCase().includes('analyze')) {
      setLoading(true);

      try {
        const response = await analyzeCode({
          code: message,
          language,
          level: 'moderate',
          hintLevel: 1,
          userQuestion: 'Please explain what this code does step by step',
          learningState  // Include learning state for pedagogical awareness
        });

        const assistantMessage = buildMentorResponse({ response });

        const assistantMsg = {
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date(),
          rawResponse: response
        };

        setChatMessages(prev => [...prev, assistantMsg]);

        // Update learning state based on response
        const newLearningState = updateLearningState(response, null, false);
        setLearningState(newLearningState);

        const newProgress = updateProgress(language, 'moderate', 1);
        setProgress(newProgress);
      } catch (err) {
        const errorMsg = {
          role: 'assistant',
          content: `Oops! I ran into a little trouble: ${err.message}\n\nNo worries though! Try again and I'll do my best to help you out.`,
          timestamp: new Date(),
          isError: true
        };
        setChatMessages(prev => [...prev, errorMsg]);
      } finally {
        setLoading(false);
        messageInputRef.current?.focus();
      }
      return;
    }

    setLoading(true);

    try {
      // Detect what user is asking about to provide better context
      const userQuestionLower = message.toLowerCase();
      let contextMessage = message;

      if (uploadedImageText) {
        contextMessage = `${contextMessage}\n\nProblem statement (OCR): ${uploadedImageText}`;
      }

      // Enhance message with code context awareness
      if (userQuestionLower.includes('error') || userQuestionLower.includes('wrong') || userQuestionLower.includes('bug')) {
        contextMessage = `${contextMessage} (Looking at the ${language} code in the editor)`;
      } else if (userQuestionLower.includes('what does') || userQuestionLower.includes('explain') || userQuestionLower.includes('understand')) {
        contextMessage = `${contextMessage} (Please explain the ${language} code I have)`;
      } else if (userQuestionLower.includes('how') || userQuestionLower.includes('logic')) {
        contextMessage = `${contextMessage} (Help me understand how this code works)`;
      } else if (userQuestionLower.includes('fix') || userQuestionLower.includes('correct')) {
        contextMessage = `${contextMessage} (Guide me to fix this code, don't give the answer)`;
      }

      // Detect if this is a hint request for learning state tracking
      const isHintRequest = userQuestionLower.includes('hint') || userQuestionLower.includes('help') || userQuestionLower.includes('stuck');

      // Send code and message to backend for analysis with learning state
      const response = await analyzeCode({
        code,
        language,
        level: 'moderate',
        hintLevel: 1,
        userQuestion: contextMessage,
        learningState  // Include learning state for pedagogical awareness
      });

      const assistantMessage = buildMentorResponse({
        response
      });

      const assistantMsg = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
        rawResponse: response
      };

      setChatMessages(prev => [...prev, assistantMsg]);

      // Update learning state based on response
      const newLearningState = updateLearningState(response, response?.errorType, isHintRequest);
      setLearningState(newLearningState);

      // Update progress
      const newProgress = updateProgress(language, 'moderate', 1);
      setProgress(newProgress);

    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `Oops! I ran into a little trouble: ${err.message}\n\nNo worries though! Try again and I'll do my best to help you out.`,
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

  // Quick action buttons with friendly messages
  const handleQuickAction = (action) => {
    let message = '';
    switch (action) {
      case 'analyze':
        message = 'Hey, can you analyze my code and tell me if there are any issues?';
        break;
      case 'explain':
        message = 'I want to understand what this code does. Can you walk me through it?';
        break;
      case 'hint':
        message = 'I\'m stuck! Give me a hint about what might be wrong here.';
        break;
      case 'logic':
        message = 'Help me understand the logic and flow of this code. How does it actually work?';
        break;
    }
    setUserMessage(message);
  };

  // Run code handler
  const handleRunCode = async () => {
    if (!code.trim() || running) return;

    setRunning(true);
    setShowOutput(true);
    setCodeOutput({ status: 'running', output: '', error: '' });

    try {
      const result = await runCode({ code, language });

      setCodeOutput({
        status: result.success ? 'success' : 'error',
        output: result.output || '',
        error: result.error || '',
        executionTime: result.executionTime
      });
    } catch (err) {
      setCodeOutput({
        status: 'error',
        output: '',
        error: err.message || 'Failed to execute code'
      });
    } finally {
      setRunning(false);
    }
  };

  // Image analysis handler
  const handleAnalyzeImage = async (file) => {
    console.log('handleAnalyzeImage called with file:', file);

    if (!file) {
      console.log('No file provided');
      return;
    }

    if (imageUploading) {
      console.log('Already uploading, skipping');
      return;
    }

    console.log('Starting image upload:', file.name, file.type, file.size);
    setImageUploading(true);
    setUploadedImageName(file.name);

    try {
      console.log('Calling analyzeProblemImage API...');
      const response = await analyzeProblemImage(file, 'moderate');
      console.log('API response:', response);

      // Store the extracted text for context in future questions
      setUploadedImageText(response.extractedText || '');

      // Use the message from backend, or provide a default
      const messageContent = response.message || (
        response.extractedText
          ? 'Got it! I can see the problem. What would you like help with?'
          : 'I couldn\'t read this image clearly. Try a cleaner screenshot of just the problem text.'
      );

      const assistantMsg = {
        role: 'assistant',
        content: `[Image received] ${messageContent}`,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Image upload error:', err);
      const errorMsg = {
        role: 'assistant',
        content: `Hmm, I had trouble with that image. ${err.message}\n\nTips for better results:\n• Crop to show only the problem statement\n• Make sure text is clear and readable\n• Avoid capturing browser UI elements`,
        timestamp: new Date(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMsg]);
      setUploadedImageName('');
    } finally {
      setImageUploading(false);
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

  // Tutor Interface - Side by Side Layout
  return (
    <div className="app">
      {/* Top Stats Bar */}
      <div className="stats-bar">
        <div className="stats-left">
          <h1 onClick={() => setCurrentPage('landing')} style={{ cursor: 'pointer' }}>
            CodeMentor<span className="highlight-text">AI</span>
          </h1>
        </div>
        <div className="stats-center">
          {showTimer && (
            <div className="stat-item timer-item">
              <span className="stat-icon">{Icons.clock}</span>
              <span className="stat-value">{formatTime(sessionTime)}</span>
              <span className="stat-label">Session</span>
              <div className="timer-controls">
                <button
                  className="timer-btn"
                  onClick={() => setTimerRunning(!timerRunning)}
                  title={timerRunning ? 'Pause timer' : 'Resume timer'}
                >
                  {timerRunning ? Icons.pause : Icons.play}
                </button>
                <button
                  className="timer-btn"
                  onClick={() => setSessionTime(0)}
                  title="Reset timer"
                >
                  {Icons.refresh}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="stats-right">
          {/* Ambient Sounds Button */}
          <div className="sound-menu-container">
            <button
              className={`sound-toggle-btn ${soundPlaying ? 'active' : ''}`}
              onClick={() => setShowSoundMenu(!showSoundMenu)}
              title="Ambient Sounds"
            >
              {soundPlaying ? Icons.volume2 : Icons.headphones}
            </button>

            {showSoundMenu && (
              <div className="sound-menu">
                <div className="sound-menu-header">
                  <span>Ambient Sounds</span>
                  {soundPlaying && (
                    <button
                      className="sound-stop-btn"
                      onClick={() => {
                        stopSound();
                        setSoundPlaying(false);
                        setCurrentSoundId(null);
                      }}
                    >
                      {Icons.volumeX}
                    </button>
                  )}
                </div>

                <div className="sound-list">
                  {availableSounds.map(sound => (
                    <button
                      key={sound.id}
                      className={`sound-item ${currentSoundId === sound.id ? 'active' : ''}`}
                      onClick={() => {
                        if (currentSoundId === sound.id && soundPlaying) {
                          stopSound();
                          setSoundPlaying(false);
                          setCurrentSoundId(null);
                        } else {
                          playSound(sound.id);
                          setSoundPlaying(true);
                          setCurrentSoundId(sound.id);
                        }
                      }}
                    >
                      <span className="sound-icon">{sound.icon}</span>
                      <span className="sound-name">{sound.name}</span>
                    </button>
                  ))}
                </div>

                <div className="sound-volume">
                  <span className="volume-label">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume * 100}
                    onChange={(e) => {
                      const newVolume = e.target.value / 100;
                      setSoundVolume(newVolume);
                      setVolume(newVolume);
                    }}
                    className="volume-slider"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            className="stats-toggle-btn"
            onClick={() => setShowTimer(!showTimer)}
            title={showTimer ? 'Hide timer' : 'Show timer'}
          >
            {showTimer ? Icons.chartBar : Icons.chartUp}
          </button>
          <button
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? Icons.sun : Icons.moon}
          </button>
          <div className="status-dot" style={{ backgroundColor: getStatusColor() }} title={backendStatus}></div>
        </div>
      </div>

      <div className="main-container">
        {/* Left Panel - Code Editor */}
        <aside className="editor-sidebar" style={{ width: editorWidth }}>
          <div className="editor-header">
            <h2>Code Editor</h2>
            <div className="language-buttons">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.value}
                  className={`lang-btn ${language === lang.value ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(lang.value)}
                  title={lang.label}
                >
                  <span className="lang-icon">{LanguageIcons[lang.value]}</span>
                  <span className="lang-name">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={LANGUAGES.find(l => l.value === language)?.monacoId}
              value={code}
              onChange={setCode}
              theme={theme === 'dark' ? 'vs-dark' : 'vs'}
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
            <div className="editor-actions">
              <button
                className="run-button"
                onClick={handleRunCode}
                disabled={running || backendStatus !== 'connected'}
              >
                {running ? '⏳ Running...' : '▶ Run Code'}
              </button>
              <div className="stats">
                <span>{code.length} chars</span>
                <span>•</span>
                <span>{code.split('\n').length} lines</span>
              </div>
            </div>
          </div>

          {/* Code Output Panel */}
          {showOutput && (
            <div className="output-panel">
              <div className="output-header">
                <h3>Output</h3>
                <button className="close-output" onClick={() => setShowOutput(false)}>✕</button>
              </div>
              <div className={`output-content ${codeOutput?.status || ''}`}>
                {codeOutput?.status === 'running' && (
                  <div className="output-running">Running code...</div>
                )}
                {codeOutput?.status === 'success' && (
                  <>
                    <pre className="output-text">{codeOutput.output || '(No output)'}</pre>
                    <div className="output-meta">✓ Executed in {codeOutput.executionTime}ms</div>
                  </>
                )}
                {codeOutput?.status === 'error' && (
                  <>
                    {codeOutput.output && <pre className="output-text">{codeOutput.output}</pre>}
                    <pre className="output-error">{codeOutput.error}</pre>
                  </>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Resize Handle */}
        <div
          className={`resize-handle ${isResizing ? 'active' : ''}`}
          onMouseDown={handleMouseDown}
          ref={resizeRef}
        >
          <div className="resize-line"></div>
        </div>

        {/* Right Panel - Chat Interface */}
        <main className="chat-container">
          <div className="chat-header">
            <h2>AI Tutor Chat</h2>
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
                  {renderMarkdown(msg.content)}
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
            <div className="input-controls">
              <div className="actions-menu">
                <select
                  className="action-select"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      if (value === 'upload') {
                        const fileInput = document.getElementById('image-upload-input');
                        if (fileInput) {
                          fileInput.value = '';
                          fileInput.click();
                        }
                      } else {
                        handleQuickAction(value);
                      }
                      e.target.selectedIndex = 0;
                    }
                  }}
                  disabled={loading || backendStatus !== 'connected'}
                >
                  <option value="">Quick Actions</option>
                  <option value="analyze">Analyze Code</option>
                  <option value="explain">Explain Logic</option>
                  <option value="hint">Get Hint</option>
                </select>
                <button
                  className="upload-btn"
                  onClick={() => {
                    const fileInput = document.getElementById('image-upload-input');
                    if (fileInput) {
                      fileInput.value = '';
                      fileInput.click();
                    }
                  }}
                  disabled={loading || imageUploading || backendStatus !== 'connected'}
                  title="Upload a problem screenshot"
                >
                  {imageUploading ? Icons.loader : Icons.camera}
                </button>
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAnalyzeImage(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </div>
              {uploadedImageName && (
                <div className="upload-badge">
                  {imageUploading ? Icons.loader : Icons.check} {uploadedImageName}
                </div>
              )}
            </div>

            <div className="input-row">
              <textarea
                ref={messageInputRef}
                value={userMessage}
                onChange={(e) => {
                  setUserMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                }}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about your code..."
                className="message-input"
                rows="1"
                disabled={loading || backendStatus !== 'connected'}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || backendStatus !== 'connected'}
                className="send-button"
                title="Send message"
              >
                {loading ? Icons.loader : Icons.send}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

