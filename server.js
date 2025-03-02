const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public"))); // Serve static files from "public" folder

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "website", "chat.html")); // Serve your renamed file
});

app.use(express.static(path.join(__dirname, "public", "website"))); // Serve static files from "public/website" folder


io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    socket.on("chat message", (message) => {
        io.emit("chat message", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
