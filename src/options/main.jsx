import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./options.css";

const defaults = {
  showSelectionButton: true,
  darkMode: false,
  summaryStyle: "Concise"
};

function App() {
  const [settings, setSettings] = useState(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(defaults).then((storedSettings) => {
      setSettings(storedSettings);
      setLoaded(true);
    });
  }, []);

  const updateSetting = async (key, value) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    await chrome.storage.local.set({ [key]: value });
  };

  return (
    <main className="options-page">
      <section className="options-panel" aria-busy={!loaded}>
        <div className="options-heading">
          <img src={chrome.runtime.getURL("icons/logo-128.png")} alt="" />
          <div>
            <h1>Options</h1>
            <p>ChatGPT Summarize UI Clone</p>
          </div>
        </div>

        <label className="setting-row">
          <span>
            <strong>Show selected text shortcut</strong>
            <small>Display the summarize button after selecting longer text.</small>
          </span>
          <input
            type="checkbox"
            checked={settings.showSelectionButton}
            onChange={(event) => updateSetting("showSelectionButton", event.target.checked)}
          />
        </label>

        <label className="setting-row">
          <span>
            <strong>Open popup in dark mode</strong>
            <small>Keep this preference ready for the production UI.</small>
          </span>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(event) => updateSetting("darkMode", event.target.checked)}
          />
        </label>

        <label className="setting-row">
          <span>
            <strong>Preferred summary style</strong>
            <small>Choose the default tone used by the popup controls.</small>
          </span>
          <select
            value={settings.summaryStyle}
            onChange={(event) => updateSetting("summaryStyle", event.target.value)}
          >
            <option>Concise</option>
            <option>Detailed</option>
            <option>Executive</option>
          </select>
        </label>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
