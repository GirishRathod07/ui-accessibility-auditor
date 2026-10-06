const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  try {
    console.log("🔍 Auditing website screenshot...\n");

    const imageData = fs
      .readFileSync("test-website.png")
      .toString("base64");

    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it",

      contents: [
        {
          text: `
You are an expert website UX and accessibility auditor.

Analyze the provided website screenshot.

Return ONLY valid JSON. Do not use markdown.
Use exactly this structure:

{
  "score": 0,
  "summary": "",
  "issues": [
    {
      "title": "",
      "category": "Accessibility",
      "severity": "High",
      "reason": "",
      "fix": ""
    }
  ]
}

Rules:
- score must be between 0 and 100.
- Find 3 to 8 important issues.
- category must be one of:
  "Accessibility", "UX", "Readability", "Visual Design", "Responsive"
- severity must be one of:
  "Critical", "High", "Medium", "Low"
- Only report problems that can reasonably be identified from the screenshot.
- Do not claim to verify HTML, DOM, alt attributes, keyboard navigation, or actual WCAG compliance from a screenshot alone.
- Keep each reason and fix short and practical.
          `,
        },
        {
          inlineData: {
            mimeType: "image/png",
            data: imageData,
          },
        },
      ],
    });

    const result = response.text;

    console.log("===== RAW GEMMA OUTPUT =====\n");
    console.log(result);

    // Remove accidental markdown fences if Gemma adds them
    const cleaned = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const audit = JSON.parse(cleaned);

    console.log("\n===== PARSED AUDIT =====\n");
    console.log(JSON.stringify(audit, null, 2));

  } catch (error) {
    console.error("\n❌ FAILED:");
    console.error(error);
  }
}

main();