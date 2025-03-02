const fs = require('fs');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');  // Importing node-fetch

const apiKey = 'AIzaSyCJafWiBv88DX2iMj6pgjDc_NOZwSu6wL4';
const apiUrl = 'https://generativeai.googleapis.com/v1/models/gemini-1.5-flash:generateContent'; // Replace with the correct endpoint

// const uri = "mongodb+srv://Team7:Team7@cluster0.gwmug.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Function to extract and match users based on travel location and travel dates
async function getUserData() {
    // Read the user data from the JSON file
    const data = JSON.parse(fs.readFileSync('userData.json', 'utf8'));

    // Extract and map user data to include only relevant fields for matching
    return data.map(user => ({
        fullName: user.fullName,
        email: user.email,
        travelLocation: user.travelLocation,
        travelStart: new Date(user.travelStart), 
        travelEnd: new Date(user.travelEnd),
        interests: user.interests,
        hobbies: user.hobbies,
        budget: user.budget
    }));
}

function checkTravelDateOverlap(start1, end1, start2, end2) {
    // Check if two date ranges overlap
    return (start1 <= end2 && end1 >= start2);
}

// Function to match users based on location, travel dates, interests, and hobbies
function matchUsers(data) {
    const matches = [];

    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            const user1 = data[i];
            const user2 = data[j];

            // Match based on travel location first
            if (user1.travelLocation === user2.travelLocation) {

                // Check if the travel dates overlap
                if (checkTravelDateOverlap(user1.travelStart, user1.travelEnd, user2.travelStart, user2.travelEnd)) {
                    
                    // Find shared interests and hobbies
                    const sharedInterests = user1.interests.filter(interest => user2.interests.includes(interest));
                    const sharedHobbies = user1.hobbies.filter(hobby => user2.hobbies.includes(hobby));
                    
                    if (sharedInterests.length > 0 || sharedHobbies.length > 0) {
                        // If match found, add to the list
                        matches.push({
                            user1: user1.fullName,
                            user2: user2.fullName,
                            travelLocation: user1.travelLocation,
                            travelStart: user1.travelStart.toISOString(),
                            travelEnd: user1.travelEnd.toISOString(),
                            sharedInterests,
                            sharedHobbies,
                            budget1: user1.budget,  // Keeping budget as a string
                            budget2: user2.budget   // Keeping budget as a string
                        });
                    }
                }
            }
        }
    }

    // Save matched users to a file
    fs.writeFileSync('matched_users.json', JSON.stringify(matches, null, 2));
    console.log('✅ Matched users saved to matched_users.json');

    return matches;
}

// Function to generate content using the Generative AI API (via HTTP request)
async function generateContent() {
    try {
        const userData = await getUserData();

        // Match users based on location, travel dates, and profile information
        const matches = matchUsers(userData);

        // Write matched users to matched_users.json
        fs.writeFileSync('matched_users.json', JSON.stringify(matches, null, 2));

        // Prepare the prompt for generating content
        const prompt = `Here are the matched users based on their destinations and dates: ${JSON.stringify(matches)}`;

        // Make the API call to generate content using fetch
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            throw new Error(`Request failed with status: ${response.status}`);
        }

        const data = await response.json();

        // Log the generated content
        console.log('Generated Content:', data);
    } catch (error) {
        console.error('Error generating content:', error);
    }
}

// Call the generateContent function to generate content
generateContent().catch(console.error);