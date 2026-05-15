document.addEventListener('DOMContentLoaded', () => {
    // ── UI Elements ──────────────────────────────────────────────────────────
    const chatInput        = document.getElementById('chatInput');
    const sendBtn          = document.getElementById('sendBtn');
    const chatWindow       = document.getElementById('chatWindow');
    const themeToggle      = document.getElementById('themeToggle');
    const textSizeToggle   = document.getElementById('textSizeToggle');
    const langToggle       = document.getElementById('langToggle');
    const topicCards       = document.querySelectorAll('.card');
    const topicModal       = document.getElementById('topicModal');
    const closeTopicModal  = document.querySelector('.close-topic-modal');

    // ── State ────────────────────────────────────────────────────────────────
    let currentLang = 'en';   // 'en' | 'hi'
    let isDarkTheme = false;
    let isTranslating = false;

    // ── Theme ────────────────────────────────────────────────────────────────
    themeToggle.addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : '');
        if (!isDarkTheme) document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = isDarkTheme
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    });

    // ── Text Size ────────────────────────────────────────────────────────────
    textSizeToggle.addEventListener('click', () => {
        document.body.classList.toggle('text-large');
    });

    // ── Language / Translation ───────────────────────────────────────────────
    langToggle.addEventListener('click', async () => {
        if (isTranslating) return;  // prevent double-click

        currentLang = currentLang === 'en' ? 'hi' : 'en';
        langToggle.setAttribute('data-lang', currentLang);
        document.getElementById('langLabel').innerText = currentLang === 'en' ? 'English' : 'हिंदी';

        if (currentLang === 'en') {
            // ── Restore English ──────────────────────────────────────────────
            document.querySelectorAll('[data-original]').forEach(el => {
                el.innerText = el.getAttribute('data-original');
            });
            // Restore hero text
            const heroTitle    = document.getElementById('heroTitle');
            const heroSubtitle = document.getElementById('heroSubtitle');
            if (heroTitle.getAttribute('data-original'))    heroTitle.innerText    = heroTitle.getAttribute('data-original');
            if (heroSubtitle.getAttribute('data-original')) heroSubtitle.innerText = heroSubtitle.getAttribute('data-original');
            return;
        }

        // ── Translate to Hindi ───────────────────────────────────────────────
        isTranslating = true;
        langToggle.disabled = true;
        langToggle.style.opacity = '0.6';

        // Collect all .translatable elements + hero elements
        const elementsToTranslate = [];
        const textsToTranslate   = [];

        // Regular translatable elements (cards, timeline, modals, buttons)
        document.querySelectorAll('.translatable').forEach(el => {
            const original = el.getAttribute('data-original') || el.innerText.trim();
            if (!el.getAttribute('data-original')) {
                el.setAttribute('data-original', original);
            }
            elementsToTranslate.push(el);
            textsToTranslate.push(original);
        });

        // Hero title and subtitle (not .translatable, targeted by ID)
        const heroTitle    = document.getElementById('heroTitle');
        const heroSubtitle = document.getElementById('heroSubtitle');

        if (heroTitle) {
            const orig = heroTitle.getAttribute('data-original') || heroTitle.innerText.trim();
            if (!heroTitle.getAttribute('data-original')) heroTitle.setAttribute('data-original', orig);
            elementsToTranslate.push(heroTitle);
            textsToTranslate.push(orig);
        }
        if (heroSubtitle) {
            const orig = heroSubtitle.getAttribute('data-original') || heroSubtitle.innerText.trim();
            if (!heroSubtitle.getAttribute('data-original')) heroSubtitle.setAttribute('data-original', orig);
            elementsToTranslate.push(heroSubtitle);
            textsToTranslate.push(orig);
        }

        // Chat input placeholder
        const inputOrig = chatInput.getAttribute('data-original') || chatInput.placeholder;
        if (!chatInput.getAttribute('data-original')) chatInput.setAttribute('data-original', inputOrig);
        textsToTranslate.push(inputOrig);

        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts: textsToTranslate, targetLanguage: 'Hindi' })
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();

            if (data.translatedTexts && Array.isArray(data.translatedTexts)) {
                // Apply to elements
                elementsToTranslate.forEach((el, i) => {
                    if (data.translatedTexts[i] !== undefined) {
                        el.innerText = data.translatedTexts[i];
                    }
                });
                // Apply placeholder (last item)
                const placeholderTranslated = data.translatedTexts[elementsToTranslate.length];
                if (placeholderTranslated) chatInput.placeholder = placeholderTranslated;
            } else {
                throw new Error('Invalid translation response from server.');
            }
        } catch (e) {
            console.error('Translation Error:', e);
            // Revert language state on failure
            currentLang = 'en';
            langToggle.setAttribute('data-lang', 'en');
            document.getElementById('langLabel').innerText = 'English';
            showToast('Translation failed. Please check your API key or try again later.', 'error');
        } finally {
            isTranslating = false;
            langToggle.disabled = false;
            langToggle.style.opacity = '1';
        }
    });

    // ── Toast Notification ───────────────────────────────────────────────────
    function showToast(message, type = 'info') {
        const existing = document.getElementById('vw-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'vw-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ef4444' : '#1e40af'};
            color: #fff;
            padding: 14px 24px;
            border-radius: 10px;
            font-size: 0.95rem;
            z-index: 9999;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            animation: fadeIn 0.3s ease;
            max-width: 400px;
            text-align: center;
        `;
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // ── Text to Speech ───────────────────────────────────────────────────────
    function speakText(text) {
        if (!('speechSynthesis' in window)) {
            showToast('Text-to-speech is not supported in your browser.');
            return;
        }
        window.speechSynthesis.cancel();
        const plainText = text.replace(/<[^>]*>?/gm, '').replace(/[*#`_~]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.lang = currentLang === 'en' ? 'en-IN' : 'hi-IN';
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.startsWith(utterance.lang));
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
    }

    // Attach TTS to initial welcome message
    document.querySelectorAll('.tts-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // The text content is in the sibling <p> tag inside the same msg-bubble
            const bubble = e.currentTarget.closest('.msg-bubble');
            const textEl = bubble ? bubble.querySelector('p, .msg-content') : null;
            if (textEl) speakText(textEl.innerText);
        });
    });

    // Load voices async (required by some browsers)
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    // ── Chat Logic ───────────────────────────────────────────────────────────
    let isSending = false;

    async function sendMessage(text) {
        if (!text.trim() || isSending) return;

        isSending = true;
        sendBtn.disabled = true;

        appendMessage(text, 'user');
        chatInput.value = '';

        // Typing indicator
        const typingId = 'typing-' + Date.now();
        chatWindow.insertAdjacentHTML('beforeend', `
            <div class="message assistant" id="${typingId}">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    language: currentLang === 'en' ? 'English' : 'Hindi'
                })
            });

            const data = await response.json();
            document.getElementById(typingId)?.remove();

            if (response.ok && data.response) {
                appendMessage(data.response, 'assistant');
            } else {
                const errMsg = data.error || 'Sorry, I encountered an error. Please try again.';
                appendMessage(errMsg, 'assistant');
            }
        } catch (error) {
            document.getElementById(typingId)?.remove();
            appendMessage('⏳ Please wait a moment and try again. The server may be processing your request.', 'assistant');
        } finally {
            isSending = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        let contentHtml = '';
        if (sender === 'assistant') {
            const formattedText = typeof marked !== 'undefined'
                ? marked.parse(text)
                : `<p>${text}</p>`;
            contentHtml = `
                <div class="msg-bubble">
                    <div class="msg-content">${formattedText}</div>
                    <button class="tts-btn" aria-label="Read Aloud"><i class="fa-solid fa-volume-high"></i></button>
                </div>
            `;
        } else {
            contentHtml = `
                <div class="msg-bubble">
                    <p>${text}</p>
                </div>
            `;
        }

        messageDiv.innerHTML = contentHtml;
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        if (sender === 'assistant') {
            const ttsBtn    = messageDiv.querySelector('.tts-btn');
            const msgContent = messageDiv.querySelector('.msg-content');
            ttsBtn.addEventListener('click', () => speakText(msgContent.innerText));
        }
    }

    sendBtn.addEventListener('click', () => sendMessage(chatInput.value));
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(chatInput.value);
    });

    // ── Topic Cards ──────────────────────────────────────────────────────────
    topicCards.forEach(card => {
        card.addEventListener('click', async () => {
            const topic = card.getAttribute('data-topic');
            topicModal.style.display = 'block';
            document.getElementById('topicTitle').innerText = topic;

            const loading = document.getElementById('topicLoading');
            const content = document.getElementById('topicContent');
            const ttsBtn  = document.getElementById('topicTtsBtn');

            loading.style.display    = 'block';
            loading.innerHTML        = '<div class="spinner"></div><p>Loading explanation...</p>';
            content.style.display    = 'none';
            content.innerHTML        = '';
            ttsBtn.style.display     = 'none';

            try {
                const lang = currentLang === 'en' ? 'English' : 'Hindi';
                const promptMsg = `Please explain the topic "${topic}" in detail regarding the Indian election process. Format nicely with markdown headings and bullet points.`;

                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: promptMsg, language: lang })
                });

                const data = await response.json();

                loading.style.display = 'none';

                if (response.ok && data.response) {
                    content.style.display = 'block';
                    content.innerHTML = typeof marked !== 'undefined'
                        ? marked.parse(data.response)
                        : data.response;
                    ttsBtn.style.display = 'inline-flex';

                    // Clone to remove stale listeners
                    const newBtn = ttsBtn.cloneNode(true);
                    ttsBtn.parentNode.replaceChild(newBtn, ttsBtn);
                    newBtn.addEventListener('click', () => speakText(content.innerText));
                } else {
                    content.style.display = 'block';
                    content.innerHTML = '<p>⏳ Please wait and try again. The response is being processed.</p>';
                }
            } catch (err) {
                loading.style.display = 'none';
                content.style.display = 'block';
                content.innerHTML = '<p>⏳ Please wait a moment and click again. Your request is being processed.</p>';
            }
        });
    });

    closeTopicModal.addEventListener('click', () => {
        topicModal.style.display = 'none';
        window.speechSynthesis.cancel();
    });

    // Close modals on backdrop click
    window.addEventListener('click', (e) => {
        if (e.target === topicModal) {
            topicModal.style.display = 'none';
            window.speechSynthesis.cancel();
        }
        const quizModal = document.getElementById('quizModal');
        if (e.target === quizModal) {
            quizModal.style.display = 'none';
        }
    });
});
