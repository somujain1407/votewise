let currentQuizData = null;
let currentQuestionIndex = 0;
let userScore = 0;

document.addEventListener('DOMContentLoaded', () => {
    const startQuizBtn  = document.getElementById('startQuizBtn');
    const quizModal     = document.getElementById('quizModal');
    const closeQuizModal = quizModal.querySelector('.close-modal');

    startQuizBtn.addEventListener('click', openQuizModal);

    closeQuizModal.addEventListener('click', () => {
        quizModal.style.display = 'none';
    });
});

async function openQuizModal() {
    const modal   = document.getElementById('quizModal');
    const loading = document.getElementById('quizLoading');
    const content = document.getElementById('quizContent');
    const results = document.getElementById('quizResults');

    modal.style.display   = 'block';
    loading.style.display = 'block';
    loading.innerHTML     = '<div class="spinner"></div><p>Generating Quiz...</p>';
    content.style.display = 'none';
    results.style.display = 'none';
    content.innerHTML     = '';
    results.innerHTML     = '';

    currentQuestionIndex = 0;
    userScore = 0;
    currentQuizData = null;

    try {
        // Read current language from button attribute (kept in sync by script.js)
        const lang     = document.getElementById('langToggle').getAttribute('data-lang');
        const language = lang === 'hi' ? 'Hindi' : 'English';

        const response = await fetch(`/api/quiz?language=${language}`);

        if (!response.ok) throw new Error(`Server responded with ${response.status}`);

        const data = await response.json();

        if (data.questions && data.questions.length > 0) {
            currentQuizData = data.questions;
            loading.style.display = 'none';
            content.style.display = 'block';
            renderQuestion();
        } else {
            throw new Error('No questions received');
        }
    } catch (error) {
        console.error('Quiz Error:', error);
        loading.innerHTML = `
            <p style="color: var(--text-muted); text-align:center; padding: 20px;">
                ⚠️ Error generating quiz. Please try again.<br>
                <button class="primary-btn" style="margin-top:16px;" onclick="openQuizModal()">Retry</button>
            </p>
        `;
    }
}

function renderQuestion() {
    const content = document.getElementById('quizContent');
    const qData   = currentQuizData[currentQuestionIndex];

    let optionsHtml = '';
    qData.options.forEach((opt) => {
        // Escape single quotes safely using a data attribute instead of inline onclick
        optionsHtml += `<div class="quiz-option" data-answer="${opt.replace(/"/g, '&quot;')}">${opt}</div>`;
    });

    content.innerHTML = `
        <div class="quiz-header">
            <span>Question ${currentQuestionIndex + 1} of ${currentQuizData.length}</span>
            <span style="color: var(--primary); font-weight:700;">Score: ${userScore}</span>
        </div>
        <h3 class="quiz-question">${qData.question}</h3>
        <div class="quiz-options" id="quizOptions">
            ${optionsHtml}
        </div>
        <div id="explanationContainer" style="display:none; margin-top:20px; padding:20px;"></div>
        <button id="nextQuestionBtn" class="primary-btn" style="display:none; margin-top:20px; width:100%;">
            ${currentQuestionIndex + 1 < currentQuizData.length ? 'Next Question →' : 'See Results'}
        </button>
    `;

    // Attach click handlers using event delegation (no inline onclick)
    document.querySelectorAll('.quiz-option').forEach(optEl => {
        optEl.addEventListener('click', () => selectAnswer(optEl.getAttribute('data-answer')));
    });

    document.getElementById('nextQuestionBtn').addEventListener('click', nextQuestion);
}

function selectAnswer(selectedOption) {
    const nextBtn = document.getElementById('nextQuestionBtn');
    // Prevent selecting after an answer is already chosen
    if (nextBtn && nextBtn.style.display !== 'none') return;

    const qData     = currentQuizData[currentQuestionIndex];
    const isCorrect = selectedOption === qData.correctAnswer;

    if (isCorrect) userScore++;

    // Highlight options
    document.querySelectorAll('.quiz-option').forEach(opt => {
        const optText = opt.getAttribute('data-answer');
        if (optText === qData.correctAnswer) {
            opt.classList.add('correct');
        } else if (optText === selectedOption && !isCorrect) {
            opt.classList.add('incorrect');
        }
        opt.style.pointerEvents = 'none'; // Prevent further clicks
    });

    // Show explanation
    const expContainer = document.getElementById('explanationContainer');
    expContainer.style.display = 'block';
    expContainer.innerHTML = `
        <strong style="color: ${isCorrect ? '#22c55e' : '#ef4444'}">
            ${isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
        </strong>
        <p style="margin-top:8px;">${qData.explanation}</p>
    `;

    if (nextBtn) nextBtn.style.display = 'block';
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuizData.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    const content = document.getElementById('quizContent');
    const results = document.getElementById('quizResults');

    content.style.display = 'none';
    results.style.display = 'block';

    const percentage = Math.round((userScore / currentQuizData.length) * 100);
    let emoji = percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚';
    let message = percentage >= 80 ? 'Excellent work!' : percentage >= 50 ? 'Good effort!' : 'Keep learning!';

    results.innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
            <div style="font-size: 4rem; margin-bottom: 16px;">${emoji}</div>
            <h3 style="font-size: 1.8rem; margin-bottom: 12px;">Quiz Completed!</h3>
            <p style="font-size: 1.15rem; color: var(--text-muted); margin-bottom: 8px;">${message}</p>
            <p style="font-size: 1.4rem; font-weight: 700; color: var(--primary); margin: 16px 0;">
                ${userScore} / ${currentQuizData.length} &nbsp;·&nbsp; ${percentage}%
            </p>
            <div style="height:8px; background:var(--border); border-radius:4px; margin: 20px 0; overflow:hidden;">
                <div style="height:100%; width:${percentage}%; background: var(--primary); border-radius:4px; transition: width 0.6s ease;"></div>
            </div>
            <button class="primary-btn" onclick="openQuizModal()" style="margin-top: 10px;">
                Try Again
            </button>
        </div>
    `;
}
