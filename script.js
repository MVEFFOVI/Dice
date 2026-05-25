let players = [];
let currentPlayerIndex = 0;
let targetScore = 10000;
let endgameTriggered = false;

// Krok 1 -> Krok 2: Vygeneruje políčka pro jména hráčů
function generatePlayerInputs() {
    const count = parseInt(document.getElementById('player-count').value);
    if (count < 1 || count > 10 || isNaN(count)) {
        alert('Prosím zvolte počet hráčů mezi 1 a 10.');
        return;
    }

    const container = document.getElementById('names-container');
    container.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        container.innerHTML += `
            <div class="form-group">
                <label>Hráč ${i}:</label>
                <input type="text" class="player-name-input" value="Hráč ${i}">
            </div>
        `;
    }

    document.getElementById('setup-step').classList.add('hidden');
    document.getElementById('names-step').classList.remove('hidden');
}

// Krok 2 -> Krok 3: Spuštění hry
function startGame() {
    const inputs = document.querySelectorAll('.player-name-input');
    players = Array.from(inputs).map((input, index) => ({
        id: index,
        name: input.value.trim() || `Hráč ${index + 1}`,
        score: 0
    }));

    document.getElementById('names-step').classList.add('hidden');
    document.getElementById('game-step').classList.remove('hidden');

    // Umožní odesílat body stisknutím klávesy Enter
    if (!window.enterKeySetup) {
        document.getElementById('score-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitTurn();
            }
        });
        window.enterKeySetup = true;
    }

    updateUI();
}

// Překreslení aktuálního stavu hry
function updateUI() {
    const listContainer = document.getElementById('players-list');
    listContainer.innerHTML = '';

    players.forEach((player, index) => {
        let statusClass = '';
        if (index === currentPlayerIndex && !isGameOver()) statusClass = 'active';
        
        listContainer.innerHTML += `
            <div class="player-row ${statusClass}">
                <span>${player.name} ${index === currentPlayerIndex && !isGameOver() ? ' 🎲' : ''}</span>
                <span class="score">${player.score} b.</span>
            </div>
        `;
    });

    if (!isGameOver()) {
        document.getElementById('current-player-name').innerText = players[currentPlayerIndex].name;
        const scoreInput = document.getElementById('score-input');
        scoreInput.value = '';
        scoreInput.focus();
    }
}

// Zapsání bodů a předání tahu
function submitTurn() {
    const scoreInput = document.getElementById('score-input');
    const points = parseInt(scoreInput.value);

    if (isNaN(points) || points < 0) {
        alert('Zadejte prosím platné nezáporné číslo.');
        return;
    }

    // Přičtení bodů aktuálnímu hráči
    players[currentPlayerIndex].score += points;

    // Kontrola překročení hranice 10 000 bodů
    if (players[currentPlayerIndex].score >= targetScore && !endgameTriggered) {
        endgameTriggered = true;
        alert(`${players[currentPlayerIndex].name} dosáhl ${players[currentPlayerIndex].score} bodů! Toto je poslední kolo hry. Dohrávají pouze hráči, kteří jsou v pořadí za ním.`);
    }

    moveToNextPlayer();
}

// Logika střídání hráčů a ukončení kola
function moveToNextPlayer() {
    let nextPlayerIndex = currentPlayerIndex + 1;

    // Pokud jsme na konci pole (všichni hráči v tomto kole odehráli svůj tah)
    if (nextPlayerIndex >= players.length) {
        if (endgameTriggered) {
            // Pokud v tomto kole někdo překonal 10 000 bodů, po dohrání kola hra končí
            endGame();
            return;
        } else {
            // Jinak jedeme další kolo od prvního hráče
            currentPlayerIndex = 0;
        }
    } else {
        // Posuneme tah na dalšího hráče v pořadí
        currentPlayerIndex = nextPlayerIndex;
    }

    updateUI();
}

function isGameOver() {
    return !document.getElementById('results-step').classList.contains('hidden');
}

// Konec hry, seřazení výsledků a vyhlášení vítěze
function endGame() {
    document.getElementById('game-step').classList.add('hidden');
    document.getElementById('results-step').classList.remove('hidden');

    // Seřazení hráčů podle bodů (sestupně)
    const leaderboard = [...players].sort((a, b) => b.score - a.score);

    // Vítězem je ten, kdo má na konci kola absolutně nejvíce bodů
    document.getElementById('winner-name').innerText = leaderboard[0].name;

    // Vykreslení výsledkové tabulky
    const tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = '';
    leaderboard.forEach((player, index) => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${index + 1}.</strong></td>
                <td>${player.name}</td>
                <td>${player.score} b.</td>
            </tr>
        `;
    });
}

// Restart hry, který zachová jména a pořadí hráčů
function restartWithSamePlayers() {
    players.forEach(player => {
        player.score = 0;
    });

    currentPlayerIndex = 0;
    endgameTriggered = false;

    document.getElementById('results-step').classList.add('hidden');
    document.getElementById('game-step').classList.remove('hidden');

    updateUI();
}