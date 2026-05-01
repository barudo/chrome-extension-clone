import React from "react";
import { createRoot } from "react-dom/client";
import "./welcome.css";

function Welcome() {
  return (
    <main className="welcome-shell">
      <section className="intro">
        <img src={chrome.runtime.getURL("icons/logo-128.png")} alt="" />
        <p className="eyebrow">Extension installed</p>
        <h1>ChatGPT Summarize</h1>
        <p className="lede">
          The UI clone is ready. Pin the extension, open any website, and click the toolbar button to show the
          iframe-isolated React panel.
        </p>
        <div className="actions">
          <a href="https://en.wikipedia.org/wiki/ChatGPT" target="_blank" rel="noreferrer">
            Try on a page
          </a>
          <button type="button" onClick={() => window.close()}>
            Done
          </button>
        </div>
      </section>

      <section className="preview" aria-label="Extension preview">
        <div className="browser-bar">
          <span />
          <span />
          <span />
        </div>
        <div className="mock-page">
          <div className="article">
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="mock-popup">
            <header>
              <img src={chrome.runtime.getURL("icons/logo-128.png")} alt="" />
              <strong>ChatGPT Summarize</strong>
            </header>
            <nav>
              <span />
              <span />
              <span />
            </nav>
            <ul>
              <li />
              <li />
              <li />
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Welcome />);
