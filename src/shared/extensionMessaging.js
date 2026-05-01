export function postToHost(type, data = {}) {
  window.top?.postMessage(
    {
      type,
      runtimeId: chrome.runtime.id,
      ...data
    },
    "*"
  );
}
