const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI("AIzaSyDxorrWajQDOE99OAPS4PMRyjPvvwzhn3g"); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Exports an async function that accepts an array of users and returns match recommendations (JSON string)
async function generateMatches(users) {
    // Transform users data for prompt
    const formattedUsers = users.map(user => ({
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

    // Prepare the prompt for generating match recommendations
    const prompt = `
We have a dataset of travelers with the following details:  
- **User Details**: Each user has a name, email, travel destination, travel start date, travel end date, interests, hobbies, budget, and travel reason.  
- **Objective**: Your task is to generate a list of travel matches for my profile based on shared interests, similar travel locations, and overlapping travel dates. Ensure that there is no redundancy in the list and that each matching user appears only once.

Here is the user data for processing:

${formattedUsers.map(user => `
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

### **Output Format** (JSON Only):  
Return a JSON output with a key "matches" containing an array of matching users. Each matching user should be formatted as follows:  

\`\`\`json
{
  "matches": [
    {
      "name": "User Name",
      "travel_details": { "location": "...", "start_date": "...", "end_date": "..." },
      "travel_reason": "...",
      "shared_interests": ["interest1", "interest2", "..."],
      "match_summary": "A brief summary on why this user is a match."
    },
    ...
  ]
}
\`\`\`

Please return ONLY the JSON output and nothing else.
`;

    try {
        const result = await model.generateContent(prompt);
        let generatedText = result.response.text().trim();

        // Remove triple backticks if present
        if (generatedText.startsWith("```json")) {
            generatedText = generatedText.replace(/```json/, '').replace(/```/, '').trim();
        }
        return generatedText;
    } catch (error) {
        console.error('Error generating matches:', error);
        throw error;
    }
}

module.exports = { generateMatches };
