# Career Compass AI: Project Overview & Interview Guide

## 1. Project Pitch (The "Elevator Pitch")

**"Career Compass AI is a full-stack, AI-powered web application designed to provide personalized career guidance to students and professionals. It uses Google's Gemini AI models to help users make informed decisions at every stage of their career—from a 10th grader choosing an academic stream to a professional looking to switch industries. The platform features an intelligent career advisor, an AI resume reviewer, a dynamic career dashboard, and a 24/7 chatbot, all built on a modern tech stack using Next.js, React, Tailwind CSS, and Genkit for the AI backend."**

---

## 2. What Problem Does It Solve?

Career navigation is complex and often filled with uncertainty. Students struggle to choose the right academic path, while professionals find it difficult to identify opportunities for growth, upskilling, or career changes. 

Career Compass AI addresses this by replacing generic advice with **data-driven, personalized, and actionable recommendations**. It acts as a personal career counselor that is available anytime, anywhere.

---

## 3. Core Features & How They Work

The application is built around a multi-level user flow, catering to four distinct user groups:

| Feature                   | For Who?                              | How It Works                                                                                                                                                             |
| ------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **AI Stream Selector**    | 10th Grade Students                   | Takes 10th-grade marks as input. An AI model analyzes the scores to recommend the most suitable academic stream (Science, Commerce, Arts) and lists potential career paths.     |
| **AI Degree Recommender** | 12th Grade Students                   | Uses 12th-grade marks and stream to suggest specific degree courses (e.g., B.Tech in CS, B.A. in Psychology).                                                              |
| **UG Career Guide**       | Undergraduate Students                | Analyzes the user's degree, specialization, and skills to recommend suitable entry-level job roles and options for higher studies or certifications.                        |
| **Professional Roadmap**  | Working Professionals                 | Takes work experience and career goals as input to generate a strategic roadmap, suggesting next-level roles, upskilling courses, and potential career switches.             |
| **AI Resume Reviewer**    | Undergraduates & Professionals        | Users upload their resume (PDF/DOCX). The AI provides an **ATS (Applicant Tracking System) score** out of 10 and lists concrete, actionable improvements.                    |
| **Career Dashboard**      | All Users                             | A visual dashboard showing real-time job trends, salary insights, and in-demand skills, filterable by industry and location (currently using mock data).                |
| **AI Career Counselor**   | All Users                             | A 24/7 AI-powered chatbot that answers career-related questions, acting as an instant guidance tool.                                                                     |
| **User Authentication**   | All Users                             | Secure sign-up, sign-in, and forgot password functionality, with user data persisted in the browser's local storage for a seamless experience.                           |

---

## 4. Technical Architecture & Tech Stack

This project is a modern, full-stack web application built with a focus on performance, scalability, and a great user experience.

-   **Frontend**:
    -   **Framework**: **Next.js 15** with the App Router. This enables a fast, server-rendered application.
    -   **Language**: **TypeScript** for type safety and better code quality.
    -   **UI Library**: **React** for building interactive components.
    -   **Styling**: **Tailwind CSS** for utility-first styling, along with **ShadCN/UI** for a pre-built, accessible component library that I customized according to the project's style guidelines.
    -   **State Management**: A combination of React Hooks (`useState`, `useEffect`) and local storage for persisting user session and data.

-   **Backend (AI & Server-Side Logic)**:
    -   **AI Integration**: **Genkit (Google's AI Toolkit)** is used to define and manage all AI-related functionality. This includes creating structured "flows" that call the AI models.
    -   **AI Model**: **Google Gemini (1.5 Pro and 1.5 Flash)** is the core LLM used for generating all recommendations, reviewing resumes, and powering the chatbot. The system is designed to fall back to the faster `Flash` model if the `Pro` model is overloaded, ensuring high availability.
    -   **Server Environment**: The application runs in a **Node.js** environment provided by Next.js, with AI flows defined as server-side actions.

-   **Data Persistence**:
    -   For this prototype, user data (profile information, credentials, form inputs) is stored securely in the **browser's local storage**. This simulates a database-backed application without requiring a full database setup.

---

## 5. How to Explain This Project in an Interview

#### **Step 1: Start with the High-Level Pitch**
Use the pitch from section 1. It's concise and covers the "what" and "why."

> "I developed 'Career Compass AI,' a full-stack, AI-powered career guidance platform using Next.js and Google's Gemini models. The goal was to provide users—from students to professionals—with personalized, actionable career advice, moving beyond generic recommendations."

#### **Step 2: Describe a Key Feature You Built**
Pick one feature and explain it in detail. The **AI Resume Reviewer** is a great example.

> "One of the key features I implemented was the AI Resume Reviewer. A user can upload their resume, and the application's frontend reads the file as a Base64-encoded data URI. This is sent to a server-side Genkit flow I wrote. The flow prompts the Gemini AI model to analyze the resume content against criteria for Applicant Tracking Systems (ATS). The AI then returns a structured JSON object containing an ATS score from 1 to 10 and an array of specific, actionable improvements. The frontend then dynamically renders this feedback, providing immediate value to the user."

#### **Step 3: Detail the Tech Stack and Your Decisions**
Show you made deliberate choices.

> "For the tech stack, I chose Next.js with the App Router for its performance benefits and server-side rendering capabilities. I used TypeScript for its type safety, which is crucial for a project of this scale.
>
> On the backend, I integrated Google's Gemini AI using Genkit. I chose Genkit because it allowed me to define structured, reusable AI flows with strong input and output schemas using Zod. This was critical for ensuring the AI's responses were predictable and could be reliably displayed on the frontend. I also implemented a fallback mechanism in these flows: if the powerful Gemini 1.5 Pro model was rate-limited, the request would automatically retry with the faster Gemini 1.5 Flash model, ensuring the application remained resilient."

#### **Step 4: Mention a Challenge You Overcame**
This demonstrates problem-solving skills.

> "A significant challenge was handling potential API failures, especially rate-limiting from the AI service. Initially, if the API was busy, the application would crash. To solve this, I refactored all my Genkit flows to include robust try-catch blocks. If both the primary and fallback AI models failed, my flow would now catch the final error and return a structured error object to the frontend instead of throwing an exception. On the UI side, I then added logic to detect this error object and display a user-friendly message, significantly improving the application's stability and user experience during high load."
