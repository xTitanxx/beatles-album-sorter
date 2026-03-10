const albums = [
    { name: "Please Please Me", exactName: "Please Please Me", year: 1963, img: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/9c/ff/b5/9cffb5a6-a37f-c84a-7240-0333a071bc92/00602567725275.rgb.jpg/600x600bb.jpg" },
    { name: "With The Beatles", exactName: "With The Beatles", year: 1963, img: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/03/02/d2/0302d204-77c1-0c87-e03a-698bd31cf038/00602567725619.rgb.jpg/600x600bb.jpg" },
    { name: "A Hard Day's Night", exactName: "A Hard Day's Night", year: 1964, img: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/db/a2/7a/dba27a46-3685-508d-d32e-a0e73cc82251/00602567713296.rgb.jpg/600x600bb.jpg" },
    { name: "Beatles for Sale", exactName: "Beatles for Sale", year: 1964, img: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/79/2c/10/792c1019-387f-e819-ac8f-bc989f20a970/00602567725190.rgb.jpg/600x600bb.jpg" },
    { name: "Help!", exactName: "Help!", year: 1965, img: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/1a/19/db/1a19db26-17ad-b986-11a9-f72ac7a6194b/18UMGIM31214.rgb.jpg/600x600bb.jpg" },
    { name: "Rubber Soul", exactName: "Rubber Soul", year: 1965, img: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/af/20/aa/af20aa89-4002-11fb-25d8-ff544af67eb4/00602567725404.rgb.jpg/600x600bb.jpg" },
    { name: "Revolver", exactName: "Revolver", year: 1966, img: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/f4/3a/97f43ab4-9fdf-7a41-e430-7c6c313f3883/13UMGIM63887.rgb.jpg/600x600bb.jpg" },
    { name: "Sgt. Pepper's", exactName: "Sgt. Pepper's Lonely Hearts Club Band", year: 1967, img: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/64/85/d2/6485d219-91ac-5481-2668-7eab1320436d/21UMGIM57007.rgb.jpg/600x600bb.jpg" },
    { name: "Magical Mystery Tour", exactName: "Magical Mystery Tour", year: 1967, img: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/43/0e/37/430e3790-75d5-c96a-1380-f9d9803aa700/18UMGIM31245.rgb.jpg/600x600bb.jpg" },
    { name: "The Beatles (White Album)", exactName: "The Beatles", year: 1968, img: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/fa/5b/89/fa5b898d-bad6-e053-4195-260e5c74f2bb/00602567725466.rgb.jpg/600x600bb.jpg" },
    { name: "Abbey Road", exactName: "Abbey Road", year: 1969, img: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/48/53/43/485343e3-dd6a-0034-faec-f4b6403f8108/13UMGIM63890.rgb.jpg/600x600bb.jpg" },
    { name: "Let It Be", exactName: "Let It Be", year: 1970, img: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5f/ff/9a/5fff9a6a-bb13-6507-5e68-2793ef798834/21UMGIM61121.rgb.jpg/600x600bb.jpg" }
];

let roundAlbums = []; // Shuffled queue for the session
let currentSong = null;
let score = 0;
let highscore = sessionStorage.getItem('beatles_highscore') || 0;
let round = 1;
const maxRounds = 10;
let audio = new Audio();
let audioTimeout = null;
let isAnswered = false;
let gameState = 'waiting'; // 'waiting', 'playing', 'answered'
let playedSongs = new Set();
let runHistory = [];

const albumGrid = document.getElementById('album-grid');
const playBtn = document.getElementById('play-btn');
const playBtnText = document.getElementById('play-btn-text');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const roundEl = document.getElementById('round');
const visualizer = document.querySelector('.visualizer');

function init() {
    renderAlbums();
    highscoreEl.textContent = `Highscore: ${highscore}`;

    // Create a balanced shuffled queue for the session (10 random unique albums)
    roundAlbums = [...albums].sort(() => Math.random() - 0.5).slice(0, 10);

    fetchNewSong();
    playBtn.addEventListener('click', handlePlayClick);
}

function handlePlayClick() {
    if (gameState === 'waiting') {
        playSnippet();
    } else if (gameState === 'answered') {
        nextRound(true);
    }
}

function getCredits(songName) {
    const harrisonSongs = ["Something", "Here Comes the Sun", "While My Guitar Gently Weeps", "Taxman", "Within You Without You", "If I Needed Someone", "Old Brown Shoe", "Piggies", "Savoy Truffle", "Long, Long, Long", "I Me Mine", "For You Blue", "Think For Yourself", "The Inner Light", "I Want to Tell You", "Love You To"];
    const starkeySongs = ["Octopus's Garden", "Don't Pass Me By"];

    if (harrisonSongs.some(s => songName.toLowerCase().includes(s.toLowerCase()))) return "George Harrison";
    if (starkeySongs.some(s => songName.toLowerCase().includes(s.toLowerCase()))) return "Richard Starkey";
    return "Lennon/McCartney";
}

function renderAlbums() {
    albumGrid.innerHTML = '';
    albums.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.innerHTML = `
            <img src="${album.img}" alt="${album.name}">
            <div class="album-name">${album.name}</div>
        `;
        card.addEventListener('click', () => checkAnswer(album, card));
        albumGrid.appendChild(card);
    });
}

async function fetchNewSong(autoPlay = false) {
    try {
        gameState = 'waiting';
        isAnswered = false;
        feedbackEl.classList.remove('show', 'results');
        playBtnText.textContent = "Play Snippet (4s)";
        playBtn.disabled = true;

        // Pick the next album from our balanced queue
        const targetAlbum = roundAlbums[round - 1];

        // Search term using the exact official name
        const query = encodeURIComponent(`the beatles ${targetAlbum.exactName}`);
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=50`);
        const data = await response.json();

        // Regex strictly matches exact album name, plus optional space and parentheses or brackets (e.g. " (Remastered)")
        // This prevents "The Beatles" from matching "The Beatles 1967-1970" or "The Beatles 1"
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const targetRegex = new RegExp('^' + escapeRegExp(targetAlbum.exactName) + '(?: \\(.*\\)| \\[.*\\])?$', 'i');

        const validSongs = data.results.filter(song => {
            const isTargetAlbum = targetRegex.test(song.collectionName);
            const isPlayed = playedSongs.has(song.trackId);
            return isTargetAlbum && !isPlayed;
        });

        if (validSongs.length === 0) {
            // If somehow no songs found (unlikely), fallback to random but it should work with limit 50
            return fetchNewSong(autoPlay);
        }

        const randomSong = validSongs[Math.floor(Math.random() * validSongs.length)];
        playedSongs.add(randomSong.trackId);

        currentSong = {
            ...randomSong,
            correctAlbum: targetAlbum,
            year: targetAlbum.year, // Use original year from our data
            credits: getCredits(randomSong.trackName)
        };

        audio.src = currentSong.previewUrl;
        playBtn.disabled = false;

        if (autoPlay) {
            playSnippet();
        }

    } catch (error) {
        console.error("Error fetching song:", error);
        feedbackEl.textContent = "Error loading song. Retrying...";
        feedbackEl.classList.add('show');
        setTimeout(() => fetchNewSong(autoPlay), 2000);
    }
}

function playSnippet() {
    if (audio.paused && gameState !== 'answered') {
        gameState = 'playing';
        audio.currentTime = 0;
        audio.play();
        visualizer.classList.add('visualizing');
        playBtn.disabled = true;

        audioTimeout = setTimeout(() => {
            audio.pause();
            visualizer.classList.remove('visualizing');
            playBtn.disabled = false;
            if (gameState === 'playing') gameState = 'waiting';
        }, 4000);
    }
}

function checkAnswer(album, card) {
    if (isAnswered) return;

    isAnswered = true;
    gameState = 'answered';
    clearTimeout(audioTimeout);
    audio.pause();
    visualizer.classList.remove('visualizing');

    const isCorrect = album.name === currentSong.correctAlbum.name;

    // Store history
    runHistory.push({
        title: currentSong.trackName,
        album: currentSong.correctAlbum.name,
        img: currentSong.correctAlbum.img,
        year: currentSong.year,
        correct: isCorrect,
        credits: currentSong.credits
    });

    if (isCorrect) {
        score++;
        card.classList.add('correct');
        feedbackEl.textContent = `Correct! That was ${currentSong.trackName}`;
        feedbackEl.style.color = "var(--success)";
    } else {
        card.classList.add('wrong');
        feedbackEl.textContent = `Wrong! That was ${currentSong.trackName} from ${currentSong.correctAlbum.name}`;
        feedbackEl.style.color = "var(--error)";

        // Highlight correct album
        const cards = document.querySelectorAll('.album-card');
        cards.forEach(c => {
            if (c.querySelector('.album-name').textContent === currentSong.correctAlbum.name) {
                c.classList.add('correct');
            }
        });
    }

    feedbackEl.classList.add('show');
    scoreEl.textContent = `Score: ${score}`;

    if (round === maxRounds) {
        playBtnText.textContent = "See Final Results";
    } else {
        playBtnText.textContent = "Play Next Song";
    }
    playBtn.disabled = false;
}

function nextRound(autoPlay = false) {
    if (round < maxRounds) {
        round++;
        roundEl.textContent = `Round: ${round}/${maxRounds}`;
        const cards = document.querySelectorAll('.album-card');
        cards.forEach(c => {
            c.classList.remove('correct', 'wrong');
        });
        fetchNewSong(autoPlay);
    } else {
        showFinalResults();
    }
}

function showFinalResults() {
    if (score > highscore) {
        highscore = score;
        sessionStorage.setItem('beatles_highscore', highscore);
        highscoreEl.textContent = `Highscore: ${highscore}`;
    }

    albumGrid.classList.add('hidden');
    playBtn.classList.add('hidden');
    visualizer.classList.add('hidden'); // Hide visualizer dots
    feedbackEl.innerHTML = `Game Over!<br>Final Score: ${score}/${maxRounds}`;
    feedbackEl.classList.add('results');
    feedbackEl.style.color = score >= 8 ? "var(--success)" : "var(--text-primary)";

    const rundownContainer = document.createElement('div');
    rundownContainer.className = 'rundown-container';

    runHistory.forEach(item => {
        const row = document.createElement('div');
        row.className = `rundown-item ${item.correct ? 'item-correct' : 'item-wrong'}`;
        row.innerHTML = `
            <img src="${item.img}" alt="${item.album}">
            <div class="song-info">
                <span class="song-title">${item.title}</span>
                <span class="song-credits">${item.credits}</span>
            </div>
            <div class="album-info">
                ${item.album} (${item.year})
            </div>
            <div class="result-tag">${item.correct ? 'Correct' : 'Wrong'}</div>
        `;
        rundownContainer.appendChild(row);
    });

    document.querySelector('main').appendChild(rundownContainer);

    const restartBtn = document.createElement('button');
    restartBtn.className = 'main-btn';
    restartBtn.innerHTML = '<div class="play-icon"></div><span>Play Again</span>';
    restartBtn.style.margin = "2rem auto";
    restartBtn.onclick = () => window.location.reload();
    document.querySelector('main').appendChild(restartBtn);
}

init();
