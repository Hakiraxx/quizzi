let quizData = [];
let currentQuizIndex = 0;
let currentQuestionIndex = 0;
let userAnswers = {};
let isAnswered = false;

// Load quiz data
async function loadQuizData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        quizData = data.quizzes;
        displayHome();
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        document.getElementById('quizList').innerHTML = '<p>Không thể tải dữ liệu quiz</p>';
    }
}

// Display home screen with quiz list
function displayHome() {
    switchScreen('homeScreen');
    const quizList = document.getElementById('quizList');
    quizList.innerHTML = '';
    
    quizData.forEach((quiz, index) => {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.onclick = () => startQuiz(index);
        
        const questionCount = quiz.questions.length;
        card.innerHTML = `
            <h3>${quiz.title}</h3>
            <p>${quiz.subject}</p>
            <div class="quiz-info">
                <strong>${questionCount}</strong> câu hỏi
            </div>
            <button class="btn">Bắt đầu →</button>
        `;
        quizList.appendChild(card);
    });
}

// Start a quiz
function startQuiz(quizIndex) {
    currentQuizIndex = quizIndex;
    currentQuestionIndex = 0;
    userAnswers = {};
    isAnswered = false;
    switchScreen('quizScreen');
    displayQuestion();
}

// Display current question
function displayQuestion() {
    const quiz = quizData[currentQuizIndex];
    const question = quiz.questions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;
    const totalQuestions = quiz.questions.length;
    
    // Update title and meta
    document.getElementById('quizTitle').textContent = quiz.title;
    document.getElementById('questionCounter').textContent = `Câu ${questionNumber}/${totalQuestions}`;
    document.getElementById('questionNumber').textContent = `Câu ${questionNumber}`;
    document.getElementById('questionText').textContent = question.question;
    
    // Update progress bar
    const progress = (questionNumber / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Display options (randomized order during quiz)
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    // Create array of options with their indices
    const optionsWithIndices = question.options.map((option, index) => ({
        text: option,
        originalIndex: index
    }));
    
    // Shuffle options
    const shuffledOptions = [...optionsWithIndices].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach((optionData, displayIndex) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        
        const isSelected = userAnswers[question.id] === optionData.originalIndex;
        if (isSelected) optionDiv.style.borderColor = '#667eea';
        
        optionDiv.innerHTML = `
            <input type="radio" id="option${displayIndex}" name="answer" value="${optionData.originalIndex}" 
                   ${isSelected ? 'checked' : ''} onclick="selectAnswer(${optionData.originalIndex}, ${question.id})">
            <label for="option${displayIndex}">${optionData.text}</label>
        `;
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    document.getElementById('nextBtn').textContent = isLastQuestion ? 'Kết thúc' : 'Câu tiếp →';
    
    isAnswered = false;
}

// Select an answer
function selectAnswer(optionIndex, questionId) {
    userAnswers[questionId] = optionIndex;
    isAnswered = true;
}

// Navigate to previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Navigate to next question or finish quiz
function nextQuestion() {
    const quiz = quizData[currentQuizIndex];
    const totalQuestions = quiz.questions.length;
    
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        finishQuiz();
    }
}

// Finish quiz and show results
function finishQuiz() {
    const quiz = quizData[currentQuizIndex];
    let correctCount = 0;
    
    quiz.questions.forEach(question => {
        if (userAnswers[question.id] === question.correctAnswer) {
            correctCount++;
        }
    });
    
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Display results
    switchScreen('resultsScreen');
    document.getElementById('scoreDisplay').textContent = `${correctCount}/${totalQuestions}`;
    document.getElementById('scorePercentage').textContent = `${percentage}%`;
    
    // Message based on score
    let message = '';
    if (percentage === 100) {
        message = '🎉 Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi!';
    } else if (percentage >= 80) {
        message = '🌟 Rất tốt! Bạn nắm vững kiến thức này.';
    } else if (percentage >= 60) {
        message = '👍 Khá tốt! Bạn cần ôn lại một số phần.';
    } else if (percentage >= 40) {
        message = '📚 Bạn cần ôn lại kỹ hơn.';
    } else {
        message = '💪 Hãy cố gắng thêm nữa! Ôn tập lại và thử lại.';
    }
    document.getElementById('resultsMessage').textContent = message;
    
    // Detailed results
    const detailsHTML = quiz.questions.map((question, index) => {
        const userAnswer = userAnswers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        const answerText = question.options[userAnswer] || 'Không trả lời';
        const correctText = question.options[question.correctAnswer];
        
        return `
            <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                <strong>Câu ${index + 1}: ${isCorrect ? '✓' : '✗'}</strong><br>
                ${question.question}<br>
                <small>Câu trả lời của bạn: ${answerText}</small>
                ${!isCorrect ? `<br><small style="color: #4caf50;">Đáp án đúng: ${correctText}</small>` : ''}
            </div>
        `;
    }).join('');
    
    document.getElementById('resultsDetails').innerHTML = detailsHTML;
}

// Switch between screens
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Go back to home
function goHome() {
    currentQuestionIndex = 0;
    userAnswers = {};
    displayHome();
}

// Initialize
document.addEventListener('DOMContentLoaded', loadQuizData);
