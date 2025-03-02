
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
});

socket.on("chat message", (message) => {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    document.getElementById("messages").appendChild(messageElement);
});

function sendMessage() {
    const message = document.getElementById("input").value.trim();
    if (message !== "") {
        socket.emit("chat message", message);
        document.getElementById("input").value = "";
    }
}

