# AI Accessibility & UX Auditor

AI-powered accessibility and UX analysis using **Gemma 4 Vision**, with AI-generated visual improvements.

AI Accessibility & UX Auditor analyzes website screenshots to identify accessibility and usability issues, provides explanations and actionable recommendations, and generates an improved visual version of the interface.

## Features

### Screenshot Analysis

Upload a website screenshot and receive an AI-powered accessibility and UX audit.

The system analyzes:

- Color contrast
- Typography and readability
- Spacing and alignment
- Visual hierarchy
- Button visibility
- Accessibility concerns
- General UX issues

### Accessibility Score

The application generates an overall accessibility and UX score based on the detected issues, providing a quick assessment of the interface.

### Issue Detection

Each detected issue includes:

- Issue title
- Category
- Severity
- Explanation
- Recommended fix

Issues are categorized by severity:

- **High**
- **Medium**
- **Low**

### AI Visual Fix

After the analysis, users can generate an improved version of the interface using the **Generate Improved UI** feature.

The system uses the original screenshot together with the detected audit issues to generate a redesigned version that focuses on:

- Improved contrast
- Better typography
- Clearer visual hierarchy
- Improved spacing
- Better button visibility
- Improved accessibility
- Better overall usability

The original design and improved version can then be compared side by side.

## How It Works

```text
Website Screenshot
        │
        ▼
┌──────────────────┐
│     Gemma 4      │
│   Vision Model   │
└────────┬─────────┘
         │
         ▼
 Accessibility & UX
      Analysis
         │
    ┌────┴─────┐
    ▼          ▼
Score &      Recommended
Issues       Improvements
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

## Technology Stack

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

- **Gemma 4 Vision** — screenshot accessibility and UX analysis
- **Gemini 3.1 Flash Image (Nano Banana 2)** — AI-generated visual improvements

### Development

- Git
- GitHub
- npm

## Project Structure

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

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/GirishRathod07/ui-accessibility-auditor.git
cd ui-accessibility-auditor
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure the Gemini API Key

The backend requires a Gemini API key.

#### Windows PowerShell

```powershell
$env:GEMINI_API_KEY="YOUR_API_KEY"
```

Do not commit API keys or other secrets to the repository.

For production deployments, use your hosting provider's environment-variable system or a properly configured `.env` file.

### 4. Start the Backend

From the `backend` directory:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

Expected output:

```text
Server running on http://localhost:5000
```

### 5. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will provide a local development URL, usually:

```text
http://localhost:5173
```

## Usage

1. Open the web application.
2. Upload a website screenshot.
3. Select **Analyze Screenshot**.
4. Wait for the Gemma 4 analysis.
5. Review the accessibility and UX score.
6. Review the detected issues and their severity.
7. Read the recommended improvements.
8. Select **Generate Improved UI**.
9. Compare the original screenshot with the AI-generated improved version.

## Example Workflow

```text
Upload Screenshot
       ↓
Gemma 4 Analysis
       ↓
Accessibility & UX Score
       ↓
Detected Issues
       ↓
Recommended Fixes
       ↓
Generate Improved UI
       ↓
Before / After Comparison
```

## Why This Project?

Traditional accessibility tools often provide technical reports that can be difficult for designers and developers to interpret.

This project combines:

**AI analysis + explanations + actionable recommendations + visual improvements**

Instead of simply identifying a problem, the application aims to communicate:

```text
What is wrong
      ↓
Why it matters
      ↓
How to fix it
      ↓
What an improved interface could look like
```

This makes accessibility feedback easier to understand and apply during the design and development process.

## Hackathon

Developed for:

**Hacktoberfest × MSC KBTCOE Nashik 2026**

### Track

**Best Use of Gemma 4**

Gemma 4 is used as the core vision model for analyzing website screenshots and identifying accessibility and UX issues.

The AI Visual Fix feature uses a separate image-generation model to demonstrate how the identified improvements could be applied visually.

## Future Improvements

- [ ] WCAG rule mapping
- [ ] Automatic color contrast calculations
- [ ] PDF accessibility reports
- [ ] Multiple screenshot analysis
- [ ] Mobile responsiveness analysis
- [ ] HTML/CSS accessibility scanning
- [ ] Browser extension
- [ ] Audit report export
- [ ] AI-generated HTML/CSS fixes
- [ ] Interactive before/after comparison
- [ ] Accessibility trend tracking

## Author

**Girish Rathod**

Computer Engineering Student  
SPPU, India

GitHub:  
https://github.com/GirishRathod07

## License

This project was developed for educational and hackathon purposes.
