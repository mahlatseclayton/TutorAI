# TutorAI Architecture & Communication

This document outlines the project structure and how the different components of TutorAI communicate with each other.

## Project Structure

```text
/TutorAI
  ├── client/               # Frontend (Static Files)
  │   ├── css/              # Stylesheets (Vanilla CSS)
  │   ├── js/               # Frontend Logic & Firebase SDK
  │   ├── images/           # Asset files (Icons, Logos)
  │   └── *.html            # Application pages
  ├── functions/            # Backend (Firebase Cloud Functions)
  │   ├── index.js          # Cloud Function handlers
  │   └── package.json      # Backend dependencies
  ├── server/               # Standalone Server (Future placeholder)
  ├── docs/                 # Project documentation
  ├── firebase.json         # Firebase Configuration
  └── package.json          # Root orchestration
```

## How it Works & Communication

### 1. Frontend (Client)
- **Role**: Handles UI/UX and user interaction.
- **Communication to Backend**:
  - Uses the **Firebase JS SDK** to communicate directly with **Firebase Authentication** and **Cloud Firestore**.
  - Uses the `fetch` API to trigger server-side logic in **Firebase Cloud Functions** (e.g., triggering AI generation or fetching YouTube videos).
- **Hosting**: Served via Firebase Hosting from the `client/` directory.

### 2. Backend (Cloud Functions)
- **Role**: Handles sensitive operations, third-party API keys, and complex logic that shouldn't run on the client.
- **Key Functions**:
  - `topicTutor`: Communicates with Google's Gemini AI to generate educational content.
  - `YT_VIDEOS`: Communicates with the Searlo API to fetch relevant YouTube educational videos.
- **Communication**: Responds to HTTPS requests from the client.

### 3. Server (Optional/Standalone)
- **Role**: Intended for logic that exists "outside" the serverless environment if required for constant polling or specific non-serverless protocols.

## Data Flow Example: Topic Generation
1. User enters a topic in `mainPage.html`.
2. `js/firebase.js` (client) sends a POST request to the `topicTutor` Cloud Function.
3. The Cloud Function calls the Gemini API using an environment secret.
4. Gemini returns JSON content to the Cloud Function.
5. The Cloud Function returns the JSON to the client.
6. `js/firebase.js` parses the JSON and renders it to `solutionPage.html`.
7. `js/firebase.js` also caches the result in Firestore for faster future retrieval.
