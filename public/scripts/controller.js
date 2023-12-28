// Url for save data POST requests
const url = "/api/save-data";

// Element references
let unpickedGrid;
let pickedGrid;
let currTater;
let winBtn;
let loseBtn;
let randomBtn;

// Temp variable to hold the fetch promise and get that request going ASAP
let saveData = fetch("/api/save-data");

// Save data
let data;

// Load up them element references
window.onload = () => {
    unpickedGrid = document.querySelector("#unpicked-grid");
    pickedGrid = document.querySelector("#picked-grid");
    currTater = document.querySelector("#curr-tater");
    winBtn = document.querySelector("#win");
    loseBtn = document.querySelector("#lose");
    randomBtn = document.querySelector("#random");

    // Event listeners
    randomBtn.addEventListener('click', randomizeTater);
    winBtn.addEventListener('click', handleWin);
    loseBtn.addEventListener('click', handleLose);

    // Resolve the promise and get the data to the webpage
    saveData.then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(payload => {
        displayNewSaveData(payload);
    });
}

// Updates the save data and the page
function displayNewSaveData(result) {
    data = result;

    // Remaining list isn't stored, so calculate it
    data["remaining"] = data.master_list.filter(item => !data.completed.includes(item));
    populatePicked();
    populateUnpicked();
    showCurrTater();
    showButtons();
    sendData();
}

// Populate the grid of unpicked taters
function populateUnpicked() {
    clearChildren(unpickedGrid);
    for (tatoName of data.remaining) {
        let token = createTatoToken(tatoName);
        unpickedGrid.appendChild(token);
    }
}

// Populate the grid of picked taters
function populatePicked() {
    clearChildren(pickedGrid);
    for (tatoName of data.completed) {
        let token = createTatoToken(tatoName);
        pickedGrid.appendChild(token);
    }
}

// Populate the center tater token with the current tater
function showCurrTater() {
    clearChildren(currTater);
    let token = createTatoToken(data.current, true);
    token.classList.add("current");
    currTater.appendChild(token);
}

// Utility function to handle which buttons should be displayed
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

// Utility function to hide all the buttons
function hideButtons() {
    randomBtn.classList.add("hide");
    winBtn.classList.add("hide");
    loseBtn.classList.add("hide");
}

// Utility function to remove all of a node's children
function clearChildren(node) {
    while (node.firstChild) {
        node.firstChild.remove();
    }
}

// Utility function to create a token component from tater data
function createTatoToken(tatoName, withName = false) {
    let tatoInfo = data.stats[tatoName];

    // Token has 3 parts: container, img and p
    let tokenContainer = document.createElement("div");
    tokenContainer.classList.add("token");

    // Populate the img and p if the tater name is valid
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
    // If the name is invalid, display that no tater is selected
    else {
        let tokenText = document.createElement("p");
        tokenText.innerText = "No 'tater selected";
        tokenText.classList.add("no-tater");

        tokenContainer.appendChild(tokenText);
    }
    return tokenContainer;
}

// Event handler. Picks a random tater and starts the roulette animation
function randomizeTater() {
    let choice = Math.random() * (data.remaining.length - 1);
    choice = Math.round(choice);
    data.current = data.remaining[choice];

    hideButtons();
    sendData();
    playRouletteAnim(choice);
}

// Event handler. Updates data on a win
function handleWin() {
    // Add a win to the tater win count
    data.stats[data.current].wins++;

    // Add the tater to the completed list
    data.completed.push(data.current);

    // Remove the tater from the remaining list
    data.remaining = data.master_list.filter(item => !data.completed.includes(item));
    data.current = '';

    // Update HTML
    populatePicked();
    populateUnpicked();
    showCurrTater();
    showButtons();
    sendData();
}

// Event handler. Updates data on a loss
function handleLose() {
    // Add a loss to the tater loss count
    data.stats[data.current].losses++;

    // Reset the completed list
    data.completed = [];
    data.current = '';

    // Reset the remaining list
    data.remaining = [...data.master_list];

    // Update HTML
    populatePicked();
    populateUnpicked();
    showCurrTater();
    showButtons();
    sendData();
}

const MAX_TURNS = 40;
const SLOWDOWN = 20;

// Plays the roulette animation on a randomization. This is deterministic; meaning that
// the roulette will always land on the tater picked
function playRouletteAnim(pick, turns = 0) {
    // Calculate the tater that should be visibile this turn
    let curr = Math.abs(pick - MAX_TURNS + turns) % data.remaining.length;
    data.current = data.remaining[curr];

    // Show that tater
    showCurrTater();

    // If we're at the end, we've landed on the right tater and can reveal the buttons
    if (turns == MAX_TURNS) {
        showButtons();
        return;
    }

    // Add a turn and calculate how many seconds we should wait for the next turn
    // This gets larger once we're past the slowdown threshold
    turns++;
    let remaining = MAX_TURNS - turns;
    let timer = remaining <= SLOWDOWN ? Math.abs(remaining - SLOWDOWN + 2) * 12.5 : 25;
    setTimeout(() => playRouletteAnim(pick, turns), timer);
}

// Utility function to post the save data to the server
function sendData() {
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: JSON.stringify(data)
    });
}