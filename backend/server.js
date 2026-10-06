const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================================
   HOME / HEALTH CHECK
========================================= */

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "UXAuditor backend is running",
    model: "Gemma 4 Vision",
  });
});

/* =========================================
   GEMMA ANALYSIS
========================================= */

async function analyzeWithGemma(imageData, mimeType) {
  const prompt = `
You are an expert website UX and accessibility auditor.

Analyze the provided website screenshot.

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the JSON in code fences.

Use exactly this structure:

{
  "score": 0,
  "summary": "",
  "issues": [
    {
      "title": "",
      "category": "",
      "severity": "",
      "reason": "",
      "fix": ""
    }
  ]
}

Rules:

- score must be between 0 and 100.
- Find 3 to 8 important issues.
- category must be one of:
  "Accessibility",
  "UX",
  "Readability",
  "Visual Design",
  "Responsive"

- severity must be one of:
  "Critical",
  "High",
  "Medium",
  "Low"

- Only report problems that can reasonably be identified from the screenshot.
- Do not claim to verify HTML, DOM, alt attributes, keyboard navigation,
  JavaScript behavior, or exact WCAG compliance.
- Keep reasons and fixes short and practical.
- Focus on visible design, layout, readability, accessibility and UX.
`;

  const response = await ai.models.generateContent({
    model: "gemma-4-31b-it",

    contents: [
      {
        text: prompt,
      },
      {
        inlineData: {
          mimeType,
          data: imageData,
        },
      },
    ],
  });

  return response.text;
}

/* =========================================
   ANALYZE ENDPOINT
========================================= */

app.post("/analyze", upload.single("screenshot"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No screenshot uploaded.",
      });
    }

    console.log("\n=================================");
    console.log("📸 Screenshot received");
    console.log("📁 File:", req.file.originalname);
    console.log("📦 Size:", req.file.size, "bytes");
    console.log("🧠 Sending to Gemma 4...");
    console.log("=================================\n");

    const imageData = req.file.buffer.toString("base64");

    let rawResult = null;
    let lastError = null;

    /*
      Try Gemma up to 3 times.
      This handles temporary 500 INTERNAL errors.
    */

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🤖 Gemma attempt ${attempt}/3`);

        rawResult = await analyzeWithGemma(
          imageData,
          req.file.mimetype
        );

        console.log("✅ Gemma response received");

        break;
      } catch (error) {
        lastError = error;

        console.error(
          `❌ Gemma attempt ${attempt} failed:`,
          error.message
        );

        if (attempt < 3) {
          console.log("⏳ Retrying in 2 seconds...\n");

          await new Promise((resolve) =>
            setTimeout(resolve, 2000)
          );
        }
      }
    }

    if (!rawResult) {
      console.error("❌ All Gemma attempts failed.");

      return res.status(502).json({
        error: "Gemma temporarily failed.",
        details: lastError?.message || "Unknown Gemini error",
      });
    }

    console.log("\n===== RAW GEMMA OUTPUT =====");
    console.log(rawResult);

    /*
      Remove accidental markdown fences
    */

    let cleaned = rawResult
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    /*
      If Gemma puts extra text around JSON,
      extract the JSON object.
    */

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    let audit;

    try {
      audit = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("❌ JSON parsing failed");
      console.error(cleaned);

      return res.status(500).json({
        error: "Gemma returned invalid JSON.",
        raw: cleaned,
      });
    }

    /*
      Basic validation
    */

    if (
      typeof audit.score !== "number" ||
      !Array.isArray(audit.issues)
    ) {
      return res.status(500).json({
        error: "Gemma returned an unexpected response format.",
      });
    }

    console.log("\n✅ ANALYSIS COMPLETE");
    console.log("Score:", audit.score);
    console.log("Issues:", audit.issues.length);
    console.log("=================================\n");

    res.json(audit);

  } catch (error) {
    console.error("\n🔥 SERVER ERROR");
    console.error(error);

    res.status(500).json({
      error: "Analysis failed.",
      details: error.message,
    });
  }
});

/* =========================================
   SERVER
========================================= */

const PORT = 5000;

app.listen(PORT, () => {
  console.log("");
  console.log("=================================");
  console.log("🚀 UXAuditor Backend");
  console.log("=================================");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("🧠 Model: Gemma 4 Vision");
  console.log("=================================");
  console.log("");
});