const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Accessibility & UX Auditor API is running",
  });
});

// ============================================
// GEMMA 4 ACCESSIBILITY ANALYSIS
// ============================================

async function analyzeWithGemma(imageData, mimeType) {
  const prompt = `
You are an expert accessibility and UX auditor.

Analyze the provided website screenshot using visual reasoning.

Return ONLY valid JSON in this exact structure:

{
  "score": 0,
  "summary": "short overall summary",
  "issues": [
    {
      "title": "issue title",
      "category": "Accessibility or UX",
      "severity": "high",
      "reason": "why this is a problem",
      "fix": "recommended fix"
    }
  ]
}

Rules:

- score must be an integer from 0 to 100.
- Identify real visual accessibility and UX problems visible in the screenshot.
- Focus on color contrast, typography, readability, spacing, alignment,
  visual hierarchy, button visibility, consistency and accessibility.
- severity must be exactly one of: "high", "medium", "low".
- Keep explanations concise and practical.
- Do not invent invisible HTML or CSS problems.
- Return only JSON.
`;

  const models = [
    "gemma-4-31b-it",
    "gemini-2.5-flash",
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`🤖 Trying model: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
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
          },
        ],
      });

      if (response?.text) {
        console.log(`✅ Analysis completed with ${model}`);
        return response.text;
      }

      throw new Error("Model returned an empty response.");
    } catch (error) {
      console.error(`❌ ${model} failed:`, error.message);
      lastError = error;
    }
  }

  throw lastError || new Error("All AI models failed.");
}

// ============================================
// ANALYZE SCREENSHOT
// ============================================

app.post("/analyze", upload.single("screenshot"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Screenshot is required.",
      });
    }

    console.log("📸 Screenshot received for analysis");

    const imageData = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/png";

    const rawResult = await analyzeWithGemma(
      imageData,
      mimeType
    );

    let cleaned = rawResult.trim();

    // Remove markdown code fences if model returns them
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Extract JSON object if extra text exists
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    let result;

    try {
      result = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("❌ Failed to parse AI JSON:");
      console.error(cleaned);

      return res.status(500).json({
        error: "AI returned invalid JSON.",
        raw: cleaned,
      });
    }

    if (
      typeof result.score !== "number" ||
      !Array.isArray(result.issues)
    ) {
      return res.status(500).json({
        error: "AI returned an invalid analysis format.",
      });
    }

    console.log("✅ Accessibility analysis successful");

    res.json(result);
  } catch (error) {
    console.error("❌ Analysis failed:", error);

    res.status(500).json({
      error:
        error?.message ||
        "Failed to analyze screenshot.",
    });
  }
});

// ============================================
// AI VISUAL FIX
// ============================================

app.post(
  "/generate-fix",
  upload.single("screenshot"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Screenshot is required.",
        });
      }

      const imageData = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype || "image/png";

      let issues = [];

      try {
        issues = JSON.parse(req.body?.issues || "[]");
      } catch {
        issues = [];
      }

      const issueText = issues
        .slice(0, 8)
        .map(
          (issue, index) =>
            `${index + 1}. ${issue.title || "Issue"} — ${
              issue.severity || "medium"
            } — ${issue.fix || issue.reason || ""}`
        )
        .join("\n");

      console.log(
        "✨ Starting AI Visual Fix with Gemini 3.1 Flash Image..."
      );

      const prompt = `
You are an expert UI/UX and accessibility designer.

You are given a screenshot of an existing website and an accessibility/UX audit.

Create an improved visual redesign of THE SAME WEBSITE.

IMPORTANT RULES:

- Preserve the original website's main purpose.
- Preserve the recognizable structure and major sections.
- Do NOT create an unrelated website.
- Fix the accessibility and UX problems identified by the audit.
- Improve color contrast.
- Improve typography and readability.
- Improve spacing and alignment.
- Improve visual hierarchy.
- Improve button visibility.
- Improve accessibility.
- Keep the design realistic and production-quality.
- Keep the original content whenever possible.
- Return ONE clean webpage screenshot.

AUDIT ISSUES:

${
  issueText ||
  "Improve the overall accessibility, hierarchy, spacing, contrast and visual clarity."
}
`;

      const interaction = await ai.interactions.create({
        model: "gemini-3.1-flash-image",

        input: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image",
            mime_type: mimeType,
            data: imageData,
          },
        ],

        response_format: {
          type: "image",
          mime_type: "image/png",
          aspect_ratio: "16:9",
          image_size: "1K",
        },
      });

      const generatedImage = interaction.output_image;

      if (!generatedImage || !generatedImage.data) {
        throw new Error(
          "Image generation returned no image data."
        );
      }

      console.log(
        "✅ AI Visual Fix generated successfully"
      );

      res.json({
        image: `data:image/png;base64,${generatedImage.data}`,
        model: "gemini-3.1-flash-image",
      });
    } catch (error) {
      console.error(
        "❌ AI Visual Fix failed:",
        error
      );

      res.status(500).json({
        error:
          error?.message ||
          "Failed to generate improved UI.",
      });
    }
  }
);

// ============================================
// START SERVER
// ============================================

app.listen(5000, () => {
  console.log(
    "🚀 Server running on http://localhost:5000"
  );
});
