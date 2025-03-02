const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI("AIzaSyDxorrWajQDOE99OAPS4PMRyjPvvwzhn3g"); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to extract and format user data for the prompt
async function getUserData() {
    // Read the user data from the JSON file
    const data = JSON.parse(fs.readFileSync('userData.json', 'utf8'));

    // Extract and map user data to include only relevant fields for matching
    return data.map(user => ({
        fullName: user.fullName,
        email: user.email,
        travelLocation: user.travelLocation,
        travelStart: new Date(user.travelStart).toLocaleDateString(),
        travelEnd: new Date(user.travelEnd).toLocaleDateString(),
        interests: user.interests.join(", "),
        hobbies: user.hobbies.join(", "),
        travelReason: user.travelReason,
        budget: user.budget
    }));
}

// Function to generate content using Gemini AI
async function generateContent() {
    try {
        const userData = await getUserData();

        // Prepare the prompt for generating content
        const prompt = `
We have a dataset of travelers with the following details:  
- **User Details**: Each user has a name, email, travel destination, travel start date, travel end date, interests, hobbies, budget, and travel reason.  
- **Objective**: Your task is to generate ranked travel match recommendations based on shared interests, travel locations, and overlapping dates.  

### **Matching Criteria**:  
1. **High Priority**: Match users with the most overlapping interests, common travel reasons, and similar locations.  
2. **Medium Priority**: Users traveling to nearby locations with some shared interests.  
3. **Low Priority**: Users with minimal shared interests but overlapping travel dates.  

### **Output Format** (JSON Only):  
Return a structured JSON response with users grouped by match rankings:  

\`\`\`json
{
    "ranked_matches": [
        {
            "rank": 1,
            "group": [
                {
                    "name": "User 1",
                    "travel_details": { "location": "...", "start_date": "...", "end_date": "..." },
                    "travel_reason": "..."
                },
                {
                    "name": "User 2",
                    "travel_details": { "location": "...", "start_date": "...", "end_date": "..." },
                    "travel_reason": "..."
                },
                ...
            ],
            "commonTravelLocation": "<Shared Location>",
            "overlappingDates": { "start": "...", "end": "..." },
            "shared_interests": ["interest1", "interest2", "interest3"],
            "match_summary": "Why this group is highly compatible."
        },
        {
            "rank": 2,
            "group": [ ... ],  // Less compatible matches
            "shared_interests": [...],
            "match_summary": "Why this group is moderately compatible."
        },
        {
            "rank": 3,
            "group": [ ... ],  // Least compatible but still matched
            "shared_interests": [...],
            "match_summary": "Why this group is less compatible but still a match."
        }
    ]
}
\`\`\`

### **Ranking Criteria**:  
- Rank **1** → Highest match (same location, overlapping dates, 3+ shared interests)  
- Rank **2** → Moderate match (nearby location, partially overlapping dates, 2+ shared interests)  
- Rank **3** → Lower match (only overlapping dates, minimal shared interests)  

Here is the user data for processing:

        ${userData.map(user => `
        Name: ${user.fullName}
        Email: ${user.email}
        Travel Location: ${user.travelLocation}
        Travel Start: ${user.travelStart}
        Travel End: ${user.travelEnd}
        Interests: ${user.interests}
        Hobbies: ${user.hobbies}
        Travel Reason: ${user.travelReason}
        Budget: ${user.budget}
        `).join("\n")}

Please return **ONLY** the JSON output and nothing else.
        `;

        const result = await model.generateContent(prompt);

        let generatedText = result.response.text().trim(); // Remove leading/trailing spaces

        // If the response contains triple backticks, clean them up
        if (generatedText.startsWith("```json")) {
            generatedText = generatedText.replace(/```json/, '').replace(/```/, '').trim();
        }

        // Save the JSON response to a file
        fs.writeFileSync('matchedUsers.json', generatedText);
        console.log("Generated content saved to matchedUsers.json");

    } catch (error) {
        console.error('Error generating content:', error);
    }
}

// Call the generateContent function to generate content
generateContent().catch(console.error);
