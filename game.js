// --- 1. USER SETUP (No Sign-in Logic) ---
let currentUser = localStorage.getItem('typingGameUser');

if (!currentUser) {
    document.getElementById('name-setup').classList.remove('hidden');
} else {
    startGameUI(currentUser);
}

function saveName() {
    const nameInput = document.getElementById('username-input').value.trim();
    if (nameInput) {
        localStorage.setItem('typingGameUser', nameInput);
        startGameUI(nameInput);
    }
}

function startGameUI(name) {
    currentUser = name;
    document.getElementById('name-setup').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
    document.getElementById('scoreboard').classList.remove('hidden');
    document.getElementById('welcome-message').innerText = `Welcome, ${name}!`;
}

// --- 2. GAME LOGIC ---
const quoteDisplayElement = document.getElementById('quote-display');
const quoteInputElement = document.getElementById('quote-input');
const timeElement = document.getElementById('time-display');
const wpmElement = document.getElementById('wpm-display');

let timer, startTime;
let gameActive = false;

quoteInputElement.addEventListener('input', () => {
    // Start timer on first keystroke
    if (!gameActive) {
        startTimer();
        gameActive = true;
    }

    const arrayQuote = quoteDisplayElement.innerText.split('');
    const arrayValue = quoteInputElement.value.split('');
    let correct = true;

    arrayQuote.forEach((characterSpan, index) => {
        const character = arrayValue[index];
        if (character == null) {
            correct = false; // Haven't typed it yet
        } else if (character === arrayQuote[index]) {
            // They typed the right character (You can add CSS colors here later!)
        } else {
            correct = false; // They made a mistake
        }
    });

    if (correct && arrayValue.length === arrayQuote.length) {
        finishGame();
    }
});

function startTimer() {
    timeElement.innerText = 0;
    startTime = new Date();
    timer = setInterval(() => {
        timeElement.innerText = Math.floor((new Date() - startTime) / 1000);
    }, 1000);
}

function finishGame() {
    clearInterval(timer);
    gameActive = false;
    
    // Calculate WPM: (Total characters / 5) / time in minutes
    const timeInSeconds = Math.floor((new Date() - startTime) / 1000);
    const timeInMinutes = timeInSeconds / 60;
    const totalChars = quoteInputElement.value.length;
    
    // Prevent divide by zero if they somehow finish instantly
    const wpm = timeInMinutes > 0 ? Math.round((totalChars / 5) / timeInMinutes) : 0; 
    wpmElement.innerText = wpm;

    quoteInputElement.disabled = true;

    // TODO: Send WPM and currentUser to Firebase Database here!
    console.log(`Sending to Database: ${currentUser} scored ${wpm} WPM`);
}

function resetGame() {
    quoteInputElement.value = '';
    quoteInputElement.disabled = false;
    timeElement.innerText = 0;
    wpmElement.innerText = 0;
    clearInterval(timer);
    gameActive = false;
}
