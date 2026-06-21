let ws = null;
let username = "";

document.getElementById("joinBtn").addEventListener("click", function () {

    username = document.getElementById("username").value.trim();

    if (!username) {
        alert("Enter name");
        return;
    }

    document.getElementById("joinScreen").classList.add("d-none");
    document.getElementById("chatScreen").classList.remove("d-none");

    document.getElementById("welcomeText").innerText = `Welcome ${username}`;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    ws = new WebSocket(`${protocol}//${window.location.host}/ws/${username}`);

    ws.onmessage = function (event) {
        try {
            const data = JSON.parse(event.data);
            addMessage(data.user, data.message);
        } catch (e) {
            console.error("Error parsing message JSON:", e, event.data);
        }
    };
});


function sendMessage(event) {
    event.preventDefault();

    const input = document.getElementById("messageText");
    const message = input.value.trim();

    if (!message) return;

    ws.send(message);

    input.value = "";
}


function addMessage(user, message) {
    const messages = document.getElementById("messages");
    const div = document.createElement("div");

    if (user === "System") {
        div.className = "message-row system";
        div.innerHTML = `
            <div class="system-bubble">
                ${message}
            </div>
        `;
    } else {
        const isMe = user === username;
        div.className = isMe ? "message-row me" : "message-row other";
        div.innerHTML = `
            <div class="message-content">
                <div class="message-meta">${isMe ? "You" : user}</div>
                <div class="message-bubble">${message}</div>
            </div>
        `;
    }

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}