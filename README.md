# ♿ AI Accessibility & UX Auditor

> **AI-powered accessibility and UX analysis using Gemma 4 Vision — with AI-generated visual improvements.**

An intelligent web accessibility and UX auditing tool that analyzes website screenshots, identifies usability and accessibility problems, explains the issues, and suggests practical improvements.

The project also includes an **AI Visual Fix** feature that generates an improved version of the analyzed UI.

---

## 🚀 Features

### 🔍 AI Screenshot Analysis
Upload a screenshot of any website UI and get an AI-powered accessibility and UX audit.

The system analyzes:

- 🎨 Color contrast
- 📝 Typography and readability
- 📐 Spacing and alignment
- 🧭 Visual hierarchy
- 🔘 Button visibility
- ♿ Accessibility issues
- 📱 General UX problems

### 📊 Accessibility Score

The analyzer generates an overall score based on the detected issues and provides a quick overview of the UI quality.

### ⚠️ Issue Detection

Every detected problem includes:

- Issue title
- Category
- Severity
- Explanation
- Recommended fix

Severity levels:

- 🔴 High
- 🟠 Medium
- 🟢 Low

### ✨ AI Visual Fix

After analyzing the screenshot, users can click:

**✨ Generate Improved UI**

The AI uses the original screenshot and detected audit issues to create an improved visual version of the same website.

This helps users visually understand what a more accessible and user-friendly design could look like.

---

## 🧠 How It Works

```text
        Website Screenshot
                │
                ▼
        ┌─────────────────┐
        │    Gemma 4      │
        │  Vision Model   │
        └────────┬────────┘
                 │
                 ▼
       Accessibility & UX
             Analysis
                 │
        ┌────────┴─────────┐
        ▼                  ▼
   Score & Issues      Recommended
                       Improvements
        │
        ▼
  Generate Improved UI
        │
        ▼
 Gemini 3.1 Flash Image
    (Nano Banana 2)
        │
        ▼
  Improved UI Screenshot
```

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- HTML

### Backend

- Node.js
- Express.js
- Multer
- CORS

### AI

- **Gemma 4 Vision** — accessibility and UX analysis
- **Gemini 3.1 Flash Image (Nano Banana 2)** — visual UI improvement

### Development

- Git
- GitHub
- npm

---

## 📁 Project Structure

```text
ui-accessibility-auditor/
│
├── backend/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/GirishRathod07/ui-accessibility-auditor.git
```

```bash
cd ui-accessibility-auditor
```

---

### 2. Install backend dependencies

```bash
cd backend
npm install
```

---

### 3. Add your Gemini API key

Set the API key as an environment variable.

#### Windows PowerShell

```powershell
$env:GEMINI_API_KEY="YOUR_NEW_API_KEY"
```

Do **not** commit your API key to GitHub.

---

### 4. Start the backend

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

You should see:

```text
🚀 Server running on http://localhost:5000
```

---

### 5. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open the Vite URL shown in your terminal, usually:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

The backend requires:

```text
GEMINI_API_KEY=YOUR_NEW_API_KEY
```

For production, use a `.env` file or your hosting provider's environment-variable system.

Make sure `.env` is included in `.gitignore`.

---

## 📸 Usage

1. Open the web application.
2. Upload a website screenshot.
3. Click **Analyze Screenshot**.
4. Wait for the Gemma 4 analysis.
5. Review the accessibility score.
6. Review detected UX/accessibility issues.
7. Read the recommended fixes.
8. Click **Generate Improved UI**.
9. Compare the original screenshot with the AI-improved version.

---

## 🎯 Example Workflow

```text
Upload Screenshot
       ↓
AI Analysis
       ↓
Accessibility Score
       ↓
Detected Issues
       ↓
Recommended Fixes
       ↓
Generate Improved UI
       ↓
Before / After Comparison
```

---

## 💡 Why This Project?

Many accessibility auditing tools provide technical reports that can be difficult for designers and developers to understand.

This project makes accessibility feedback more practical by combining:

**AI analysis + clear explanations + actionable fixes + visual redesign**

Instead of only saying:

> "The contrast ratio is poor."

The system helps communicate:

> What is wrong → Why it matters → How to fix it → What an improved design could look like.

---

## 🏆 Hackathon

This project was developed for:

**Hacktoberfest × MSC KBTCOE Nashik 2026**

### Track

**Best Use of Gemma 4**

Gemma 4 is used as the core vision model for analyzing website screenshots and identifying accessibility and UX problems.

The visual redesign feature uses a separate image-generation model to demonstrate the recommended improvements.

---

## 🔮 Future Improvements

- [ ] WCAG rule mapping
- [ ] Automatic color contrast calculations
- [ ] PDF accessibility reports
- [ ] Multiple screenshot analysis
- [ ] Mobile responsiveness analysis
- [ ] HTML/CSS accessibility scanning
- [ ] Browser extension
- [ ] Export audit reports
- [ ] AI-generated HTML/CSS fixes
- [ ] Side-by-side interactive comparison
- [ ] Accessibility trend tracking

---

## 👨‍💻 Author

**Girish Rathod**

Computer Engineering Student  
SPPU | India

GitHub:  
https://github.com/GirishRathod07

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project is created for educational and hackathon purposes.
