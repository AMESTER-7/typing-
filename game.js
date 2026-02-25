
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3ZwWo8df2_8YKkeupwgWj5oA2OWlXOuY",
  authDomain: "typing-game-2ae52.firebaseapp.com",
  databaseURL: "https://typing-game-2ae52-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "typing-game-2ae52",
  storageBucket: "typing-game-2ae52.firebasestorage.app",
  messagingSenderId: "343867373599",
  appId: "1:343867373599:web:8b3a96de4b369c1963fd2a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- 1. USER SETUP ---
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
            correct = false; 
        } else if (character !== arrayQuote[index]) {
            correct = false; 
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
    quoteInputElement.disabled = true;
    
    const timeInSeconds = Math.floor((new Date() - startTime) / 1000);
    const timeInMinutes = timeInSeconds / 60;
    const totalChars = quoteInputElement.value.length;
    
    const wpm = timeInMinutes > 0 ? Math.round((totalChars / 5) / timeInMinutes) : 0; 
    wpmElement.innerText = wpm;

    // --- SEND SCORE TO FIREBASE ---
    db.ref('leaderboard').push({
        name: currentUser,
        wpm: wpm
    });
}

function resetGame() {
    quoteInputElement.value = '';
    quoteInputElement.disabled = false;
    timeElement.innerText = 0;
    wpmElement.innerText = 0;
    clearInterval(timer);
    gameActive = false;
}

// --- 3. LEADERBOARD LOGIC (READING FROM FIREBASE) ---
const leaderboardList = document.getElementById('leaderboard-list');

// This listens to the database in real-time!
db.ref('leaderboard').orderByChild('wpm').limitToLast(10).on('value', (snapshot) => {
    let scores = [];
    
    // Grab all scores from the database
    snapshot.forEach((childSnapshot) => {
        scores.push(childSnapshot.val());
    });

    // Sort them from highest WPM to lowest
    scores.sort((a, b) => b.wpm - a.wpm);

    // Clear the current list
    leaderboardList.innerHTML = '';

    // Create HTML for each score
    scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.style.padding = "5px";
        li.style.borderBottom = "1px solid #ddd";
        li.innerHTML = `<strong>#${index + 1}</strong> ${score.name} - <strong>${score.wpm} WPM</strong>`;
        leaderboardList.appendChild(li);
    });
});
