# Create a Clone of a Chrome Extension Without Functionality

## Project Overview

This project is a Chrome extension UI clone inspired by the referenced Chrome Web Store extension:

https://chrome.google.com/webstore/detail/chatgpt-%C2%BB-summarize-every/cbgecfllfhmmnknmamkejadjmnmpfjmp

The goal is to recreate the extension setup, page injection behavior, onboarding flow, and visual user interface without implementing the real summarization or AI functionality.

See the implemented feasibility notes and root solution here: [SOLUTION.md](./SOLUTION.md).

## Scope

The extension should provide the general Chrome extension structure and visual experience only. It should look and behave like a polished UI prototype that can later be connected to real functionality.

Required scope:

- Build a Chrome extension using Manifest V3.
- Create a browser action that opens the extension UI on every page.
- Inject the UI into all websites through a content script.
- Build the injected UI with React.
- Render the injected UI consistently across websites.
- Use an iframe-based injection approach so page styles do not affect the extension UI.
- Create an onboarding page that opens the first time the extension is installed.
- Include simple extension interactions needed to show, hide, and display the UI.

## Non-Goals

The following functionality should not be implemented at this stage:

- No real ChatGPT, OpenAI, or AI integration.
- No page summarization.
- No article parsing.
- No backend services.
- No authentication.
- No paid subscription or billing logic.
- No production data storage beyond simple local extension state if needed for UI behavior.

## Technical Requirements

- Chrome Extension Manifest V3 is required.
- React should be used for the UI.
- The content script should inject the React UI into pages.
- The injected UI should appear the same across all websites.
- The preferred implementation is to render the UI inside an iframe.
- The extension should include a first-install onboarding page.
- The project should be organized for ongoing review and continuous GitHub pushes.

## Expected User Flow

1. User installs the extension.
2. The onboarding page opens automatically on first install.
3. User visits any website.
4. User clicks the browser action button.
5. The extension injects or toggles a React-based popup UI on the current page.
6. The popup visually matches the referenced extension but does not perform real summarization.

## Development Notes

This is intended as the foundation for a larger Chrome extension project. The first milestone focuses on extension setup, UI accuracy, content script injection, iframe isolation, and basic interaction behavior.
