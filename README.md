# VoteWise - Election Process Education Assistant 🗳️

![VoteWise Banner](https://img.shields.io/badge/VoteWise-Election_Assistant-1e40af?style=for-the-badge&logo=google-gemini)

VoteWise is an interactive, accessible, and AI-powered educational web application designed to help citizens understand the election process, voting rights, timelines, and civic duties. It uses **Google Gemini AI** to provide an intelligent conversational assistant, dynamic quizzes, and multilingual support.

## 🌟 Key Features

*   🤖 **AI Chat Assistant:** Ask any election-related questions and get simple, clear, and accurate answers powered by `gemini-2.5-flash`.
*   📝 **Dynamic Quizzes:** Test your knowledge! VoteWise dynamically generates a 5-question JSON-structured quiz on demand using Gemini.
*   📚 **Interactive Topic Cards:** Explore deep-dive explanations on critical topics like Voter Registration, EVMs, and Polling Officials.
*   ⏳ **Election Timeline:** Visual representation of election phases from announcement to result declaration.
*   🌍 **Bilingual Support (English & Hindi):** Instantly switch the entire interface and AI assistant between English and Hindi. The app uses an optimized batch-translation mechanism via Gemini API.
*   🔊 **Accessibility (Text-to-Speech):** A native HTML5 Web Speech API integration reads out explanations and chat responses.
*   🌗 **Modern UI:** Features a sleek Dark/Light mode toggle, glassmorphism effects, and fully responsive design.

## 🛠️ Technology Stack

*   **Frontend:** HTML5, CSS3 (Modern Variables, Glassmorphism), Vanilla JavaScript
*   **Backend:** Node.js, Express.js
*   **AI Integration:** Google Gemini API (`@google/genai` SDK)
*   **Security:** `express-rate-limit` (to prevent API abuse), `cors`, `dotenv`

## 🚀 How to Run Locally

### Prerequisites
*   [Node.js](https://nodejs.org/) installed on your machine.
*   A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/somujain1407/ipl-akinator.git
   cd votewise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory (you can copy `.env.example` if available) and add your API key:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the Application**
   Visit [http://localhost:3000](http://localhost:3000) in your web browser.

## 🧠 AI Architecture (Google Services Used)

*   **Google Gemini API (`gemini-2.5-flash`)**: Acts as the core brain. It handles the strict system-prompted chat interface, generates validated JSON quizzes, and provides highly accurate Hindi-English translations.
*   *Note on APIs:* To keep the application lightweight and cost-effective, standard Google Translate and Cloud TTS APIs were bypassed. Instead, we utilized **Gemini for translation** and the **native browser Web Speech API for narration**.

## 🛡️ Security & Performance
*   **Rate Limiting:** The backend uses `express-rate-limit` to restrict IPs to 100 requests per 15 minutes to protect the Gemini API quota.
*   **Batch Translation:** Translation requests are batched into a single JSON array to significantly reduce API calls and prevent free-tier quota exhaustion (`429 Too Many Requests`).

---
*Built with ❤️ for democratic education.*
