
const socket = io("http://localhost:3000");


// Function to send messages
function sendMessage() {
    const input = document.getElementById("input");
    const message = input.value.trim();

    if (message) {
        socket.emit("chat message", { text: message, id: socket.id }); // Send message with sender's ID
        displayMessage(message, "sent"); // Display as "sent" message
        input.value = "";
    }
}

// Function to display messages
function displayMessage(message, type) {
    const messages = document.getElementById("messages");
    const messageElement = document.createElement("div");

    messageElement.textContent = message;
    messageElement.classList.add("message", type); // Add "sent" or "received" class

    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight; // Auto-scroll to latest message
}


// Listen for incoming messages
socket.on("chat message", (data) => {
    if (data.id !== socket.id) {
        displayMessage(data.text, "received"); // If not from this user, mark as "received"
    }
});