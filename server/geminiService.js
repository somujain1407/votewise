const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ FATAL: GEMINI_API_KEY is not set in your .env file.');
}

// Initialize the Google Gen AI SDK
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ────────────────────────────────────────────────────────────────
//  System Prompt
// ────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are VoteWise, a friendly and knowledgeable Election Education Assistant. 
Your ONLY purpose is to help users understand:
- How elections work (focus on Indian elections but cover general concepts)
- Voter registration process
- Step-by-step voting procedures
- Election timelines and phases
- Roles of Election Commission, candidates, and voters
- Voting rights and civic duties
- How votes are counted and results declared
- Common election terminology (EVM, VVPAT, constituency, etc.)

Rules:
- Always respond in simple, clear language
- Use bullet points and numbered steps when explaining processes
- If asked about anything NOT related to elections, politely redirect
- Be encouraging and emphasize the importance of voting
- Keep responses concise (under 250 words) unless a detailed explanation is needed
- CRITICAL: You MUST respond ENTIRELY in the language specified in "User language preference" below.
  If it says Hindi, your ENTIRE response — every word — MUST be in Hindi (Devanagari script).
  Do NOT mix languages.`;

// ────────────────────────────────────────────────────────────────
//  handleChat
// ────────────────────────────────────────────────────────────────
async function handleChat(message, language = 'English') {
    if (!ai) throw new Error('Gemini API Key is missing or invalid.');

    const prompt = `${SYSTEM_PROMPT}\n\nUser language preference: ${language}\n\nUser message: ${message}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 0.9,
            }
        });
        return response.text;
    } catch (error) {
        console.error('Gemini Chat Error:', error.message || error);
        throw error;
    }
}

// ────────────────────────────────────────────────────────────────
//  generateQuiz
// ────────────────────────────────────────────────────────────────
async function generateQuiz(language = 'English') {
    if (!ai) throw new Error('Gemini API Key is missing or invalid.');

    const prompt = `Generate a 5-question multiple choice quiz about the Indian election process, voting rights, and civic duties.
Language for all content: ${language}

IMPORTANT: Return ONLY a raw JSON array — no markdown, no code fences, no explanation text.
Each element must have exactly these keys:
- "question" (string)
- "options" (array of exactly 4 strings)
- "correctAnswer" (string that exactly matches one of the options)
- "explanation" (string, 1-2 sentences)`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: 'application/json',
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Gemini Quiz Error:', error.message || error);
        throw error;
    }
}

// ────────────────────────────────────────────────────────────────
//  translateText
// ────────────────────────────────────────────────────────────────
async function translateText(input, targetLanguage) {
    if (!ai) throw new Error('Gemini API Key is missing or invalid.');

    const isArray = Array.isArray(input);

    // Build prompt
    const inputStr = isArray ? JSON.stringify(input) : input;
    const prompt = isArray
        ? `Translate each string in this JSON array to ${targetLanguage}.
Return ONLY a valid JSON array of translated strings in the exact same order.
Do NOT include markdown code fences, backticks, or any explanation.
Input array:
${inputStr}`
        : `Translate the following text to ${targetLanguage}.
Return ONLY the translated text. No explanations, no code fences.
Input:
${inputStr}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1, // Low for accurate translation
                responseMimeType: isArray ? 'application/json' : 'text/plain',
            }
        });

        let resultText = response.text.trim();

        // Robustly strip any markdown fences the model might add despite instructions
        resultText = resultText
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        if (isArray) {
            try {
                return JSON.parse(resultText);
            } catch (parseErr) {
                console.error('Translation JSON parse failed. Raw output:', resultText);
                return input; // Safe fallback: return original texts
            }
        }

        return resultText;
    } catch (error) {
        console.error('Gemini Translate Error:', error.message || error);
        throw error;
    }
}

module.exports = { handleChat, generateQuiz, translateText };
