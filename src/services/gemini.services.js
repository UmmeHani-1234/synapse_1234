const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function chat(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction:
          "You are a strict API. Reply in max 2 sentences. No explanations. No filler. Be direct."
      }
    });

    return response.text;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = { chat };