import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { postToHost } from "../shared/extensionMessaging.js";
import "./popup.css";

const emptyPage = {
  title: "Current page",
  url: "",
  lang: "en",
  selectedText: "",
  textPreview: "",
  wordCount: 0
};

function App() {
  const [page, setPage] = useState(emptyPage);
  const [tab, setTab] = useState("summary");
  const [tone, setTone] = useState("Concise");
  const dragState = useRef(null);

  useEffect(() => {
    postToHost("POPUP_READY");

    const onMessage = (event) => {
      if (event.data?.runtimeId !== chrome.runtime.id) return;
      if (event.data.type === "PAGE_CONTEXT") {
        setPage({ ...emptyPage, ...event.data.data });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") postToHost("CLOSE_POPUP");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const fakeSummary = useMemo(() => {
    const source = page.selectedText || page.textPreview;
    if (!source) {
      return [
        "This prototype is ready to display a page summary.",
        "Real summarization and AI calls are intentionally not connected.",
        "The UI is isolated in an iframe so host page styles do not leak in."
      ];
    }

    const sentences = source
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .slice(0, 3);

    return sentences.length
      ? sentences
      : [
          "Selected content was captured from the page.",
          "A real integration can replace this static preview later.",
          "The current milestone focuses on UI and extension behavior."
        ];
  }, [page.selectedText, page.textPreview]);

  const handlePointerDown = (event) => {
    dragState.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragState.current) return;
    const movementX = event.clientX - dragState.current.x;
    const movementY = event.clientY - dragState.current.y;
    dragState.current = { ...dragState.current, x: event.clientX, y: event.clientY };
    postToHost("DRAG_POPUP", { movementX, movementY });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleHeaderButtonPointerDown = (event) => {
    event.stopPropagation();
  };

  const openOptionsPage = async () => {
    const url = chrome.runtime.getURL("options/index.html");

    try {
      await chrome.tabs.create({ url });
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="app-shell">
      <header
        className="topbar"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img className="brand-icon" src={chrome.runtime.getURL("icons/logo-128.png")} alt="" />
        <div className="brand-copy">
          <strong>ChatGPT Summarize</strong>
          <span>{page.title}</span>
        </div>
        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            onPointerDown={handleHeaderButtonPointerDown}
            onClick={openOptionsPage}
            aria-label="Open options"
            title="Open options"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="m19.4 15 .2-1.4 2-1.6-2-1.6-.2-1.4 1.2-2.2-2.8-1.6-1.4 1-1.4-.6L14.6 3h-3.2L11 5.6l-1.4.6-1.4-1-2.8 1.6L6.6 9l-.2 1.4-2 1.6 2 1.6.2 1.4-1.2 2.2 2.8 1.6 1.4-1 1.4.6.4 2.6h3.2l.4-2.6 1.4-.6 1.4 1 2.8-1.6L19.4 15Z" />
            </svg>
          </button>
          <button
            className="icon-button"
            type="button"
            onPointerDown={handleHeaderButtonPointerDown}
            onClick={() => postToHost("CLOSE_POPUP")}
            aria-label="Close"
            title="Close"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="Extension views">
        <button className={tab === "summary" ? "active" : ""} type="button" onClick={() => setTab("summary")}>
          Summarize
        </button>
        <button className={tab === "ask" ? "active" : ""} type="button" onClick={() => setTab("ask")}>
          Ask question
        </button>
        <button className={tab === "settings" ? "active" : ""} type="button" onClick={() => setTab("settings")}>
          Options
        </button>
      </nav>

      <section className="content">
        {tab === "summary" && (
          <>
            <div className="page-meta">
              <div>
                <span className="label">Source</span>
                <p>{page.selectedText ? "Selected text" : "Current page"}</p>
              </div>
              <div>
                <span className="label">Words</span>
                <p>{page.wordCount.toLocaleString()}</p>
              </div>
              <div>
                <span className="label">Language</span>
                <p>{page.lang}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <h1>{tone} summary</h1>
                <select value={tone} onChange={(event) => setTone(event.target.value)} aria-label="Summary style">
                  <option>Concise</option>
                  <option>Detailed</option>
                  <option>Executive</option>
                </select>
              </div>
              <ul>
                {fakeSummary.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="action-row">
              <button type="button">Regenerate</button>
              <button type="button">Copy</button>
              <button type="button">Summarize all</button>
            </div>
          </>
        )}

        {tab === "ask" && (
          <div className="chat-panel">
            <div className="assistant-bubble">
              Ask me anything about this page. This prototype will show the interaction shell without sending data to an
              AI service.
            </div>
            <div className="question-box">
              <input placeholder="Ask a question about this page" />
              <button type="button">Send</button>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="settings-list">
            <label>
              <span>Show selected text shortcut</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label>
              <span>Open popup in dark mode</span>
              <input type="checkbox" />
            </label>
            <label>
              <span>Preferred summary style</span>
              <select value={tone} onChange={(event) => setTone(event.target.value)}>
                <option>Concise</option>
                <option>Detailed</option>
                <option>Executive</option>
              </select>
            </label>
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
