const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

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
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    },
    travelLocation: {
        type: String,
        required: true
    },
    travelStart: {
        type: Date,
        required: true
    },
    travelEnd: {
        type: Date,
        required: true
    },
    budget: {
        type: String,
        required: true
    },
    interests: {
        type: [String],
        required: true
    },
    hobbies: {
        type: [String],
        required: true
    },
    travelReason: {
        type: String,
        required: true
    },
    dreamDestination: {
        type: String,
        required: true
    },
    adventure: {
        type: String,
        required: true
    },
    bucketList: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);
const fs = require('fs');

app.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send("User Registered Successfully");
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        fs.writeFileSync('userData.json', JSON.stringify(users, null, 2));
        res.status(200).send('User data has been written to userData.json');
    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
