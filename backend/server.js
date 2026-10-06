// ============================================
// AI VISUAL FIX
// ============================================

app.post("/generate-fix", upload.single("screenshot"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Screenshot is required."
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

    console.log("✨ Starting AI Visual Fix with Gemini 3.1 Flash Image...");

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

${issueText || "Improve the overall accessibility, hierarchy, spacing, contrast and visual clarity."}
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-image",

      input: [
        {
          type: "text",
          text: prompt
        },
        {
          type: "image",
          mime_type: mimeType,
          data: imageData
        }
      ],

      response_format: {
        type: "image",
        mime_type: "image/png",
        aspect_ratio: "16:9",
        image_size: "1K"
      }
    });

    const generatedImage = interaction.output_image;

    if (!generatedImage || !generatedImage.data) {
      throw new Error(
        "Image generation returned no image data."
      );
    }

    console.log("✅ AI Visual Fix generated successfully");

    res.json({
      image: `data:image/png;base64,${generatedImage.data}`,
      model: "gemini-3.1-flash-image"
    });

  } catch (error) {

    console.error(
      "❌ AI Visual Fix failed:",
      error
    );

    res.status(500).json({
      error:
        error?.message ||
        "Failed to generate improved UI."
    });
  }
});
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});