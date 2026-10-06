import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/* ---------------------------------------------------------
   Config
--------------------------------------------------------- */

const API_URL = "http://localhost:5000/analyze";
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const SEVERITY_LEVELS = ["Critical", "High", "Medium", "Low"];

const ANALYSIS_ERROR = {
  title: "Analysis failed",
  message: "Gemma could not analyze this screenshot. Please try again.",
};

const CONNECTION_ERROR = {
  title: "Backend unreachable",
  message: "Cannot connect to the analysis server.",
  hint: "Make sure server.js is running on port 5000.",
};

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

const formatFileSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const getFileTypeLabel = (file) =>
  (file.type.split("/")[1] || "image").toUpperCase();

const validateFile = (file) => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Unsupported file type. Please upload a PNG, JPG or WEBP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return `This image is ${formatFileSize(file.size)}. The maximum size is 10 MB.`;
  }

  return "";
};

const normalizeSeverity = (severity) => {
  const value = String(severity || "").trim().toLowerCase();
  return SEVERITY_LEVELS.find((level) => level.toLowerCase() === value) || "Low";
};

// Makes the backend response safe to render. Returns null if it is unusable.
const normalizeResult = (data) => {
  const score = Number(data?.score);

  if (!Number.isFinite(score)) return null;

  const issues = Array.isArray(data.issues) ? data.issues : [];

  return {
    score: Math.round(Math.min(100, Math.max(0, score))),
    summary: data.summary || "No summary was returned for this screenshot.",
    issues: issues.map((issue) => ({
      title: issue?.title || "Untitled issue",
      category: issue?.category || "General",
      severity: normalizeSeverity(issue?.severity),
      reason: issue?.reason || "No explanation provided.",
      fix: issue?.fix || "No recommendation provided.",
    })),
  };
};

const getScoreTone = (score) => {
  if (score >= 80) return { key: "good", label: "Healthy" };
  if (score >= 50) return { key: "fair", label: "Needs work" };
  return { key: "poor", label: "At risk" };
};

/* ---------------------------------------------------------
   Score ring
--------------------------------------------------------- */

function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div
      className="score-ring"
      role="img"
      aria-label={`UX health score ${score} out of 100`}
    >
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
        </defs>

        <circle className="ring-track" cx="64" cy="64" r={radius} />
        <circle
          className="ring-progress"
          cx="64"
          cy="64"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="ring-label">
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   App
--------------------------------------------------------- */

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");
  const submittingRef = useRef(false);
  const resultsRef = useRef(null);

  // Stop the browser from opening an image dropped outside the upload area.
  useEffect(() => {
    const preventDefault = (event) => event.preventDefault();

    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);

    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  // Release the preview object URL when the app unmounts.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  // Bring the results into view once an analysis completes.
  useEffect(() => {
    if (result) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const severityCounts = useMemo(() => {
    const counts = Object.fromEntries(SEVERITY_LEVELS.map((level) => [level, 0]));
    result?.issues.forEach((issue) => {
      counts[issue.severity] += 1;
    });
    return counts;
  }, [result]);

  const sortedIssues = useMemo(
    () =>
      result
        ? [...result.issues].sort(
            (a, b) =>
              SEVERITY_LEVELS.indexOf(a.severity) - SEVERITY_LEVELS.indexOf(b.severity)
          )
        : [],
    [result]
  );

  /* ---------- File selection ---------- */

  const updatePreview = (nextFile) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    const url = nextFile ? URL.createObjectURL(nextFile) : "";
    previewUrlRef.current = url;
    setPreviewUrl(url);
  };

  const selectFile = (selectedFile) => {
    if (!selectedFile || loading) return;

    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError({ title: "Invalid file", message: validationError });
      return;
    }

    setFile(selectedFile);
    updatePreview(selectedFile);
    setResult(null);
    setError(null);
  };

  const removeFile = () => {
    if (loading) return;

    setFile(null);
    updatePreview(null);
    setResult(null);
    setError(null);
  };

  const openFilePicker = () => {
    if (!loading) fileInputRef.current?.click();
  };

  const handleFileInput = (event) => {
    selectFile(event.target.files?.[0]);
    // Reset so the same file can be chosen again after removing it.
    event.target.value = "";
  };

  /* ---------- Drag and drop ---------- */

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = loading ? "none" : "copy";
    if (!loading && !dragging) setDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    // Ignore leave events fired when moving between child elements.
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  /* ---------- Analysis ---------- */

  const analyzeScreenshot = async () => {
    if (!file || submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("screenshot", file);

      let response;

      try {
        response = await fetch(API_URL, { method: "POST", body: formData });
      } catch (networkError) {
        console.error("[UXAuditor] Could not reach backend:", networkError);
        setError(CONNECTION_ERROR);
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        console.error("[UXAuditor] Backend returned an error:", {
          status: response.status,
          body: data,
        });
        setError(ANALYSIS_ERROR);
        return;
      }

      const normalized = normalizeResult(data);

      if (!normalized) {
        console.error("[UXAuditor] Unexpected audit format:", data);
        setError(ANALYSIS_ERROR);
        return;
      }

      setResult(normalized);
    } catch (err) {
      console.error("[UXAuditor] Analysis error:", err);
      setError(ANALYSIS_ERROR);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  /* ---------- Render ---------- */

  const tone = result ? getScoreTone(result.score) : null;

  const emptyStateProps = file
    ? {}
    : {
        role: "button",
        tabIndex: 0,
        "aria-label": "Upload a screenshot",
        onClick: openFilePicker,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        },
      };

  return (
    <div className="app">
      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>

      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <span>
            UX<span>Auditor</span>
          </span>
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          Gemma 4 Vision
        </div>
      </nav>

      <main className="hero">
        <div className="badge">
          <span>✦</span>
          AI-POWERED VISUAL AUDIT
        </div>

        <h1>
          Find what's wrong
          <br />
          <span>before your users do.</span>
        </h1>

        <p className="subtitle">
          Upload a website screenshot and let AI inspect its accessibility,
          usability, readability, and visual design.
        </p>

        <div className="upload-card">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileInput}
            hidden
          />

          <div
            className={`upload-area ${dragging ? "dragging" : ""} ${
              file ? "has-file" : ""
            }`}
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            {...emptyStateProps}
          >
            {file ? (
              <div className="preview">
                <div className="preview-frame">
                  <img src={previewUrl} alt={`Preview of ${file.name}`} />
                </div>

                <div className="preview-meta">
                  <div className="preview-info">
                    <span className="preview-name" title={file.name}>
                      {file.name}
                    </span>
                    <span className="preview-size">
                      {formatFileSize(file.size)} · {getFileTypeLabel(file)}
                    </span>
                  </div>

                  <div className="preview-actions">
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={openFilePicker}
                      disabled={loading}
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      className="ghost-btn danger"
                      onClick={removeFile}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {dragging && (
                  <div className="drop-overlay">Drop to replace screenshot</div>
                )}
              </div>
            ) : (
              <>
                <div className="upload-icon">↑</div>
                <h3>{dragging ? "Release to upload" : "Drop your screenshot here"}</h3>
                <p>Drag & drop an image here or click to browse</p>
                <div className="file-types">
                  PNG <span>•</span> JPG <span>•</span> WEBP <span>•</span> MAX 10 MB
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            className="analyze-btn"
            disabled={!file || loading}
            aria-busy={loading}
            onClick={analyzeScreenshot}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                <span>Analyzing with Gemma 4…</span>
              </>
            ) : (
              <>
                <span>Analyze Screenshot</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-box" role="alert">
            <div className="error-title">
              <span aria-hidden="true">⚠</span>
              {error.title}
            </div>
            <p>{error.message}</p>
            {error.hint && <small>{error.hint}</small>}
          </div>
        )}

        {result && (
          <section className="results" ref={resultsRef} aria-live="polite">
            <div className="results-heading">
              <div>
                <span className="section-label">AUDIT RESULTS</span>
                <h2>Your UX audit</h2>
              </div>
              <span className="result-status">✓ Analysis complete</span>
            </div>

            <div className="overview">
              <div className="score-card">
                <ScoreRing score={result.score} />

                <div className="score-copy">
                  <span className="card-label">UX HEALTH SCORE</span>
                  <div className="score-headline">
                    <strong>{result.score}</strong>
                    <span>/ 100</span>
                  </div>
                  <span className={`score-tone tone-${tone.key}`}>{tone.label}</span>
                  <p>Overall visual experience based on this screenshot.</p>
                </div>
              </div>

              <div className="summary-card">
                <span className="card-label">AI SUMMARY</span>
                <p>{result.summary}</p>
              </div>
            </div>

            <div className="severity-stats">
              {SEVERITY_LEVELS.map((level) => (
                <div
                  key={level}
                  className={`stat sev-${level.toLowerCase()} ${
                    severityCounts[level] === 0 ? "is-zero" : ""
                  }`}
                >
                  <strong>{severityCounts[level]}</strong>
                  <span>
                    <i aria-hidden="true"></i>
                    {level}
                  </span>
                </div>
              ))}
            </div>

            <div className="issues">
              <div className="issues-header">
                <div>
                  <h2>Detected Issues</h2>
                  <p>Problems Gemma 4 identified in your interface</p>
                </div>
                <span className="issue-count">
                  {result.issues.length} found
                </span>
              </div>

              {sortedIssues.length === 0 ? (
                <div className="empty-issues">
                  No issues were detected in this screenshot.
                </div>
              ) : (
                sortedIssues.map((issue, index) => {
                  const severityKey = issue.severity.toLowerCase();

                  return (
                    <article
                      className={`issue-card sev-${severityKey}`}
                      key={`${issue.title}-${index}`}
                    >
                      <div className="issue-head">
                        <span className={`severity-badge sev-${severityKey}`}>
                          {issue.severity}
                        </span>
                        <span className="issue-index">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h3>{issue.title}</h3>
                      <div className="category">{issue.category}</div>

                      <div className="issue-detail">
                        <div className="detail-block">
                          <span className="detail-label">Why this matters</span>
                          <p>{issue.reason}</p>
                        </div>
                        <div className="detail-block fix">
                          <span className="detail-label">Recommended fix</span>
                          <p>{issue.fix}</p>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}

        <div className="features">
          <div className="feature">
            <div className="feature-number">01</div>
            <div>
              <h3>Accessibility</h3>
              <p>Detect contrast, readability and visual barriers.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-number">02</div>
            <div>
              <h3>UX Problems</h3>
              <p>Find unclear hierarchy, layout and interaction issues.</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature-number">03</div>
            <div>
              <h3>Actionable Fixes</h3>
              <p>Get practical recommendations you can apply immediately.</p>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <span>Built with React</span>
        <span>•</span>
        <span>Powered by Gemma 4</span>
      </footer>
    </div>
  );
}

export default App;
