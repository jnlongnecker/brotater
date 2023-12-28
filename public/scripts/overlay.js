const url = "/api/test";
const channel = new BroadcastChannel('brotato');

let data;
let completedIcons;
let wins;
let name;
let losses;
let winstreak;

let currImg;

window.onload = () => {
    completedIcons = document.querySelector("#completed-icons");
    currImg = document.querySelector("#curr-img");
    wins = document.querySelector("#wins");
    name = document.querySelector("#name");
    losses = document.querySelector("#losses");
    winstreak = document.querySelector("#winstreak");
}

channel.addEventListener('message', (event) => {
    data = JSON.parse(event.data);
    updateCompletedTaters();
    updateCurrInfo();
});

function updateCompletedTaters() {
    clearChildren(completedIcons);
    for (tater of data.completed) {
        let icon = buildTaterIcon(tater);
        completedIcons.appendChild(icon);
    }
}

function updateCurrInfo() {
    let taterInfo = data.stats[data.current];
    winstreak.innerText = data.completed.length;
    if (!taterInfo) {
        wins.innerText = "??";
        losses.innerText = "??";
        name.innerText = "??";
        currImg.classList.add("hide");
        return;
    }

    currImg.classList.remove("hide");
    currImg.setAttribute("src", taterInfo.img);
    wins.innerText = taterInfo.wins;
    losses.innerText = taterInfo.losses;
    name.innerText = data.current;
}

function buildTaterIcon(name) {
    let taterInfo = data.stats[name];

    let icon = document.createElement("img");
    icon.setAttribute("src", taterInfo.img);
    icon.classList.add("icon");

    return icon;
}

function clearChildren(node) {
    while (node.firstChild) {
        node.firstChild.remove();
    }
}
