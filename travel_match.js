const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI("AIzaSyDxorrWajQDOE99OAPS4PMRyjPvvwzhn3g"); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Exports an async function that accepts the reference user and an array of other users, then returns match recommendations (JSON string)
async function generateMatches(referenceUser, otherUsers) {
    // Format the reference user's data
    const formattedReference = {
        name: referenceUser.fullName,
        travelLocation: referenceUser.travelLocation,
        travelStart: new Date(referenceUser.travelStart).toLocaleDateString(),
        travelEnd: new Date(referenceUser.travelEnd).toLocaleDateString(),
        interests: referenceUser.interests.join(", ")
    };

    // Format the other users' data
    const formattedOthers = otherUsers.map(user => ({
        name: user.fullName,
        email: user.email,
        travelLocation: user.travelLocation,
        travelStart: new Date(user.travelStart).toLocaleDateString(),
        travelEnd: new Date(user.travelEnd).toLocaleDateString(),
        interests: user.interests.join(", "),
        hobbies: user.hobbies.join(", "),
        travelReason: user.travelReason,
        budget: user.budget
    }));

    // Build the prompt that instructs the model to:
    // 1. Filter other users to include only those whose travelLocation exactly matches the reference user's.
    // 2. From this filtered set, further select users with overlapping travel dates and shared interests.
    // 3. Return a JSON with key "matches" containing an array of matching users.
    const prompt = `
Given the following reference user profile:
Name: ${formattedReference.name}
Travel Location: ${formattedReference.travelLocation}
Travel Start: ${formattedReference.travelStart}
Travel End: ${formattedReference.travelEnd}
Interests: ${formattedReference.interests}

And given the following dataset of other travelers:
${formattedOthers.map(user => 
`Name: ${user.name}
Email: ${user.email}
Travel Location: ${user.travelLocation}
Travel Start: ${user.travelStart}
Travel End: ${user.travelEnd}
Interests: ${user.interests}
Hobbies: ${user.hobbies}
Travel Reason: ${user.travelReason}
Budget: ${user.budget}
`).join("\n")}

First, filter the dataset to only include users whose travel location exactly matches the reference user's travel location.
Then, from this filtered set, select only those users who have overlapping travel dates with the reference user and share at least one interest.
Return a JSON output with the following format (JSON Only):

\\\json
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
\\\

Return ONLY the JSON output and nothing else.
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
