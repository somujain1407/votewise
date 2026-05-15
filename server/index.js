const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', apiLimiter);

// Import Services
const { handleChat, generateQuiz, translateText } = require('./geminiService');

// Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const response = await handleChat(message, language || 'English');
    res.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

app.get('/api/quiz', async (req, res) => {
  try {
    const { language } = req.query;
    const questions = await generateQuiz(language || 'English');
    res.json({ questions });
  } catch (error) {
    console.error('Quiz API Error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

app.post('/api/translate', async (req, res) => {
  try {
    const { text, texts, targetLanguage } = req.body;
    if ((!text && !texts) || !targetLanguage) {
      return res.status(400).json({ error: 'Text(s) and targetLanguage are required' });
    }
    
    if (texts && Array.isArray(texts)) {
        // Batch translation
        const translatedTexts = await translateText(texts, targetLanguage);
        res.json({ translatedTexts });
    } else {
        // Single text translation fallback
        const translatedText = await translateText(text, targetLanguage);
        res.json({ translatedText });
    }
  } catch (error) {
    console.error('Translate API Error:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log('\n');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║        ✅  VoteWise is RUNNING!          ║');
  console.log('  ║                                          ║');
  console.log(`  ║   👉  http://localhost:${PORT}              ║`);
  console.log('  ║                                          ║');
  console.log('  ║   Open the link above in your browser.   ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('\n');
});
