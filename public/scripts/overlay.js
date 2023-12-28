// Open websock ASAP
let socket;
setSocket();

// Save data
let data;
// Element references
let completedIcons;
let wins;
let name;
let losses;
let winstreak;
let currImg;

// OBS keeps closing the websockets after one message. Stop it OBS
function setSocket() {
    socket = new WebSocket("ws://localhost:3000/ws", "tater");

    // Listen for socket messages. Update the page on retrieval
    socket.addEventListener('message', (event) => {
        data = JSON.parse(event.data);
        updateCompletedTaters();
        updateCurrInfo();
    });

    // If the socket errors, log it
    socket.onerror = (err) => {
        console.log(err);
    }

    // Hack to get OBS to behave
    socket.addEventListener('close', (event) => {
        setSocket();
    });
}

// Load our element references
window.onload = () => {
    completedIcons = document.querySelector("#completed-icons");
    currImg = document.querySelector("#curr-img");
    wins = document.querySelector("#wins");
    name = document.querySelector("#name");
    losses = document.querySelector("#losses");
    winstreak = document.querySelector("#winstreak");
}

// Update the running list of taters with a win
function updateCompletedTaters() {
    clearChildren(completedIcons);
    for (tater of data.completed) {
        let icon = buildTaterIcon(tater);
        completedIcons.appendChild(icon);
    }
}

// Update the info of the current selected tater
function updateCurrInfo() {
    let taterInfo = data.stats[data.current];
    winstreak.innerText = data.completed.length;

    // If the tater doesn't exist, use the default values
    if (!taterInfo) {
        wins.innerText = "??";
        losses.innerText = "??";
        name.innerText = "??";
        currImg.classList.add("hide");
        return;
    }

    // Populate the elements with tater specific data
    currImg.classList.remove("hide");
    currImg.setAttribute("src", taterInfo.img);
    wins.innerText = taterInfo.wins;
    losses.innerText = taterInfo.losses;
    name.innerText = data.current;
}

// Utility function to get an icon element for a tater
function buildTaterIcon(name) {
    let taterInfo = data.stats[name];

    let icon = document.createElement("img");
    icon.setAttribute("src", taterInfo.img);
    icon.classList.add("icon");

    return icon;
}

// Utility function to clear out a node of children
function clearChildren(node) {
    while (node.firstChild) {
        node.firstChild.remove();
    }
}
