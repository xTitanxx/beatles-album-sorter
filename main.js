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
    { name: "John Lennon", id: "John", bgImg: "assets/john.png", bgX: "center" },
    { name: "Paul McCartney", id: "Paul", bgImg: "assets/paul.png", bgX: "center" },
    { name: "George Harrison", id: "George", bgImg: "assets/george.png", bgX: "center" },
    { name: "Ringo Starr", id: "Ringo", bgImg: "assets/ringo.png", bgX: "center" },
    { name: "Lennon-McCartney", id: "Lennon-McCartney", bgImg: "assets/lennon-mccartney.png", bgX: "center" },
    { name: "All Four", id: "All4", bgImg: "assets/all4.png", bgX: "center" },
    { name: "Cover", id: "Cover", bgImg: "assets/cover.png", bgX: "center" }
];

let currentMode = 'album'; // 'album', 'writer', or 'timeline'
let roundAlbums = []; 
let currentSong = null;
let score = 0;
let highscore = 0;
let round = 1;
const maxRounds = 10;
let audio = new Audio();
let audioTimeout = null;
let isAnswered = false;
let gameState = 'waiting'; 
let playedSongs = new Set();
let runHistory = [];
let timelineEvents = [];
let userTimeline = Array(10).fill(null);
let selectedEventEl = null;

const albumGrid = document.getElementById('album-grid');
const authorGrid = document.getElementById('author-grid');
const timelineContainer = document.getElementById('timeline-container');
const eventPool = document.getElementById('event-pool');
const timelineSlots = document.getElementById('timeline-slots');
const submitTimelineBtn = document.getElementById('submit-timeline');
const audioControls = document.getElementById('audio-controls');
const playBtn = document.getElementById('play-btn');
const playBtnText = document.getElementById('play-btn-text');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const roundEl = document.getElementById('round');
const getViz = () => playBtn.querySelector('.visualizer');

function init() {
    renderAlbums();
    renderAuthors();
    
    document.getElementById('mode-album').addEventListener('click', () => switchMode('album'));
    document.getElementById('mode-writer').addEventListener('click', () => switchMode('writer'));
    document.getElementById('mode-timeline').addEventListener('click', () => switchMode('timeline'));

    playBtn.addEventListener('click', handlePlayClick);
    submitTimelineBtn.addEventListener('click', () => {
        if (gameState === 'answered') {
            switchMode('timeline');
        } else {
            checkTimeline();
        }
    });

    audio.onended = () => {
        if (gameState === 'playing') {
            stopAudioSnippet();
        }
    };

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
    playedSongs.clear();
    audio.pause();
    clearTimeout(audioTimeout);
    const viz = getViz();
    if (viz) { viz.classList.add('hidden'); viz.classList.remove('visualizing'); }
    document.getElementById('play-btn-content').classList.remove('hidden');

    // Reset UI
    albumGrid.classList.add('hidden');
    authorGrid.classList.add('hidden');
    timelineContainer.classList.add('hidden');
    audioControls.classList.add('hidden');
    playBtn.classList.remove('hidden');
    feedbackEl.classList.remove('show', 'results');
    feedbackEl.textContent = '';
    document.querySelectorAll('.rundown-container').forEach(el => el.remove());
    document.querySelectorAll('.restart-btn').forEach(el => el.remove());
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');

    roundEl.textContent = `Round: ${round}/${maxRounds}`;
    scoreEl.textContent = `Score: ${score}`;
    
    const highscoreKey = mode === 'timeline' ? `beatles_highscore_timeline` : `beatles_highscore_${mode}`;
    highscore = parseInt(sessionStorage.getItem(highscoreKey)) || 0;
    highscoreEl.textContent = `High: ${highscore}`;

    if (mode === 'timeline') {
        document.getElementById('round').classList.add('hidden');
        initTimeline();
    } else {
        document.getElementById('round').classList.remove('hidden');
        audioControls.classList.remove('hidden');
        roundAlbums = [...albums].sort(() => Math.random() - 0.5);
        if (mode === 'album') {
            albumGrid.classList.remove('hidden');
        } else {
            authorGrid.classList.remove('hidden');
        }
        roundEl.textContent = `Round ${round}/${maxRounds}`;
        fetchNewSong(false);
    }
}

function handlePlayClick() {
    if (gameState === 'waiting') {
        playSnippet();
    } else if (gameState === 'answered') {
        nextRound(true);
    }
}

async function fetchNewSong(autoPlay = false) {
    try {
        gameState = 'waiting';
        isAnswered = false;
        feedbackEl.classList.remove('show');
        playBtn.innerHTML = `
            <span id="play-btn-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                <span id="play-btn-text">Play Snippet</span>
            </span>
            <div class="visualizer hidden">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            </div>`;
        const playBtnText = document.getElementById('play-btn-text');
        playBtn.disabled = true;
        if (!roundAlbums || roundAlbums.length === 0) {
            roundAlbums = [...albums].sort(() => Math.random() - 0.5).slice(0, 10);
        }
        const targetAlbum = roundAlbums[Math.min(round - 1, roundAlbums.length - 1)];
        if (!targetAlbum) return;

        const query = encodeURIComponent(`the beatles ${targetAlbum.exactName}`);
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=50`);
        const data = await response.json();

        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const targetRegex = new RegExp('^' + escapeRegExp(targetAlbum.exactName) + '(?: \\(.*\\)| \\[.*\\])?$', 'i');

        const validSongs = data.results.filter(song => {
            const isTargetAlbum = targetRegex.test(song.collectionName);
            const isPlayed = playedSongs.has(song.trackId);
            return isTargetAlbum && !isPlayed;
        });

        if (validSongs.length === 0) {
            return fetchNewSong(autoPlay);
        }

        const randomSong = validSongs[Math.floor(Math.random() * validSongs.length)];
        playedSongs.add(randomSong.trackId);

        currentSong = {
            ...randomSong,
            correctAlbum: targetAlbum,
            year: targetAlbum.year,
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
        const viz = getViz();
        if (viz) { viz.classList.add('visualizing'); viz.classList.remove('hidden'); }
        btnContent.classList.add('hidden');
        playBtn.disabled = true;

        audioTimeout = setTimeout(() => {
            stopAudioSnippet();
        }, 4000);
    }
}

function stopAudioSnippet() {
    clearTimeout(audioTimeout);
    audio.pause();
    const viz = getViz();
    if (viz) { viz.classList.remove('visualizing'); viz.classList.add('hidden'); }
    document.getElementById('play-btn-content').classList.remove('hidden');
    playBtn.disabled = false;
    if (gameState === 'playing') gameState = 'waiting';
}

function checkAnswer(selection, card) {
    if (isAnswered) return;

    isAnswered = true;
    gameState = 'answered';
    stopAudioSnippet();

    let isCorrect = false;
    if (currentMode === 'album') {
        isCorrect = selection.name === currentSong.correctAlbum.name;
    } else {
        isCorrect = selection.id === currentSong.credits;
    }

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
            : `Wrong! "${currentSong.trackName}" was written by ${currentSong.credits}`;
        feedbackEl.textContent = correctText;
        feedbackEl.style.color = "var(--error)";

        const grid = currentMode === 'album' ? albumGrid : authorGrid;
        const cards = grid.querySelectorAll('.card');
        cards.forEach(c => {
            const nameEl = c.querySelector('.card-name').textContent;
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
        playBtn.innerHTML = `
            <span id="play-btn-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.94 10.47 5 9.35 5 8zm14 0c0 1.35-.94 2.47-2 2.82V7h2v1z"/></svg>
                <span id="play-btn-text">Results</span>
            </span>`;
    } else {
        playBtn.innerHTML = `
            <span id="play-btn-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                <span id="play-btn-text">Next Snippet</span>
            </span>`;
    }
    playBtn.disabled = false;
}

function nextRound(autoPlay = false) {
    if (round < maxRounds) {
        round++;
        roundEl.textContent = `Round ${round}/${maxRounds}`;
        document.querySelectorAll('.card').forEach(c => {
            c.classList.remove('correct', 'wrong');
        });
        fetchNewSong(autoPlay);
    } else {
        showFinalResults();
    }
}

function showFinalResults() {
    const highscoreKey = `beatles_highscore_${currentMode}`;
    if (score > highscore) {
        highscore = score;
        sessionStorage.setItem(highscoreKey, highscore);
        highscoreEl.textContent = `High: ${highscore}`;
    }

    albumGrid.classList.add('hidden');
    authorGrid.classList.add('hidden');
    playBtn.classList.add('hidden');
    const viz = getViz();
    if (viz) viz.classList.add('hidden');
    feedbackEl.innerHTML = `
        <div class="final-score-container">
            <div class="final-score-label">Final Score</div>
            <div class="final-score-value">${score}/${maxRounds}</div>
        </div>
    `;
    feedbackEl.classList.add('results', 'show');
    feedbackEl.style.color = score >= 8 ? "var(--accent-color)" : "var(--text-primary)";

    const rundownContainer = document.createElement('div');
    rundownContainer.className = 'rundown-container';

    runHistory.forEach(item => {
        const row = document.createElement('div');
        row.className = `rundown-item ${item.correct ? 'item-correct' : 'item-wrong'}`;
        row.innerHTML = `
            <img src="${item.img}" alt="${item.album}" style="border-radius: 8px;">
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
    restartBtn.className = 'main-btn restart-btn';
    restartBtn.style.display = "flex";
    restartBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg><span>Replay</span>';
    restartBtn.style.margin = "2rem auto";
    restartBtn.onclick = () => switchMode(currentMode);
    document.querySelector('main').appendChild(restartBtn);
}

function initTimeline() {
    gameState = 'waiting';
    timelineContainer.classList.remove('hidden');
    eventPool.innerHTML = '';
    timelineSlots.innerHTML = '';
    feedbackEl.classList.remove('show', 'results');
    feedbackEl.innerHTML = '';
    const oldRundown = timelineContainer.querySelector('.rundown-container');
    if (oldRundown) oldRundown.remove();

    userTimeline = Array(10).fill(null);
    submitTimelineBtn.classList.add('hidden');
    submitTimelineBtn.classList.remove('restart-btn');
    submitTimelineBtn.onclick = null;
    submitTimelineBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right:6px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span>Submit Timeline</span>';
    eventPool.classList.remove('collapsed');
    selectedEventEl = null;

    const yearMap = new Map();
    beatlesEvents.forEach(ev => {
        if (!yearMap.has(ev.year)) yearMap.set(ev.year, []);
        yearMap.get(ev.year).push(ev);
    });

    const uniqueYears = Array.from(yearMap.keys()).sort(() => 0.5 - Math.random()).slice(0, 10);
    timelineEvents = uniqueYears.map(year => {
        const eventsForYear = yearMap.get(year);
        return eventsForYear[Math.floor(Math.random() * eventsForYear.length)];
    }).sort((a, b) => a.year - b.year); 
    
    const poolEvents = [...timelineEvents].sort(() => 0.5 - Math.random());

    poolEvents.forEach((ev, idx) => {
        const item = document.createElement('div');
        item.className = 'timeline-event';
        item.draggable = true;
        item.innerHTML = `<div class="event-text">${ev.event}</div>`;
        item.dataset.year = ev.year;
        
        item.addEventListener('click', (e) => {
            if (gameState === 'answered') return;
            if (selectedEventEl) selectedEventEl.classList.remove('selected');
            selectedEventEl = item;
            item.classList.add('selected');
        });

        item.addEventListener('dragstart', (e) => {
            if (gameState === 'answered') return;
            selectedEventEl = item;
            item.classList.add('dragging');
            e.dataTransfer.setData('text/plain', ev.year);
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
        
        eventPool.appendChild(item);
    });

    timelineEvents.forEach((ev, i) => {
        const slotContainer = document.createElement('div');
        slotContainer.className = 'slot-container';
        
        const slot = document.createElement('div');
        slot.className = 'timeline-slot';
        slot.dataset.slotIdx = i;
        slot.dataset.targetYear = ev.year;
        slot.innerHTML = `<span class="slot-placeholder">DROP ${ev.year}</span>`;
        
        const yearBox = document.createElement('div');
        yearBox.className = 'year-pill';
        yearBox.textContent = ev.year;

        slotContainer.appendChild(slot);
        slotContainer.appendChild(yearBox);

        const placeEvent = (el) => {
            slot.innerHTML = '';
            slot.appendChild(el);
            el.classList.remove('selected', 'dragging');
            userTimeline[i] = timelineEvents.find(te => te.year === parseInt(el.dataset.year));
            addNavButtons(el, i);
            checkPoolEmpty();
        };

        const removeEvent = () => removeTimelineEvent(i);
        
        slot.addEventListener('click', (e) => {
            if (gameState === 'answered') return;
            const placed = slot.querySelector('.timeline-event');
            if (selectedEventEl && !placed) {
                // Empty slot — place selected event
                placeEvent(selectedEventEl);
                selectedEventEl = null;
            } else if (selectedEventEl && placed) {
                // Full slot — swap: return current to pool, place selected
                placed.querySelectorAll('.event-nav').forEach(n => n.remove());
                eventPool.appendChild(placed);
                eventPool.classList.remove('collapsed');
                userTimeline[i] = null;
                placeEvent(selectedEventEl);
                selectedEventEl = null;
            } else if (placed && !selectedEventEl) {
                // No selection — remove and return to pool
                removeEvent();
            }
        });

        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (gameState === 'answered') return;
            slot.classList.add('drag-over');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            if (gameState === 'answered' || !selectedEventEl) return;
            const placed = slot.querySelector('.timeline-event');
            if (placed) {
                // Swap: return current to pool, place dragged
                placed.querySelectorAll('.event-nav').forEach(n => n.remove());
                eventPool.appendChild(placed);
                eventPool.classList.remove('collapsed');
                userTimeline[i] = null;
            }
            placeEvent(selectedEventEl);
            selectedEventEl = null;
        });
        
        timelineSlots.appendChild(slotContainer);
    });
}

function addNavButtons(el, slotIdx) {
    el.querySelectorAll('.event-nav').forEach(n => n.remove());
    
    const leftBtn = document.createElement('button');
    leftBtn.className = 'event-nav nav-left';
    leftBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
    leftBtn.onclick = (e) => { e.stopPropagation(); moveEvent(slotIdx, -1); };
    
    const rightBtn = document.createElement('button');
    rightBtn.className = 'event-nav nav-right';
    rightBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
    rightBtn.onclick = (e) => { e.stopPropagation(); moveEvent(slotIdx, 1); };

    const removeBtn = document.createElement('button');
    removeBtn.className = 'event-nav nav-remove';
    removeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    removeBtn.onclick = (e) => { e.stopPropagation(); removeTimelineEvent(slotIdx); };
    
    el.appendChild(leftBtn);
    el.appendChild(rightBtn);
    el.appendChild(removeBtn);
}

function removeTimelineEvent(idx) {
    const slotContainer = timelineSlots.children[idx];
    if (!slotContainer) return;
    const slot = slotContainer.querySelector('.timeline-slot');
    const item = slot.querySelector('.timeline-event');
    if (item) {
        item.querySelectorAll('.event-nav').forEach(n => n.remove());
        eventPool.appendChild(item);
        slot.innerHTML = `<span class="slot-placeholder">DROP ${slot.dataset.targetYear}</span>`;
        userTimeline[idx] = null;
        eventPool.classList.remove('collapsed');
        checkPoolEmpty();
    }
}

function moveEvent(fromIdx, direction) {
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= 10 || gameState === 'answered') return;

    const fromSlot = timelineSlots.children[fromIdx].querySelector('.timeline-slot');
    const toSlot = timelineSlots.children[toIdx].querySelector('.timeline-slot');

    const fromEl = fromSlot.querySelector('.timeline-event');
    const toEl = toSlot.querySelector('.timeline-event');

    // Swap userTimeline data
    [userTimeline[fromIdx], userTimeline[toIdx]] = [userTimeline[toIdx], userTimeline[fromIdx]];

    // Clear slots
    fromSlot.innerHTML = '';
    toSlot.innerHTML = '';

    if (fromEl) {
        toSlot.appendChild(fromEl);
        addNavButtons(fromEl, toIdx);
    } else {
        toSlot.innerHTML = `<span class="slot-placeholder">DROP ${toSlot.dataset.targetYear}</span>`;
    }

    if (toEl) {
        fromSlot.appendChild(toEl);
        addNavButtons(toEl, fromIdx);
    } else {
        fromSlot.innerHTML = `<span class="slot-placeholder">DROP ${fromSlot.dataset.targetYear}</span>`;
    }
}

function checkPoolEmpty() {
    if (eventPool.children.length === 0) {
        submitTimelineBtn.classList.remove('hidden');
        eventPool.classList.add('collapsed');
    } else {
        eventPool.classList.remove('collapsed');
    }
}

function checkTimeline() {
    gameState = 'answered';
    let timelineScore = 0;
    const slotContainers = timelineSlots.querySelectorAll('.slot-container');
    
    const rundownHistory = [];

    slotContainers.forEach((container, i) => {
        const slot = container.querySelector('.timeline-slot');
        const eventItem = slot.querySelector('.timeline-event');
        const targetYear = parseInt(slot.dataset.targetYear);
        const userEvent = userTimeline[i];
        
        const isCorrect = userEvent && userEvent.year === targetYear;
        
        if (isCorrect) {
            eventItem.classList.add('correct-pos'); 
            timelineScore++;
        } else if (eventItem) {
            eventItem.classList.add('wrong-pos');
        }

        rundownHistory.push({
            event: userEvent ? userEvent.event : "Missing",
            year: userEvent ? userEvent.year : "N/A",
            targetYear: targetYear,
            correct: isCorrect,
            desc: userEvent ? userEvent.description : "No event placed.",
            correctEvent: timelineEvents[i].event,
            correctDesc: timelineEvents[i].description
        });
    });

    score = timelineScore;
    scoreEl.textContent = `Score: ${score}`;
    
    if (score > highscore) {
        highscore = score;
        sessionStorage.setItem(`beatles_highscore_timeline`, highscore);
        highscoreEl.textContent = `High: ${highscore}`;
    }

    submitTimelineBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
        <span>Play Again</span>`;
    submitTimelineBtn.onclick = () => switchMode('timeline');
    
    feedbackEl.innerHTML = `
        <div class="final-score-container">
            <div class="final-score-label">Timeline Accuracy</div>
            <div class="final-score-value">${score}/10</div>
        </div>
    `;
    feedbackEl.classList.add('show', 'results');

    const rundownContainer = document.createElement('div');
    rundownContainer.className = 'rundown-container timeline-rundown';
    
    rundownHistory.forEach(item => {
        const row = document.createElement('div');
        row.className = `rundown-item ${item.correct ? 'item-correct' : 'item-wrong'}`;
        row.innerHTML = `
            <div class="year-circle ${item.correct ? '' : 'wrong'}">${item.targetYear}</div>
            <div class="song-info">
                ${item.correct ? `
                    <span class="song-title">${item.event}</span>
                    <span class="song-credits">${item.desc}</span>
                ` : `
                    <div class="comparison">
                        <div class="user-answer">
                            <span class="label">Your Answer:</span>
                            <span class="song-title">${item.event}</span>
                        </div>
                        <div class="correct-answer">
                            <span class="label">Correct Answer:</span>
                            <span class="song-title">${item.correctEvent}</span>
                            <span class="song-credits">${item.correctDesc}</span>
                        </div>
                    </div>
                `}
            </div>
            <div class="result-tag">${item.correct ? 'Correct' : 'Incorrect'}</div>
        `;
        rundownContainer.appendChild(row);
    });

    timelineContainer.appendChild(rundownContainer);
}

function getCredits(songName) {
    const title = songName.toLowerCase();

    // George Harrison songs
    const harrisonSongs = [
        "something", "here comes the sun", "while my guitar gently weeps",
        "taxman", "within you without you", "if i needed someone",
        "old brown shoe", "piggies", "savoy truffle", "long, long, long",
        "i me mine", "for you blue", "think for yourself", "the inner light",
        "i want to tell you", "love you to", "blue jay way", "don't bother me",
        "it's all too much", "only a northern song", "not guilty"
    ];

    // Ringo Starr songs
    const starkeySongs = [
        "octopus's garden", "don't pass me by"
    ];

    // Primarily John Lennon songs (NOT 50/50 cowrites)
    const lennonSongs = [
        "help!", "ticket to ride", "in my life", "norwegian wood",
        "strawberry fields forever", "i am the walrus", "all you need is love",
        "lucy in the sky with diamonds", "a hard day's night", "revolution",
        "come together", "don't let me down", "julia", "dear prudence",
        "happiness is a warm gun", "across the universe", "nowhere man",
        "girl", "i feel fine", "day tripper", "please please me",
        "you're going to lose that girl", "hide your love away",
        "run for your life", "rain", "she said she said",
        "and your bird can sing", "doctor robert", "i'm only sleeping",
        "tomorrow never knows", "good morning good morning",
        "mr. kite", "glass onion", "bungalow bill", "sexy sadie",
        "cry baby cry", "yer blues", "everybody's got something to hide",
        "sun king", "mean mr. mustard", "polythene pam", "dig a pony",
        "i want you", "ballad of john and yoko",
        "i'm a loser", "you've got to hide your love away",
        "i should have known better", "any time at all",
        "i call your name", "not a second time", "you can't do that",
        "no reply", "i'll be back",
        "it won't be long", "tell me why", "every little thing",
        "if i fell", "i don't want to spoil the party",
        "the word", "what goes on", "do you want to know a secret"
    ];

    // Primarily Paul McCartney songs (NOT 50/50 cowrites)
    const mccartneySongs = [
        "yesterday", "hey jude", "let it be", "eleanor rigby",
        "penny lane", "blackbird", "here, there and everywhere",
        "ob-la-di", "get back", "hello, goodbye",
        "the long and winding road", "paperback writer", "michelle",
        "i saw her standing there", "can't buy me love", "all my loving",
        "drive my car", "got to get you into my life",
        "good day sunshine", "for no one", "fixing a hole",
        "getting better", "she's leaving home", "when i'm sixty-four",
        "lovely rita", "back in the u.s.s.r.", "martha my dear",
        "i will", "mother nature's son", "helter skelter",
        "honey pie", "lady madonna", "oh! darling",
        "maxwell's silver hammer", "you never give me your money",
        "golden slumbers", "carry that weight", "the end",
        "her majesty", "your mother should know", "fool on the hill",
        "magical mystery tour", "and i love her",
        "things we said today", "another day",
        "every night", "maybe i'm amazed", "live and let die",
        "we can work it out", "yellow submarine", "good night",
        "rocky raccoon", "why don't we do it in the road"
    ];

    // 50/50 Lennon-McCartney cowrites — these will fall through to default
    // Misery, Little Child, Baby's in Black, Eight Days a Week,
    // With a Little Help From My Friends, A Day in the Life,
    // Baby You're a Rich Man, Birthday, I've Got a Feeling,
    // From Me to You, Thank You Girl, She Loves You,
    // I Want to Hold Your Hand, I'll Get You

    // Cover songs (not written by The Beatles)
    const coverSongs = [
        "twist and shout", "anna (go to him)", "chains", "boys",
        "a taste of honey", "baby it's you",
        "roll over beethoven", "you really got a hold on me",
        "please mr. postman", "please mister postman", "devil in her heart", "money",
        "till there was you", "long tall sally", "slow down",
        "matchbox", "kansas city", "mr. moonlight", "rock and roll music",
        "words of love", "everybody's trying to be my baby",
        "honey don't", "dizzy miss lizzy", "bad boy", "act naturally",
        "words of love", "honey don't"
    ];

    // Songs written by all four Beatles
    const allFourSongs = [
        "flying", "dig it"
    ];

    if (coverSongs.some(s => title.includes(s))) return "Cover";
    if (allFourSongs.some(s => title.includes(s))) return "All4";
    if (harrisonSongs.some(s => title.includes(s))) return "George";
    if (starkeySongs.some(s => title.includes(s))) return "Ringo";
    if (lennonSongs.some(s => title.includes(s))) return "John";
    if (mccartneySongs.some(s => title.includes(s))) return "Paul";

    // Default: true cowrites and uncategorized Lennon-McCartney songs
    return "Lennon-McCartney";
}


function renderAlbums() {
    albumGrid.innerHTML = '';
    albums.forEach(album => {
        const card = document.createElement('div');
        card.className = 'card album-card';
        card.style.borderRadius = "12px";
        card.innerHTML = `
            <img src="${album.img}" alt="${album.name}" style="border-radius: 8px;">
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
        card.style.borderRadius = "12px";
        card.innerHTML = `
            <div class="author-img" style="background-image: url('${author.bgImg}'); background-size: cover; border-radius: 8px;"></div>
            <div class="card-name">${author.name}</div>
        `;
        card.addEventListener('click', () => checkAnswer(author, card));
        authorGrid.appendChild(card);
    });
}

init();
