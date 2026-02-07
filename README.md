# 🎓 CodeMentorAI - Your Intelligent Coding Companion

<div align="center">

![CodeMentorAI Banner](https://img.shields.io/badge/CodeMentorAI-Learning_First-10a37f?style=for-the-badge&logo=openai&logoColor=white)

**Master Programming through Guided Discovery & Interactive Conversations.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_20-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![AI Powered](https://img.shields.io/badge/Powered_By-Google_Gemini-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Deploy on Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render)](https://render.com)

[**Live Demo**](https://codementor-6tuu.onrender.com/) · [**Report Bug**](https://github.com/AasishDairelSahayaGrinspan/grasp-hackathon/issues) · [**Request Feature**](https://github.com/AasishDairelSahayaGrinspan/grasp-hackathon/issues)

</div>

---

## 🚀 About The Project

**CodeMentorAI** isn't just another code completion tool. It's designed to be a **teacher**. Instead of giving you the answers outright, it guides you to the solution, helping you understand the underlying concepts and build real problem-solving skills.

Whether you're struggling with a syntax error in Python, a logic bug in C++, or just starting your journey with Java, CodeMentorAI is here to help you **learn, not just copy**.

### ✨ Key Features

*   **🧠 Learning-First Pedagogy**: The AI is prompted to act as a mentor, offering hints and explanations rather than direct solutions.
*   **💬 Interactive Chat Interface**: Have a natural conversation about your code. Ask follow-up questions and get instant feedback.
*   **💻 Professional Code Editor**: Integrated Monaco Editor (VS Code engine) with syntax highlighting for Python, C, C++, and Java.
*   **📷 Visual Problem Helper**: Upload screenshots of coding problems or errors. The AI extracts text (OCR) and provides targeted help.
*   **🔊 Voice Explanations**: Audio support for explanations, perfect for auditory learners.
*   **📈 Progress Tracking**: Keep track of your learning journey with session timers and question metrics.
*   **🌓 Dark/Light Mode**: Beautiful, responsive UI that adapts to your preference.

---

## 🛠️ Tech Stack

This project is built with a modern, robust technology stack ensuring performance and scalability.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) | Fast, responsive UI built with React and bundled with Vite. |
| **Styling** | ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white) | Custom CSS variables for a seamless dark/light theme experience. |
| **Editor** | ![Monaco](https://img.shields.io/badge/-Monaco_Editor-1E1E1E?logo=visualstudiocode&logoColor=white) | The same editor that powers VS Code. |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) | Robust API handling requests, image processing, and AI orchestration. |
| **AI Engine** | ![Gemini](https://img.shields.io/badge/-Google_Gemini-4285F4?logo=google&logoColor=white) | Powering the intelligent mentorship capabilities. |
| **Deployment** | ![Render](https://img.shields.io/badge/-Render-46E3B7?logo=render&logoColor=white) | Hosted live on Render platform. |

---

## 🏁 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

*   **Node.js** (v18 or higher)
*   **npm** (v9 or higher)
*   **Google Gemini API Key**

### 📥 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AasishDairelSahayaGrinspan/grasp-hackathon.git
    cd grasp-hackathon
    ```

2.  **Setup Backend**
    ```bash
    cd learning-tutor-backend
    npm install
    # Create a .env file based on .env.example
    echo "GEMINI_API_KEY=your_api_key_here" > .env
    npm start
    ```

3.  **Setup Frontend** (Open a new terminal)
    ```bash
    cd learning-tutor-frontend
    npm install
    npm run dev
    ```

Your app should now be running at `http://localhost:5173`!

---

## 📸 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/800x450.png?text=Interactive+Chat+Interface" alt="Chat Interface" width="800" style="border-radius: 10px; margin-bottom: 20px;">
  
  <div style="display: flex; justify-content: center; gap: 20px;">
    <img src="https://via.placeholder.com/380x250.png?text=Code+Analysis" alt="Code Analysis" width="380" style="border-radius: 8px;">
    <img src="https://via.placeholder.com/380x250.png?text=Learning+Progress" alt="Learning Progress" width="380" style="border-radius: 8px;">
  </div>
</div>

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feat/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Made with ❤️ for the **Grasp Hackathon 2026**

</div>
