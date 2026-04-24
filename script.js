// Word Database by Levels
const wordDatabase = {
    1: [
        { word: "CAT", hint: "A furry pet that says meow" },
        { word: "DOG", hint: "Man's best friend" },
        { word: "SUN", hint: "Bright star in the sky" },
        { word: "CAR", hint "Four-wheeled vehicle" },
        { word: "BIRD", hint: "Animal that can fly" }
    ],
    2: [
        { word: "HOUSE", hint: "Place where people live" },
        { word: "GARDEN", hint: "Place where flowers grow" },
        { word: "SCHOOL", hint: "Place where children learn" },
        { word: "FRIEND", hint: "Someone you trust and like" },
        { word: "HAPPY", hint: "Feeling of joy" }
    ],
    3: [
        { word: "ELEPHANT", hint: "Largest land animal with trunk" },
        { word: "COMPUTER", hint: "Electronic device for work and play" },
        { word: "CHOCOLATE", hint: "Sweet brown treat" },
        { word: "BEAUTIFUL", hint: "Pleasing to the eye" },
        { word: "IMPORTANT", hint: "Of great significance" }
    ],
    4: [
        { word: "EXTRAORDINARY", hint: "Very unusual or remarkable" },
        { word: "UNBELIEVABLE", hint: "Hard to accept as true" },
        { word: "RESPONSIBILITY", hint: "Duty or obligation" },
        { word: "ACCOMMODATION", hint: "Place to stay or live" },
        { word: "CIRCUMSTANCES", hint: "Conditions affecting a situation" }
    ]
};

// Game Variables
let currentLevel = 1;
let currentWord = null;
let currentHint = "";
let scrambledWord = "";
let score = 0;
let streak = 0;
let timeLeft = 30;
let timerInterval = null;
let gameActive = true;
let hintsUsed = 0;
let bestScore = 0;
let leaderboard = [];

// DOM Elements
const scrambledWordDiv = document.getElementById('scrambledWord');
const hintSpan = document.getElementById('hint');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const hintBtn = document.getElementById('hintBtn');
const nextBtn = document.getElementById('nextBtn');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const levelNumber = document.getElementById('levelNumber');
const streakDisplay = document.getElementById('streak');
const bestScoreDisplay = document.getElementById('bestScore');
const timerValue = document.getElementById('timerValue');
const timerFill = document.getElementById('timerFill');
const messageArea = document.getElementById('messageArea');

// Load saved data
function loadData() {
    const savedBestScore = localStorage.getItem('wordMasterBestScore');
    if (savedBestScore) {
        bestScore = parseInt(savedBestScore);
        bestScoreDisplay.textContent = bestScore;
    }
    
    const savedLeaderboard = localStorage.getItem('wordMasterLeaderboard');
    if (savedLeaderboard) {
        leaderboard = JSON.parse(savedLeaderboard);
        displayLeaderboard();
    }
}

// Save to leaderboard
function saveToLeaderboard() {
    const playerName = prompt("Congratulations! Enter your name for the leaderboard:", "Word Master");
    if (playerName && playerName.trim()) {
        const name = playerName.trim().substring(0, 15);
        leaderboard.push({
            name: name,
            score: score,
            level: currentLevel,
            date: new Date().toISOString()
        });
        
        // Sort and keep top 10
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10);
        
        localStorage.setItem('wordMasterLeaderboard', JSON.stringify(leaderboard));
        displayLeaderboard();
        showMessage(`🎉 ${name} added to leaderboard!`, 'success');
    }
}

// Display leaderboard
function displayLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div class="text-center">No scores yet. Play to become a champion!</div>';
        return;
    }
    
    leaderboardList.innerHTML = leaderboard.map((entry, index) => {
        let rankIcon = '';
        if (index === 0) rankIcon = '👑';
        else if (index === 1) rankIcon = '🥈';
        else if (index === 2) rankIcon = '🥉';
        else rankIcon = `${index + 1}`;
        
        return `
            <div class="leaderboard-item">
                <div><strong>${rankIcon}</strong> ${escapeHtml(entry.name)}</div>
                <div><strong>${entry.score}</strong> pts</div>
                <div><small>Lvl ${entry.level}</small></div>
            </div>
        `;
    }).join('');
}

// Clear leaderboard
function clearLeaderboard() {
    if (confirm('Are you sure you want to clear all scores?')) {
        leaderboard = [];
        localStorage.removeItem('wordMasterLeaderboard');
        displayLeaderboard();
        showMessage('Leaderboard cleared!', 'info');
    }
}

// Scramble word
function scrambleWord(word) {
    let letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
}

// Load new word
function loadNewWord() {
    const levelWords = wordDatabase[currentLevel];
    if (!levelWords) {
        // Game completed
        gameComplete();
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * levelWords.length);
    currentWord = levelWords[randomIndex].word.toUpperCase();
    currentHint = levelWords[randomIndex].hint;
    scrambledWord = scrambleWord(currentWord);
    
    scrambledWordDiv.textContent = scrambledWord;
    hintSpan.textContent = "Click hint button for help!";
    guessInput.value = "";
    guessInput.focus();
    
    // Reset game active state
    gameActive = true;
    nextBtn.style.display = "none";
    guessBtn.disabled = false;
    guessInput.disabled = false;
    hintBtn.disabled = false;
    
    // Reset timer
    resetTimer();
}

// Reset timer
function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timeLeft = 30;
    timerValue.textContent = `${timeLeft}s`;
    timerFill.style.width = "100%";
    
    timerInterval = setInterval(() => {
        if (gameActive && timeLeft > 0) {
            timeLeft--;
            timerValue.textContent = `${timeLeft}s`;
            const percentage = (timeLeft / 30) * 100;
            timerFill.style.width = `${percentage}%`;
            
            // Change color based on time
            if (timeLeft <= 5) {
                timerFill.style.background = "linear-gradient(90deg, #ff6b6b, #c92a2a)";
            } else if (timeLeft <= 15) {
                timerFill.style.background = "linear-gradient(90deg, #ffe66d, #f7b05e)";
            } else {
                timerFill.style.background = "linear-gradient(90deg, #4ecdc4, #1a535c)";
            }
            
            if (timeLeft <= 0) {
                timeOut();
            }
        }
    }, 1000);
}

// Time out function
function timeOut() {
    if (!gameActive) return;
    
    gameActive = false;
    clearInterval(timerInterval);
    
    showWrongAnimation();
    showPopup("⏰ TIME'S UP!", "wrong");
    
    streak = 0;
    streakDisplay.textContent = streak;
    
    // Show correct answer
    messageArea.innerHTML = `<div class="alert alert-warning">Time's up! The word was "${currentWord}"</div>`;
    
    guessBtn.disabled = true;
    guessInput.disabled = true;
    hintBtn.disabled = true;
    nextBtn.style.display = "block";
}

// Check answer
function checkAnswer() {
    if (!gameActive) return;
    
    const userAnswer = guessInput.value.trim().toUpperCase();
    
    if (!userAnswer) {
        showWrongAnimation();
        showPopup("❌ EMPTY ANSWER!", "wrong");
        showMessage("Please type an answer!", "error");
        return;
    }
    
    if (userAnswer === currentWord) {
        // Correct answer
        correctAnswer();
    } else {
        // Wrong answer
        wrongAnswer();
    }
}

// Correct answer
function correctAnswer() {
    gameActive = false;
    clearInterval(timerInterval);
    
    // Calculate points
    const timeBonus = Math.floor(timeLeft / 2);
    const streakBonus = streak * 10;
    const levelBonus = currentLevel * 10;
    const pointsEarned = 100 + timeBonus + streakBonus + levelBonus;
    
    score += pointsEarned;
    streak++;
    
    // Update displays
    scoreDisplay.textContent = score;
    streakDisplay.textContent = streak;
    
    // Show correct animation
    showCorrectAnimation();
    showPopup(`✅ CORRECT! +${pointsEarned}`, "correct");
    
    // Show message with details
    messageArea.innerHTML = `
        <div class="alert alert-success">
            🎉 Correct! +${pointsEarned} points<br>
            Time Bonus: +${timeBonus} | Streak Bonus: +${streakBonus} | Level Bonus: +${levelBonus}
        </div>
    `;
    
    // Check for level up
    if (score >= currentLevel * 500) {
        levelUp();
    }
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        bestScoreDisplay.textContent = bestScore;
        localStorage.setItem('wordMasterBestScore', bestScore);
        showMessage("🏆 NEW HIGH SCORE! 🏆", "success");
    }
    
    // Prepare next word
    guessBtn.disabled = true;
    guessInput.disabled = true;
    hintBtn.disabled = true;
    nextBtn.style.display = "block";
}

// Wrong answer
function wrongAnswer() {
    showWrongAnimation();
    showPopup("❌ WRONG!", "wrong");
    
    streak = 0;
    streakDisplay.textContent = streak;
    
    // Visual feedback on input
    guessInput.classList.add('wrong-animation');
    setTimeout(() => {
        guessInput.classList.remove('wrong-animation');
    }, 300);
    
    messageArea.innerHTML = `<div class="alert alert-danger">Wrong! The correct word was "${currentWord}"</div>`;
    
    gameActive = false;
    clearInterval(timerInterval);
    
    guessBtn.disabled = true;
    guessInput.disabled = true;
    hintBtn.disabled = true;
    nextBtn.style.display = "block";
}

// Level up
function levelUp() {
    currentLevel++;
    levelDisplay.textContent = currentLevel;
    levelNumber.textContent = currentLevel;
    
    // Show level up animation
    showLevelUpAnimation();
    
    showMessage(`🎊 AMAZING! You reached LEVEL ${currentLevel}! 🎊`, "success");
    
    // Add time bonus for level up
    // Don't reset score, continue with new level
}

// Game complete
function gameComplete() {
    gameActive = false;
    clearInterval(timerInterval);
    
    showPopup("🏆 YOU MASTERED ALL WORDS! 🏆", "correct");
    messageArea.innerHTML = `
        <div class="alert alert-success">
            🎉 Congratulations! You've completed all levels!<br>
            Final Score: ${score} points
        </div>
    `;
    
    guessBtn.disabled = true;
    guessInput.disabled = true;
    hintBtn.disabled = true;
    
    // Save to leaderboard
    saveToLeaderboard();
}

// Use hint
function useHint() {
    if (!gameActive) return;
    
    hintsUsed++;
    let revealedLetters = 0;
    let hintText = currentHint;
    
    // Reveal 2 random letters from the word
    const wordLetters = currentWord.split('');
    const revealed = [];
    
    for (let i = 0; i < Math.min(3, wordLetters.length); i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * wordLetters.length);
        } while (revealed.includes(randomIndex));
        
        revealed.push(randomIndex);
        revealedLetters++;
    }
    
    revealed.sort((a, b) => a - b);
    const revealedWord = wordLetters.map((letter, index) => 
        revealed.includes(index) ? letter : '?'
    ).join('');
    
    hintText += `<br><br><strong>Revealed letters:</strong> ${revealedWord}`;
    
    hintSpan.innerHTML = hintText;
    
    // Reduce time for using hint
    timeLeft = Math.max(timeLeft - 3, 5);
    showMessage(`Hint used! -3 seconds`, "info");
    
    // Visual feedback
    hintBtn.style.transform = "scale(0.95)";
    setTimeout(() => {
        hintBtn.style.transform = "scale(1)";
    }, 200);
}

// Show wrong animation
function showWrongAnimation() {
    document.body.style.animation = "shake 0.3s ease";
    setTimeout(() => {
        document.body.style.animation = "";
    }, 300);
}

// Show correct animation
function showCorrectAnimation() {
    createConfetti();
}

// Create confetti effect
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.innerHTML = ['🎉', '✨', '⭐', '🌟', '🎊'][Math.floor(Math.random() * 5)];
        confetti.style.cssText = `
            position: fixed;
            left: ${Math.random() * window.innerWidth}px;
            top: -20px;
            font-size: ${Math.random() * 20 + 10}px;
            animation: floatDown ${Math.random() * 2 + 1}s ease-out forwards;
            pointer-events: none;
            z-index: 1000;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 2000);
    }
}

// Show popup message
function showPopup(message, type) {
    const popup = document.createElement('div');
    popup.className = type === 'correct' ? 'correct-popup' : 'wrong-popup';
    popup.innerHTML = message;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

// Show level up animation
function showLevelUpAnimation() {
    const levelUpDiv = document.createElement('div');
    levelUpDiv.className = 'level-up';
    levelUpDiv.innerHTML = `🎊 LEVEL ${currentLevel} UNLOCKED! 🎊`;
    document.body.appendChild(levelUpDiv);
    
    createConfetti();
    
    setTimeout(() => levelUpDiv.remove(), 1500);
}

// Show message
function showMessage(message, type) {
    messageArea.innerHTML = `<div class="alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'}">${message}</div>`;
    setTimeout(() => {
        if (messageArea.innerHTML.includes(message)) {
            messageArea.innerHTML = "";
        }
    }, 3000);
}

// Next word
function nextWord() {
    loadNewWord();
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes floatDown {
        0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Event Listeners
guessBtn.addEventListener('click', checkAnswer);
hintBtn.addEventListener('click', useHint);
nextBtn.addEventListener('click', nextWord);
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && gameActive) {
        checkAnswer();
    }
});
document.getElementById('clearScoresBtn').addEventListener('click', clearLeaderboard);

// Create animated bubbles
function createBubbles() {
    const bg = document.getElementById('animatedBg');
    for (let i = 0; i < 30; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const size = Math.random() * 100 + 50;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.top = `${Math.random() * 100}%`;
        bubble.style.animationDelay = `${Math.random() * 10}s`;
        bubble.style.animationDuration = `${Math.random() * 10 + 10}s`;
        bg.appendChild(bubble);
    }
}

// Initialize game
function init() {
    createBubbles();
    loadData();
    loadNewWord();
}

init();