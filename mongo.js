const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require('fs');
const { generateMatches } = require('./travel_match');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://Team7:Team7@cluster0.gwmug.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    birthday: { type: Date, required: true },
    travelLocation: { type: String, required: true },
    travelStart: { type: Date, required: true },
    travelEnd: { type: Date, required: true },
    budget: { type: String },
    interests: { type: [String], required: true },
    hobbies: { type: [String], required: true },
    travelReason: { type: String, required: true },
    dreamDestination: { type: String },
    adventure: { type: String },
    bucketList: { type: String }
});

const User = mongoose.model("User", userSchema);

// POST /register – saves the user and updates matches immediately
app.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        // Query all users and update matches
        const users = await User.find();
        const matches = await generateMatches(users);
        // Overwrite the file by using the "w" flag (default)
        fs.writeFileSync('matched_With_Users.json', matches, { flag: 'w' });
        res.status(201).send("User Registered Successfully and matches updated");
    } catch (error) {
        res.status(400).send(error);
    }
});

// GET /matches – returns the latest matches JSON
app.get("/matches", (req, res) => {
    try {
        const data = fs.readFileSync('matched_With_Users.json', 'utf8');
        const matches = JSON.parse(data);
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).send("Error reading matches");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
