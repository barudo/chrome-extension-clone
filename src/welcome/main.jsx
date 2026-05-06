import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./welcome.css";

const providers = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Use your ChatGPT account in the extension.",
    helper: "Recommended for GPT-4o, GPT-4, and GPT-3.5 summaries."
  },
  {
    id: "openai",
    name: "OpenAI API",
    description: "Connect with an OpenAI API key.",
    helper: "For users who prefer their own API key."
  },
  {
    id: "custom-gpt",
    name: "Custom GPT",
    description: "Point the extension at a GPT workspace.",
    helper: "For custom GPTs and team accounts."
  }
];

const steps = ["Pin", "GPT", "Login"];

function getAssetUrl(path) {
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(path);
  }

  return `/${path}`;
}

function Stepper({ currentStep }) {
  return (
    <ol className="stepper" aria-label="Onboarding progress">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isComplete = currentStep > stepNumber;

        return (
          <li className="stepper-item" key={label}>
            <span className={isActive ? "step active" : isComplete ? "step complete" : "step"}>{stepNumber}</span>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function PinStep({ onNext }) {
  return (
    <section className="flow-panel">
      <div className="panel-copy">
        <p className="eyebrow">Welcome</p>
        <h1>Pin ChatGPT Summarize</h1>
        <p className="lede">
          Keep the extension visible in your Chrome toolbar so it is ready when you want to summarize a page.
        </p>
      </div>

      <div className="pin-demo" aria-hidden="true">
        <div className="browser-strip">
          <span />
          <span />
          <span />
          <div className="address-bar" />
          <button type="button" className="extension-chip">
            <img src={getAssetUrl("icons/logo-32.png")} alt="" />
          </button>
        </div>
        <div className="pin-popover">
          <div className="pin-row">
            <img src={getAssetUrl("icons/logo-32.png")} alt="" />
            <div>
              <strong>ChatGPT Summarize</strong>
              <span>Pin to toolbar</span>
            </div>
            <span className="pin-icon">PIN</span>
          </div>
        </div>
      </div>

      <div className="panel-actions end">
        <button type="button" className="button primary" onClick={onNext}>
          Skip
        </button>
      </div>
    </section>
  );
}

function ProviderStep({ selectedProvider, onSelectProvider, onNext }) {
  return (
    <section className="flow-panel">
      <div className="panel-copy">
        <p className="eyebrow">GPT provider</p>
        <h1>Select a provider</h1>
        <p className="lede">Choose where the extension should show its login prompt. This is only a visual setup.</p>
      </div>

      <div className="provider-list" role="radiogroup" aria-label="GPT provider">
        {providers.map((provider) => (
          <label className="provider-option" key={provider.id}>
            <input
              type="radio"
              name="provider"
              value={provider.id}
              checked={selectedProvider === provider.id}
              onChange={() => onSelectProvider(provider.id)}
            />
            <span className="provider-content">
              <strong>{provider.name}</strong>
              <span>{provider.description}</span>
              <small>{provider.helper}</small>
            </span>
          </label>
        ))}
      </div>

      <div className="panel-actions end">
        <button type="button" className="button primary" onClick={onNext}>
          Next
        </button>
      </div>
    </section>
  );
}

function LoginStep({ provider, onPrev, onNext }) {
  return (
    <section className="flow-panel">
      <div className="panel-copy">
        <p className="eyebrow">Login</p>
        <h1>Login to {provider.name}</h1>
        <p className="lede">
          This static form mirrors the original welcome flow. Submitting it only advances the prototype.
        </p>
      </div>

      <form
        className="login-form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label>
          Email
          <input type="email" placeholder="you@example.com" autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Password" autoComplete="current-password" />
        </label>
        <button type="button" className="oauth-button">
          Continue with Google
        </button>
        <button type="submit" className="button primary full">
          Login
        </button>
      </form>

      <div className="panel-actions split">
        <button type="button" className="button secondary" onClick={onPrev}>
          Back
        </button>
        <button type="button" className="button ghost" onClick={onNext}>
          Skip login
        </button>
      </div>
    </section>
  );
}

function ReadyStep() {
  return (
    <section className="flow-panel ready-panel">
      <img className="ready-logo" src={getAssetUrl("icons/logo-128.png")} alt="" />
      <p className="eyebrow">Ready</p>
      <h1>Happy summarizing!</h1>
      <p className="lede">Open a webpage and click the extension icon to show the ChatGPT Summarize UI clone.</p>
      <div className="panel-actions center">
        <a className="button primary" href="https://wikipedia.org/wiki/ChatGPT" target="_blank" rel="noreferrer">
          Try it now
        </a>
        <a className="button secondary" href="/options/index.html">
          Options
        </a>
      </div>
    </section>
  );
}

function Welcome() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState("chatgpt");
  const provider = useMemo(
    () => providers.find((item) => item.id === selectedProvider) ?? providers[0],
    [selectedProvider]
  );

  return (
    <main className="welcome-shell">
      {currentStep <= 3 && <Stepper currentStep={currentStep} />}

      {currentStep === 1 && <PinStep onNext={() => setCurrentStep(2)} />}
      {currentStep === 2 && (
        <ProviderStep
          selectedProvider={selectedProvider}
          onSelectProvider={setSelectedProvider}
          onNext={() => setCurrentStep(3)}
        />
      )}
      {currentStep === 3 && (
        <LoginStep provider={provider} onPrev={() => setCurrentStep(2)} onNext={() => setCurrentStep(4)} />
      )}
      {currentStep === 4 && <ReadyStep />}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Welcome />);
