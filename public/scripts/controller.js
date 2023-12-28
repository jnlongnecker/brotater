const url = "/api/save-data";
const channel = new BroadcastChannel('brotato');

let unpickedGrid;
let pickedGrid;
let currTater;
let winBtn;
let loseBtn;
let randomBtn;

let saveData = fetch("/api/save-data");
let data;

window.onload = () => {
    unpickedGrid = document.querySelector("#unpicked-grid");
    pickedGrid = document.querySelector("#picked-grid");
    currTater = document.querySelector("#curr-tater");
    winBtn = document.querySelector("#win");
    loseBtn = document.querySelector("#lose");
    randomBtn = document.querySelector("#random");

    randomBtn.addEventListener('click', randomizeTater);
    winBtn.addEventListener('click', handleWin);
    loseBtn.addEventListener('click', handleLose);
    saveData.then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(payload => {
        displayNewSaveData(payload);
    });
}

function displayNewSaveData(result) {
    data = result;
    data["remaining"] = data.master_list.filter(item => !data.completed.includes(item));
    populatePicked();
    populateUnpicked();
    showCurrTater();
    showButtons();
    sendData();
}

function populateUnpicked() {
    clearChildren(unpickedGrid);
    for (tatoName of data.remaining) {
        let token = createTatoToken(tatoName);
        unpickedGrid.appendChild(token);
    }
}

function populatePicked() {
    clearChildren(pickedGrid);
    for (tatoName of data.completed) {
        let token = createTatoToken(tatoName);
        pickedGrid.appendChild(token);
    }
}

function showCurrTater() {
    clearChildren(currTater);
    let token = createTatoToken(data.current, true);
    token.classList.add("current");
    currTater.appendChild(token);
}

function showButtons() {
    if (!data.current) {
        randomBtn.classList.remove("hide");
        winBtn.classList.add("hide");
        loseBtn.classList.add("hide");
    } else {
        randomBtn.classList.add("hide");
        winBtn.classList.remove("hide");
        loseBtn.classList.remove("hide");
    }
}

function hideButtons() {
    randomBtn.classList.add("hide");
    winBtn.classList.add("hide");
    loseBtn.classList.add("hide");
}

function clearChildren(node) {
    while (node.firstChild) {
        node.firstChild.remove();
    }
}

function createTatoToken(tatoName, withName = false) {
    let tatoInfo = data.stats[tatoName];

    let tokenContainer = document.createElement("div");
    tokenContainer.classList.add("token");

    if (tatoInfo) {
        let tokenImage = document.createElement("img");
        tokenImage.setAttribute("src", tatoInfo.img);

        let tokenName = document.createElement("p");
        tokenName.innerText = tatoName;
        tokenName.classList.add("tater-text");
        if (!withName) {
            tokenName.classList.add("hide");
        }

        tokenContainer.appendChild(tokenImage);
        tokenContainer.appendChild(tokenName);
    }
    else {
        let tokenText = document.createElement("p");
        tokenText.innerText = "No 'tater selected";
        tokenText.classList.add("no-tater");

        tokenContainer.appendChild(tokenText);
    }
    return tokenContainer;
}

function randomizeTater() {
    let choice = Math.random() * (data.remaining.length - 1);
    choice = Math.round(choice);
    data.current = data.remaining[choice];

    hideButtons();
    sendData();
    playRouletteAnim(choice);
}

function handleWin() {
    data.stats[data.current].wins++;
    data.completed.push(data.current);
    data.current = '';
    data.remaining = data.master_list.filter(item => !data.completed.includes(item));

    populatePicked();
    populateUnpicked();
    showCurrTater();
    showButtons();
    sendData();
}

function handleLose() {
    data.stats[data.current].losses++;
    data.completed = [];
    data.current = '';
    data.remaining = [...data.master_list];

    populatePicked();
    populateUnpicked();
    showCurrTater();
    showButtons();
    sendData();
}

const MAX_TURNS = 40;
const SLOWDOWN = 20;

function playRouletteAnim(pick, turns = 0) {
    let curr = Math.abs(pick - MAX_TURNS + turns) % data.remaining.length;
    data.current = data.remaining[curr];

    showCurrTater();
    if (turns == MAX_TURNS) {
        showButtons();
        return;
    }
    turns++;
    let remaining = MAX_TURNS - turns;
    let timer = remaining <= SLOWDOWN ? Math.abs(remaining - SLOWDOWN + 2) * 12.5 : 25;
    setTimeout(() => playRouletteAnim(pick, turns), timer);
}

function sendData() {
    channel.postMessage(JSON.stringify(data));

    fetch(url, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}