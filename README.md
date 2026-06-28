# Conversational UX & Accessibility Auditor

A state-of-the-art, AI-powered platform that performs deep UX and accessibility audits on web applications and code repositories. Built with a stunning glassmorphic interface, real-time auditing streams, and deeply integrated AI, this tool doesn't just find issues—it writes the code to fix them and talks you through the improvements.

## 🌟 Key Features

* **Live AI Audits**: Deep, real-time scanning of web pages and code repositories using Playwright and AI heuristics.
* **Instant Code Fixes**: Automatically generates before/after code comparisons to fix accessibility and UX issues (powered by the Groq API and `llama-3.3-70b-versatile`).
* **Interactive AI Chat**: Ask questions directly about your audit! The AI has full context of your report and can generate tailored React/Tailwind code, prioritize tasks by business impact, or explain complex WCAG violations.
* **Premium Dynamic UI**: A modern, glassmorphic design system featuring animated mesh gradients, seamless Dark/Light modes, and micro-interactions.
* **Push to GitHub**: Instantly open pull requests with the AI-generated fixes directly to your repository.

## 🛠️ Technology Stack

**Frontend**
* React 19 & Vite 8
* Vanilla CSS (Custom glassmorphism & CSS variable theming)
* Clerk (Authentication)
* Socket.io-client (Real-time live audit streaming)

**Backend (Cicaada)**
* Node.js & Express
* Playwright (Headless browser auditing)
* Groq API (High-speed LLM inference for chat and code generation)
* MongoDB (via Mongoose and `mongodb-memory-server` for local dev)
* Socket.io (WebSocket server)

## 🚀 Getting Started

### Prerequisites
* Node.js v18+
* Groq API Key

### Installation

1. **Clone the repository** and navigate to the project folder.
2. **Setup the Backend (Cicaada)**
   ```bash
   cd Cicaada
   npm install
   ```
   *Create a `.env` file in the `Cicaada` directory:*
   ```env
   PORT=3002
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/cicaada-auditor
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Setup the Frontend**
   ```bash
   cd ../ux-auditor-react
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Cicaada
   npm run dev
   ```
2. **Start the Frontend Client**
   ```bash
   cd ux-auditor-react
   npm run dev
   ```
3. Open your browser to `http://localhost:5173` to view the application!

## 🎨 Design Philosophy
The UI was meticulously crafted to avoid generic styling. It relies on a rich, vibrant, soft-glowing aesthetic ("Colorful Light Palette") with animated radial gradients, making the technical data in the dashboard feel premium, accessible, and engaging.

## 🤝 Contributing
This project was built for the Zonals Finals Hackathon. Feel free to fork, explore, and expand upon the conversational UX auditing capabilities!
