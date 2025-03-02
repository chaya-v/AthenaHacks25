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

app.post("/register", async (req, res) => {
    try {
        // Save the new user (User A)
        const newUser = new User(req.body);
        await newUser.save();

        // Query for all other users (exclude the new user)
        const otherUsers = await User.find({ _id: { $ne: newUser._id } });

        // Generate matches based on the new user's profile and the other users' data
        const matches = await generateMatches(newUser, otherUsers);

        // Overwrite the file with the new matches
        fs.writeFileSync('matched_With_Users.json', matches, { flag: 'w' });
        
        // Return the matches in the response
        res.status(201).json({ message: "User Registered Successfully", matches: JSON.parse(matches) });
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

// New endpoint: Get the most recently registered user details
app.get("/user/latest", async (req, res) => {
    try {
        const latestUser = await User.findOne().sort({ _id: -1 });
        if (!latestUser) {
            return res.status(404).json({ message: "No user found" });
        }
        res.status(200).json(latestUser);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving latest user", error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
