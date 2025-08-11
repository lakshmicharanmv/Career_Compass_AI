# Career Compass AI

## 1. Project Overview

**Career Compass AI** is a full-stack, AI-powered web application designed to provide personalized career guidance to students and professionals. It uses Google's Gemini AI models to help users make informed decisions at every stage of their career—from a 10th grader choosing an academic stream to a professional looking to switch industries. The platform features an intelligent career advisor, an AI resume reviewer, a dynamic career dashboard, and a 24/7 chatbot, all built on a modern tech stack using Next.js, React, Tailwind CSS, and Genkit for the AI backend.

---

## 2. Core Features

-   **AI Stream Selector**: Recommends academic streams for 10th-grade students based on their marks.
-   **AI Degree Recommender**: Suggests degree courses for 12th-grade students.
-   **Undergraduate & Professional Guidance**: Provides tailored advice on job roles, upskilling, and career switches.
-   **AI Resume Reviewer**: Analyzes resumes, provides an ATS score, and suggests actionable improvements.
-   **Career Dashboard**: Visualizes job trends, salary insights, and in-demand skills with mock data.
-   **AI Career Counselor**: A 24/7 chatbot for instant career-related answers.
-   **User Authentication**: Secure sign-up and sign-in functionality with data persisted in the browser's local storage.
-   **AI Resume Builder**: Autofills user data and enhances it with AI to generate a professional, single-page PDF resume.

---

## 3. Technical Architecture & Tech Stack

-   **Frontend**:
    -   **Framework**: **Next.js 15** (App Router)
    -   **Language**: **TypeScript**
    -   **UI**: **React**, **ShadCN/UI**, and **Tailwind CSS**
-   **Backend (AI & Server-Side Logic)**:
    -   **AI Toolkit**: **Genkit** (A Google AI Toolkit for Firebase)
    -   **AI Model**: **Google Gemini 1.5 Pro & Flash**
    -   **Server Environment**: **Node.js** (via Next.js)
-   **Data Persistence**:
    -   The application uses the browser's **local storage** to simulate a database for user data, allowing for rapid prototyping without a full backend setup.

---

## 4. Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en) (v20 or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a `.env` file in the root of the project by copying the `.env.example` file.
    -   ```bash
        cp .env.example .env
        ```
    -   Add your Google Gemini API key to the `.env` file:
        ```env
        GEMINI_API_KEY=your_google_gemini_api_key_here
        ```
    -   You can get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

This project consists of two main parts: the Next.js frontend application and the Genkit AI services backend. Both need to be running simultaneously.

1.  **Start the Genkit AI Services:**
    Open a terminal and run the following command to start the Genkit development server. This server handles all the AI-related tasks.

    ```bash
    npm run genkit:watch
    ```
    This will start the Genkit flows and watch for any changes in the `src/ai/flows/` directory.

2.  **Start the Next.js Frontend:**
    Open a *second* terminal and run the following command to start the Next.js development server.

    ```bash
    npm run dev
    ```

3.  **Access the application:**
    Once both servers are running, you can access the application in your browser at [http://localhost:9002](http://localhost:9002).

---

## 5. Available Scripts

-   `npm run dev`: Starts the Next.js frontend development server.
-   `npm run genkit:dev`: Starts the Genkit AI services.
-   `npm run genkit:watch`: Starts the Genkit AI services in watch mode.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the codebase.
