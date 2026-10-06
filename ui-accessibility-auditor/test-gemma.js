const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  try {
    console.log("Testing Gemma 4...");

    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it",
      contents: "Say exactly: Gemma is working!",
    });

    console.log("\nSUCCESS:");
    console.log(response.text);
  } catch (error) {
    console.error("\nFAILED:");
    console.error(error);
  }
}

main();