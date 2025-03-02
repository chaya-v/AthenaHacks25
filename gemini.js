const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const fs = require("fs");
  const fetch = require("node-fetch");  // Importing node-fetch
  
  const apiKey = process.env.AIzaSyCJafWiBv88DX2iMj6pgjDc_NOZwSu6wL4;  // Ensure the API key is set in environment variables
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  // Function to extract and match users based on travel location and travel dates
  async function getUserData() {
    // Read the user data from the JSON file
    const data = JSON.parse(fs.readFileSync("userData.json", "utf8"));
  
    // Extract and map user data to include only relevant fields for matching
    return data.map((user) => ({
      fullName: user.fullName,
      email: user.email,
      travelLocation: user.travelLocation,
      travelStart: new Date(user.travelStart),
      travelEnd: new Date(user.travelEnd),
      interests: user.interests,
      hobbies: user.hobbies,
      travelReason: user.travelReason,
      budget: user.budget,
    }));
  }
  
  async function run() {
    try {
      // Get the user data
      const userData = await getUserData();
  
      // Prepare the prompt to generate content
      const prompt = `We have a dataset of travelers with the following information:
  
      1. **User Details**: Each user has a name, email, travel destination, travel start date, travel end date, interests, hobbies, budget, and travel reason.
      2. **Task**: Please process the user data and generate insightful, personalized recommendations or matches based on their profiles. Focus on matching users with compatible travel interests, travel dates, locations, and reasons for traveling.
      3. **Expectations**: You should:
         - Suggest users who might match well based on overlapping interests, travel dates, and shared travel reasons.
         - Highlight users who are traveling to the same or nearby locations during overlapping dates.
         - Output the user names, their travel details, and travel reasons, and any shared interests or reasons for travel.
  
      Please generate the relevant content based on this information, providing the best possible matches.`;
  
      // Start a chat session with the generative AI model
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });
  
      // Send the generated prompt and user data as the message
      const result = await chatSession.sendMessage(
        `${prompt}\nHere is the raw data for users: ${JSON.stringify(userData)}`
      );
  
      // Log the generated content
      console.log("Generated Content:", result.response.text());
    } catch (error) {
      console.error("Error generating content:", error);
    }
  }
  
  // Call the run function to generate content
  run().catch(console.error);
  