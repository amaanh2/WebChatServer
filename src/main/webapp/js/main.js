//let ws;
let  ws = new WebSocket("ws://localhost:8080/WebSocketsHelloWorld-1.0-SNAPSHOT/ws");

// Add event listeners for navigation
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-chat').addEventListener('click', displayChat);
    document.getElementById('nav-about').addEventListener('click', displayAbout);
    document.getElementById('chat-message-input').addEventListener('keyup', function (event) {
        if (event.key === "Enter") {
            sendMessageFromInput();
        }
    });
    document.getElementById('refresh-rooms').addEventListener('click', refreshRooms);
    displayChat(); // Load chat by default
});

function displayChat() {
    const rightPanel = document.getElementById('right-panel');
    rightPanel.innerHTML = '<div id="chat-messages"></div><input type="text" id="chat-message-input" placeholder="Type a message...">';
    // Reattach the event listener to the newly added input field
    document.getElementById('chat-message-input').addEventListener('keyup', function (event) {
        if (event.key === "Enter") {
            sendMessage(event.target.value);
            event.target.value = "";
        }
    });
}

function displayAbout() {
    const rightPanel = document.getElementById('right-panel');
    rightPanel.innerHTML = '<p>This project was made by Amaan Ahmed, Luke Pereira, Ryan Fan, Zhaojun Li collaboratively.</p>';
}

function createRoom() {
    // Fetches a new room code from the server and connects to it
    fetch('http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet', { method: 'GET' })
        .then(response => response.text())
        .then(roomCode => {
            document.getElementById("room-code-input").value = roomCode;
            establishWebSocketConnection(roomCode);
        })
        .catch(error => console.error('Error creating new room:', error));
}

function addRoom() {
    // Connects to an existing room using the provided room ID
    let roomCode = document.getElementById("room-code-input").value.trim();
    if (!roomCode) {
        alert('Please enter a room code to add.');
        return;
    }
    establishWebSocketConnection(roomCode);
}

function establishWebSocketConnection(roomCode) {
    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/"+ roomCode);

    ws.onmessage = event => {
        let data = JSON.parse(event.data);
        displayMessage(data);
    };
    ws.onopen = () => console.log("WebSocket connection established.");
    ws.onerror = () => alert('WebSocket error.');
    ws.onclose = () => alert('WebSocket connection closed.');
}

function refreshRooms() {
    window.location.reload(); // Refreshes the page
}

function sendMessageFromInput() {
    // Sends a message typed into the input field
    let message = document.getElementById('chat-message-input').value.trim();
    if (message) {
        sendMessage(message);
        document.getElementById('chat-message-input').value = ''; // Clear input field
    }
}

function sendMessage(message) {
    // Sends a message over the WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
        let request = {"type": "chat", "msg": message};
        ws.send(JSON.stringify(request));
    } else {
        alert('WebSocket is not connected.');
    }
}

function displayMessage(data) {
    let chatMessages = document.getElementById("chat-messages");
    let msgDiv = document.createElement('div');
    msgDiv.textContent = data.message;
    chatMessages.appendChild(msgDiv);
}

// Falling star //
document.addEventListener('DOMContentLoaded', () => {
    setInterval(() => createStars(5), 500); // Generate five star every half second
});

function createStars(numberOfStars) {
    const topPanelHeight = document.getElementById('top-panel').offsetHeight;
    const rightPanel = document.getElementById('right-panel');
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * window.innerWidth}px`; // Adjust for full window width
        const animationDuration = 5 + Math.random() * 5; // Between 5 and 10 seconds
        star.style.animationDuration = `${animationDuration}s`;
        star.style.animationDelay = `0s`; // Start when running

        // Initially position stars above the top panel
        star.style.top = `${-10}px`;

        if (Math.random() > 0.5) { // Randomly decide where to append for variety in paths
            document.getElementById('top-panel').appendChild(star);
        } else {
            rightPanel.appendChild(star);
        }

        setTimeout(() => {
            star.remove();
        }, animationDuration * 1000);
    }
}



