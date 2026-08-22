# Privacy Policy for AI-o-Meter

**Last Updated:** August 22, 2026

## 1. Overview

AI-o-Meter is committed to protecting your privacy. This extension is designed from the ground up to operate **100% locally on your device**. It does not collect, track, transmit, or sell your personal data or browsing activity.

## 2. What Data We Process

- **Webpage Text:** When you navigate to a webpage or open the AI-o-Meter popup, the extension analyzes the visible text of the active tab to calculate heuristic AI content likelihood signals (such as sentence-length variance, vocabulary repetition, and stylistic markers).
- **Domain Name & Word Count:** Extracted locally from the current active tab to display in the extension header.

## 3. How Data Is Stored & Transmitted

- **Zero Remote Transmission:** AI-o-Meter makes **no network requests**, uses no external API endpoints, and transmits zero data to third-party servers or cloud providers. All computation is executed entirely within your local browser runtime.
- **Session Storage:** Computed scores and token counts are stored temporarily in your local browser session storage (`chrome.storage.session`) to cache results across popup views and update the toolbar badge. This data is cleared when you close your browser tab or session.

## 4. Third-Party Services & Analytics

- AI-o-Meter does **not** integrate with any third-party analytics, tracking pixels, telemetry SDKs, or advertising networks.
- No user accounts or authentication are required.

## 5. Permissions Used

- `activeTab` & `<all_urls>`: Enables the extension to access and evaluate the text content of the active article when requested.
- `tabs`: Allows the extension to read the hostname for domain labeling and manage badge indicators per tab.
- `storage`: Enables local session caching of analysis results.
- `scripting`: Serves as a fallback mechanism to safely extract text on dynamically loaded single-page applications.

## 6. Children's Privacy

AI-o-Meter does not knowingly collect or solicit any personal information from children or any other users.

## 7. Changes to This Policy

Any updates to this policy will be reflected in this document and documented in the project's version history on GitHub.

## 8. Contact

If you have questions or feedback regarding this Privacy Policy, please open an issue at:
**[https://github.com/manjunth-r/ai-o-meter/issues](https://github.com/manjunth-r/ai-o-meter/issues)**
