const WELCOME_PAGE = "welcome.html";

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install") return;

  await chrome.storage.local.set({
    installedAt: Date.now(),
    showSelectionButton: true
  });

  await chrome.tabs.create({
    url: chrome.runtime.getURL(WELCOME_PAGE)
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url || !/^https?:\/\//.test(tab.url)) return;

  try {
    await chrome.tabs.sendMessage(tab.id, {
      target: "chatgpt-summarize-content",
      type: "TOGGLE_POPUP"
    });
  } catch {
    await chrome.scripting?.executeScript?.({
      target: { tabId: tab.id },
      files: ["assets/content-script.js"]
    });

    await chrome.tabs.sendMessage(tab.id, {
      target: "chatgpt-summarize-content",
      type: "TOGGLE_POPUP"
    });
  }
});
