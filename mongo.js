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
    fullName: String,
    email: String,
    password: String,
    address: String,
    birthday: String,
    travelLocation: String,
    travelTime: String,
    budget: String,
    interests: [String],
    hobbies: [String],
    travelReason: String,
    dreamDestination: String,
    adventure: String,
    bucketList: String
});

const User = mongoose.model("User", userSchema);

app.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send("User Registered Successfully");
    } catch (error) {
        res.status(400).send(error);
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
