const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI("AIzaSyDxorrWajQDOE99OAPS4PMRyjPvvwzhn3g"); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to extract and format user data for the prompt
async function getUserData() {
    const fs = require('fs');
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
        We have a dataset of travelers with the following information:

        1. **User Details**: Each user has a name, email, travel destination, travel start date, travel end date, interests, hobbies, budget, and travel reason.
        2. **Task**: Please process the user data and generate insightful, personalized recommendations or matches based on their profiles. Focus on matching users with compatible travel interests, travel dates, locations, and reasons for traveling. 
        3. **Expectations**: You should:
           - Suggest users who might match well based on overlapping interests, travel dates, and shared travel reasons.
           - Highlight users who are traveling to the same or nearby locations during overlapping dates.
           - Output the user names, their travel details, and travel reasons, and any shared interests or reasons for travel.
           - Provide a brief summary of why the users are good matches based on the data provided.

        Here is the user data in a more readable format:

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

        Please generate the relevant content based on this information, providing the best possible matches.
        `;

        // Generate the content using Gemini AI
        const result = await model.generateContent(prompt);

        // Output the result
        console.log('Generated Content:', result.response.text());
    } catch (error) {
        console.error('Error generating content:', error);
    }
}

// Call the generateContent function to generate content
generateContent().catch(console.error);
