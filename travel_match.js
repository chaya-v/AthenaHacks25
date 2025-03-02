const fs = require('fs');
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI("AIzaSyAFHTQwJDAwIqfRhL345xKAoSilfD7b-VY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const uri = "mongodb+srv://Team7:Team7@cluster0.gwmug.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// async function getUserData() {
//    try {
//        await client.connect();
//        const database = client.db('test'); // Replace with your database name
//        const collection = database.collection('users'); // Replace with your collection name
//        const userData = await collection.find({}).toArray();
      
//        // Write user data to userData.json
//        fs.writeFileSync('userData.json', JSON.stringify(userData, null, 2));
      
//        console.log('✅ User data fetched and saved to userData.json');
//        console.log('User Data:', userData);
      
//        return userData;
//    } catch (error) {
//        console.error('Error fetching user data:', error);
//        throw error;
//    } finally {
//        await client.close();
//    }
// }

function matchUsers(data) {
    const matches = [];

    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            const user1 = data[i];
            const user2 = data[j];

            // ✅ Match if travel location & travel time are the same
            if (user1.travelLocation === user2.travelLocation) {
                
                // ✅ Find shared interests & hobbies
                const sharedInterests = user1.interests.filter(interest => user2.interests.includes(interest));
                const sharedHobbies = user1.hobbies.filter(hobby => user2.hobbies.includes(hobby));
                console.log (`True`);

                // ✅ If there's a match, push the users into the array
                if (sharedInterests.length > 0 || sharedHobbies.length > 0) {
                    matches.push({
                        user1: user1.fullName,
                        user2: user2.fullName,
                        travelLocation: user1.travelLocation,
                        travelTime: user1.travelTime,
                        sharedInterests,
                        sharedHobbies,
                        budget1: user1.budget,  // Keeping budget as a string
                        budget2: user2.budget   // Keeping budget as a string
                    });
                }
            }
        }
    }

    // ✅ Save matched users to a file
    fs.writeFileSync("matched_users.json", JSON.stringify(matches, null, 2));
    console.log("✅ Matched users saved to matched_users.json");

    return matches;
}

async function generateContent() {
   try {
       const userData = await getUserData();
       const matches = matchUsers(userData);
      
       // Write matched users to matched_users.json
       fs.writeFileSync('matched_users.json', JSON.stringify(matches, null, 2));
      
       const prompt = `Here are the matched users based on their destinations and dates: ${JSON.stringify(matches)}`;
       const result = await model.generateContent(prompt);
       console.log(result.response.text());
   } catch (error) {
       console.error('Error generating content:', error);
   }
}

async function logUserData() {
   try {
       await client.connect();
       const database = client.db('test'); // Replace with your database name
       const collection = database.collection('users'); // Replace with your collection name
       const userData = await collection.find({}).toArray();
       console.log('Current MongoDB Data:', userData);
   } catch (error) {
       console.error('Error logging user data:', error);
   } finally {
       await client.close();
   }
}


// Call the logUserData function to log the current MongoDB data
logUserData().catch(console.error);


// Call the generateContent function to generate content
generateContent().catch(console.error);


// Test the getUserData function
getUserData().catch(console.error);
