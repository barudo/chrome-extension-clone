const FRAME_ID = "chatgpt-summarize-ui-clone-frame";
const BUTTON_ID = "chatgpt-summarize-selection-button";
const RUNTIME_ID = chrome.runtime.id;

let frameReady = false;
let pendingPayload = null;

chrome.runtime.onMessage.addListener((message) => {
  if (message?.target !== "chatgpt-summarize-content") return false;

  if (message.type === "TOGGLE_POPUP") {
    togglePopup();
  }

  return false;
});

window.addEventListener("message", (event) => {
  if (event.data?.runtimeId !== RUNTIME_ID) return;

  if (event.data.type === "POPUP_READY") {
    frameReady = true;
    sendPageContext(pendingPayload);
    pendingPayload = null;
  }

  if (event.data.type === "CLOSE_POPUP") {
    hidePopup();
  }

  if (event.data.type === "DRAG_POPUP") {
    moveFrame(event.data.movementX, event.data.movementY);
  }
});

document.addEventListener("mouseup", () => {
  setTimeout(positionSelectionButton, 80);
});

document.addEventListener("keyup", positionSelectionButton);
window.addEventListener("resize", clampFrameToViewport);

function getFrame() {
  return document.getElementById(FRAME_ID);
}

async function ensureFrame(selectedText = "") {
  let frame = getFrame();
  if (frame) return frame;

  await domReady();
  frameReady = false;

  frame = document.createElement("iframe");
  frame.id = FRAME_ID;
  frame.title = "ChatGPT Summarize";
  frame.allow = "clipboard-write";
  frame.src = chrome.runtime.getURL("popup.html");

  Object.assign(frame.style, {
    all: "unset",
    position: "fixed",
    top: "12px",
    right: "12px",
    width: "700px",
    height: "600px",
    maxWidth: "calc(100vw - 24px)",
    maxHeight: "calc(100vh - 24px)",
    display: "none",
    overflow: "hidden",
    background: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.26), 0 0 0 1px rgba(15, 23, 42, 0.08)",
    zIndex: "2147483647"
  });

  document.documentElement.append(frame);
  pendingPayload = getPageContext(selectedText);
  clampFrameToViewport();

  return frame;
}

async function togglePopup() {
  const frame = await ensureFrame();
  const shouldShow = frame.style.display === "none";
  frame.style.display = shouldShow ? "block" : "none";

  if (shouldShow) {
    sendPageContext();
    frame.focus();
  }
}

async function openWithSelection() {
  const selectedText = window.getSelection()?.toString().trim() || "";
  const frame = await ensureFrame(selectedText);
  frame.style.display = "block";
  sendPageContext(getPageContext(selectedText));
  hideSelectionButton();
}

function sendPageContext(payload = getPageContext()) {
  const frame = getFrame();
  if (!frame || !frameReady) {
    pendingPayload = payload;
    return;
  }

  frame.contentWindow?.postMessage(
    {
      type: "PAGE_CONTEXT",
      runtimeId: RUNTIME_ID,
      data: payload
    },
    "*"
  );
}

function hidePopup() {
  const frame = getFrame();
  if (frame) frame.style.display = "none";
}

function getPageContext(selectedText = "") {
  const text = selectedText || getMainText();
  return {
    title: document.title || "Untitled page",
    url: location.href,
    lang: document.documentElement.lang || navigator.language || "en",
    selectedText,
    textPreview: text.slice(0, 1600),
    wordCount: text ? text.trim().split(/\s+/).length : 0
  };
}

function getMainText() {
  const main = document.querySelector("article, main") || document.body;
  return main?.innerText?.replace(/\s+/g, " ").trim() || "";
}

function moveFrame(movementX = 0, movementY = 0) {
  const frame = getFrame();
  if (!frame) return;

  const rect = frame.getBoundingClientRect();
  frame.style.left = `${rect.left + movementX}px`;
  frame.style.top = `${rect.top + movementY}px`;
  frame.style.right = "auto";
  clampFrameToViewport();
}

function clampFrameToViewport() {
  const frame = getFrame();
  if (!frame) return;

  const rect = frame.getBoundingClientRect();
  const nextLeft = Math.min(Math.max(rect.left, 8), Math.max(8, window.innerWidth - rect.width - 8));
  const nextTop = Math.min(Math.max(rect.top, 8), Math.max(8, window.innerHeight - rect.height - 8));

  frame.style.left = `${nextLeft}px`;
  frame.style.top = `${nextTop}px`;
  frame.style.right = "auto";
}

function positionSelectionButton() {
  const selection = window.getSelection();
  const text = selection?.toString().trim() || "";

  if (text.length < 80 || !selection?.rangeCount) {
    hideSelectionButton();
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const button = ensureSelectionButton();

  Object.assign(button.style, {
    display: "grid",
    left: `${rect.left + window.scrollX}px`,
    top: `${rect.bottom + window.scrollY + 8}px`
  });
}

function ensureSelectionButton() {
  let button = document.getElementById(BUTTON_ID);
  if (button) return button;

  button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.textContent = "Summarize";
  button.addEventListener("click", openWithSelection);

  Object.assign(button.style, {
    position: "absolute",
    display: "none",
    placeItems: "center",
    height: "34px",
    padding: "0 13px",
    border: "0",
    borderRadius: "999px",
    background: "#10a37f",
    color: "#ffffff",
    font: "600 13px/1 Arial, sans-serif",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.2)",
    cursor: "pointer",
    zIndex: "2147483646"
  });

  document.documentElement.append(button);
  return button;
}

function hideSelectionButton() {
  const button = document.getElementById(BUTTON_ID);
  if (button) button.style.display = "none";
}

function domReady() {
  if (document.body || document.documentElement) return Promise.resolve();

  return new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", resolve, { once: true });
  });
}
