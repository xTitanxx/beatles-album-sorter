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

const authors = [
    { name: "John Lennon", id: "John", bgImg: "let_it_be.png", bgX: "0%" },
    { name: "Paul McCartney", id: "Paul", bgImg: "let_it_be.png", bgX: "33.3%" },
    { name: "George Harrison", id: "George", bgImg: "let_it_be.png", bgX: "66.6%" },
    { name: "Ringo Starr", id: "Ringo", bgImg: "let_it_be.png", bgX: "100%" },
    { name: "Lennon-McCartney", id: "Lennon-McCartney", bgImg: "https://upload.wikimedia.org/wikipedia/commons/d/df/The_Beatles_at_Kennedy_Airport_1964.jpg", bgX: "center" }
];

let currentMode = 'album'; // 'album' or 'writer'
let roundAlbums = []; // Shuffled queue for the session
let currentSong = null;
let score = 0;
let highscore = sessionStorage.getItem('beatles_highscore_album') || 0;
let round = 1;
const maxRounds = 10;
let audio = new Audio();
let audioTimeout = null;
let isAnswered = false;
let gameState = 'waiting'; // 'waiting', 'playing', 'answered'
let playedSongs = new Set();
let runHistory = [];

const albumGrid = document.getElementById('album-grid');
const authorGrid = document.getElementById('author-grid');
const playBtn = document.getElementById('play-btn');
const playBtnText = document.getElementById('play-btn-text');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const roundEl = document.getElementById('round');
const visualizer = document.querySelector('.visualizer');
const modeBtns = document.querySelectorAll('.mode-btn');

function init() {
    renderAlbums();
    renderAuthors();
    setupModeToggle();
    resetGame(currentMode);
}

function setupModeToggle() {
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.classList.contains('active')) return;
            
            modeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const newMode = e.target.id === 'mode-album' ? 'album' : 'writer';
            resetGame(newMode);
        });
    });
}

function resetGame(mode) {
    currentMode = mode;
    score = 0;
    round = 1;
    playedSongs.clear();
    runHistory = [];
    isAnswered = false;
    audio.pause();
    clearTimeout(audioTimeout);
    visualizer.classList.remove('visualizing');
    
    highscore = sessionStorage.getItem(`beatles_highscore_${mode}`) || 0;
    highscoreEl.textContent = `Highscore: ${highscore}`;
    scoreEl.textContent = `Score: ${score}`;
    roundEl.textContent = `Round: ${round}/${maxRounds}`;
    
    document.querySelector('.rundown-container')?.remove();
    document.querySelector('.main-btn[onclick]')?.remove();

    if (mode === 'album') {
        albumGrid.classList.remove('hidden');
        authorGrid.classList.add('hidden');
        playBtn.classList.remove('hidden');
    } else {
        albumGrid.classList.add('hidden');
        authorGrid.classList.remove('hidden');
        playBtn.classList.remove('hidden');
    }

    roundAlbums = [...albums].sort(() => Math.random() - 0.5).slice(0, 10);
    
    // Re-bind play button to ensure clean slate
    playBtn.removeEventListener('click', handlePlayClick);
    playBtn.addEventListener('click', handlePlayClick);
    
    fetchNewSong();
}

function handlePlayClick() {
    if (gameState === 'waiting') {
        playSnippet();
    } else if (gameState === 'answered') {
        nextRound(true);
    }
}

function getCredits(songName) {
    const title = songName.toLowerCase();
    
    // George and Ringo
    const harrisonSongs = ["something", "here comes the sun", "while my guitar gently weeps", "taxman", "within you without you", "if i needed someone", "old brown shoe", "piggies", "savoy truffle", "long, long, long", "i me mine", "for you blue", "think for yourself", "the inner light", "i want to tell you", "love you to", "blue jay way", "don't bother me"];
    const starkeySongs = ["octopus's garden", "don't pass me by"];
    
    if (harrisonSongs.some(s => title.includes(s))) return "George";
    if (starkeySongs.some(s => title.includes(s))) return "Ringo";

    // Primary John Lennon
    const lennonSongs = ["help!", "ticket to ride", "in my life", "norwegian wood", "strawberry fields forever", "i am the walrus", "all you need is love", "lucy in the sky with diamonds", "a hard day's night", "revolution", "come together", "don't let me down", "julia", "dear prudence", "happiness is a warm gun", "across the universe", "nowhere man", "girl", "i feel fine", "day tripper", "ticket to ride", "please please me", "you're going to lose that girl", "hide your love away", "run for your life", "rain", "she said she said", "and your bird can sing", "doctor robert", "i'm only sleeping", "good morning good morning", "mr. kite", "glass onion", "bungalow bill", "sexy sadie", "cry baby cry", "yer blues", "everybody's got something to hide"];
    
    if (lennonSongs.some(s => title.includes(s))) return "John";

    // Primary Paul McCartney
    const mccartneySongs = ["yesterday", "hey jude", "let it be", "eleanor rigby", "penny lane", "blackbird", "here, there and everywhere", "ob-la-di", "get back", "hello, goodbye", "the long and winding road", "paperback writer", "michelle", "i saw her standing there", "can't buy me love", "all my loving", "drive my car", "got to get you into my life", "good day sunshine", "for no one", "fixing a hole", "getting better", "she's leaving home", "when i'm sixty-four", "lovely rita", "back in the u.s.s.r.", "martha my dear", "i will", "mother nature's son", "helter skelter", "honey pie", "lady madonna", "oh! darling", "maxwell's silver hammer", "you never give me your money", "golden slumbers"];

    if (mccartneySongs.some(s => title.includes(s))) return "Paul";

    // True collaborations or extremely ambiguous
    const coWritten = ["a day in the life", "i want to hold your hand", "she loves you", "eight days a week", "we can work it out", "baby you're a rich man", "i've got a feeling", "with a little help from my friends"];
    
    if (coWritten.some(s => title.includes(s))) return "Lennon-McCartney";

    // Default fallback to the official historical credit block if not explicitly mapped above
    return "Lennon-McCartney";
}

function renderAlbums() {
    albumGrid.innerHTML = '';
    albums.forEach(album => {
        const card = document.createElement('div');
        card.className = 'card album-card';
        card.innerHTML = `
            <img src="${album.img}" alt="${album.name}">
            <div class="card-name">${album.name}</div>
        `;
        card.addEventListener('click', () => checkAnswer(album, card));
        albumGrid.appendChild(card);
    });
}

function renderAuthors() {
    authorGrid.innerHTML = '';
    authors.forEach(author => {
        const card = document.createElement('div');
        card.className = 'card author-card';
        card.innerHTML = `
            <div class="author-img" style="background-image: url('${author.bgImg}'); background-position-x: ${author.bgX};"></div>
            <div class="card-name">${author.name}</div>
        `;
        card.addEventListener('click', () => checkAnswer(author, card));
        authorGrid.appendChild(card);
    });
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
    const btnContent = document.getElementById('play-btn-content');
    if (audio.paused && gameState !== 'answered') {
        gameState = 'playing';
        audio.currentTime = 0;
        audio.play();
        visualizer.classList.add('visualizing');
        visualizer.classList.remove('hidden');
        btnContent.classList.add('hidden');
        playBtn.disabled = true;

        audioTimeout = setTimeout(() => {
            audio.pause();
            visualizer.classList.remove('visualizing');
            visualizer.classList.add('hidden');
            btnContent.classList.remove('hidden');
            playBtn.disabled = false;
            if (gameState === 'playing') gameState = 'waiting';
        }, 4000);
    }
}

function checkAnswer(selection, card) {
    if (isAnswered) return;

    isAnswered = true;
    gameState = 'answered';
    clearTimeout(audioTimeout);
    audio.pause();
    visualizer.classList.remove('visualizing');
    visualizer.classList.add('hidden');
    document.getElementById('play-btn-content').classList.remove('hidden');

    let isCorrect = false;
    let correctAnswerStr = "";
    
    if (currentMode === 'album') {
        isCorrect = selection.name === currentSong.correctAlbum.name;
        correctAnswerStr = currentSong.correctAlbum.name;
    } else {
        isCorrect = selection.id === currentSong.credits;
        correctAnswerStr = currentSong.credits;
    }

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
        const correctText = currentMode === 'album' 
            ? `Wrong! That was ${currentSong.trackName} from ${currentSong.correctAlbum.name}`
            : `Wrong! That was written by ${currentSong.credits}`;
        feedbackEl.textContent = correctText;
        feedbackEl.style.color = "var(--error)";

        // Highlight correct card
        const grid = currentMode === 'album' ? albumGrid : authorGrid;
        const cards = grid.querySelectorAll('.card');
        cards.forEach(c => {
            const nameEl = c.querySelector('.card-name').textContent;
            // For authors, we want to match the ID which might be "Paul" while name is "Paul McCartney"
            // Since our logic binds the original object, we just look up by text content
            if (currentMode === 'album' && nameEl === currentSong.correctAlbum.name) {
                c.classList.add('correct');
            } else if (currentMode === 'writer') {
                const targetAuthor = authors.find(a => a.id === currentSong.credits);
                if (targetAuthor && nameEl === targetAuthor.name) {
                    c.classList.add('correct');
                }
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

let timelineEvents = [];
let userTimeline = Array(10).fill(null);

const timelineContainer = document.getElementById('timeline-container');
const eventPool = document.getElementById('event-pool');
const timelineSlots = document.getElementById('timeline-slots');
const submitTimelineBtn = document.getElementById('submit-timeline');
const audioControls = document.getElementById('audio-controls');

function init() {
    // Mode buttons
    document.getElementById('mode-album').addEventListener('click', () => switchMode('album'));
    document.getElementById('mode-writer').addEventListener('click', () => switchMode('writer'));
    document.getElementById('mode-timeline').addEventListener('click', () => switchMode('timeline'));

    playBtn.addEventListener('click', () => {
        if (gameState === 'waiting') {
            playSnippet();
        } else if (gameState === 'answered') {
            nextRound(true);
        }
    });

    submitTimelineBtn.addEventListener('click', checkTimeline);

    loadHighscores();
    switchMode('album');
}

function switchMode(mode) {
    currentMode = mode;
    gameState = 'waiting';
    round = 1;
    score = 0;
    isAnswered = false;
    runHistory = [];
    selectedEventEl = null;

    // Reset UI
    albumGrid.classList.add('hidden');
    authorGrid.classList.add('hidden');
    timelineContainer.classList.add('hidden');
    audioControls.classList.add('hidden');
    feedbackEl.classList.remove('show', 'results');
    feedbackEl.textContent = '';
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');

    roundEl.textContent = `Round: ${round}/${maxRounds}`;
    scoreEl.textContent = `Score: ${score}`;
    const highscoreKey = mode === 'timeline' ? `beatles_highscore_timeline` : `beatles_highscore_${mode}`;
    highscore = parseInt(sessionStorage.getItem(highscoreKey)) || 0;
    highscoreEl.textContent = `Highscore: ${highscore}`;

    if (mode === 'timeline') {
        initTimeline();
    } else {
        audioControls.classList.remove('hidden');
        if (mode === 'album') {
            albumGrid.classList.remove('hidden');
            renderAlbums();
        } else {
            authorGrid.classList.remove('hidden');
            renderAuthors();
        }
        fetchNewSong(false);
    }
}

function initTimeline() {
    timelineContainer.classList.remove('hidden');
    eventPool.innerHTML = '';
    timelineSlots.innerHTML = '';
    userTimeline = Array(10).fill(null);
    submitTimelineBtn.classList.add('hidden');
    submitTimelineBtn.textContent = "Finish & Check Order";
    submitTimelineBtn.onclick = null; // Reset click handler if previously set for "Play Again"
    selectedEventEl = null;

    // Pick 10 events with unique years
    const yearMap = new Map();
    beatlesEvents.forEach(ev => {
        if (!yearMap.has(ev.year)) yearMap.set(ev.year, []);
        yearMap.get(ev.year).push(ev);
    });

    const uniqueYears = Array.from(yearMap.keys()).sort(() => 0.5 - Math.random()).slice(0, 10);
    timelineEvents = uniqueYears.map(year => {
        const eventsForYear = yearMap.get(year);
        return eventsForYear[Math.floor(Math.random() * eventsForYear.length)];
    });

    // Create Pool
    timelineEvents.forEach((ev, idx) => {
        const item = document.createElement('div');
        item.className = 'timeline-event';
        item.textContent = ev.event;
        item.dataset.idx = idx;
        item.id = `event-${idx}`;
        
        item.addEventListener('click', () => {
            if (gameState === 'answered') return;
            if (selectedEventEl) selectedEventEl.classList.remove('selected');
            selectedEventEl = item;
            item.classList.add('selected');
        });
        
        eventPool.appendChild(item);
    });

    // Create Slots (1950 - 1990)
    for (let i = 0; i < 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'timeline-slot';
        slot.dataset.slotIdx = i;
        
        slot.addEventListener('click', () => {
            if (gameState === 'answered') return;
            if (selectedEventEl && slot.children.length === 0) {
                slot.appendChild(selectedEventEl);
                selectedEventEl.classList.remove('selected');
                userTimeline[i] = timelineEvents[parseInt(selectedEventEl.dataset.idx)];
                selectedEventEl = null;
                checkPoolEmpty();
            } else if (slot.children.length > 0) {
                const item = slot.firstChild;
                eventPool.appendChild(item);
                userTimeline[i] = null;
                checkPoolEmpty();
            }
        });
        
        timelineSlots.appendChild(slot);
    }
}

function checkPoolEmpty() {
    if (eventPool.children.length === 0) {
        submitTimelineBtn.classList.remove('hidden');
    }
}

function checkTimeline() {
    gameState = 'answered';
    let timelineScore = 0;
    const slots = timelineSlots.querySelectorAll('.timeline-slot');
    
    slots.forEach((slot, i) => {
        const eventItem = slot.querySelector('.timeline-event');
        const userEvent = userTimeline[i];
        
        const yearTag = document.createElement('div');
        yearTag.className = 'year-label';
        yearTag.textContent = userEvent.year;
        slot.appendChild(yearTag);

        // Simple scoring: Is current event year >= previous event year?
        // Since we ensure unique years, we can just check if they are in increasing order.
        if (i === 0 || userEvent.year > userTimeline[i-1].year) {
            eventItem.classList.add('correct-pos');
            timelineScore++;
        } else {
            eventItem.classList.add('wrong-pos');
        }
    });

    score = timelineScore;
    scoreEl.textContent = `Score: ${score}`;
    
    if (score > highscore) {
        highscore = score;
        sessionStorage.setItem(`beatles_highscore_timeline`, highscore);
        highscoreEl.textContent = `Highscore: ${highscore}`;
    }

    submitTimelineBtn.textContent = "Play Again";
    
    feedbackEl.innerHTML = `Timeline Results: ${score}/10 correct chronological steps!`;
    feedbackEl.classList.add('show');
}

init();
