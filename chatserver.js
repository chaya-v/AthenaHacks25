const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // Serve static files from the "public" folder

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("chat message", (data) => {
        io.emit("chat message", data); // Broadcast message to all users
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on file:///Users/briellebrantner/Documents/GitHub/AthenaHacks25/public/public%20chat%20page/chat.html");
});
