# AI-Powered-Code-Reviewer

🚀 Project Overview
The AI-Powered Code Quality Analyzer is a single-page web application designed to perform rigorous, objective code reviews instantly. It leverages the power of the Google Gemini API to analyze code snippets (with a strong focus on C, Java, and Python) and returns structured, actionable feedback, transforming a conversational AI model into a dependable engineering tool.

This project showcases expertise in full-stack architecture, advanced API integration, Generative AI engineering, and front-end data visualization.

✨ Core Features
Structured Output via Gemini API: Utilizes the Gemini API's responseSchema feature to enforce a strict JSON output format. This ensures all reviews are reliable and predictable, providing objective data rather than free-form text.

Expert Review Persona: The model is guided by a specific system instruction, adopting the persona of a Senior Software Engineer to deliver high-quality, professional feedback covering critical areas.

Categorized Analysis: Provides distinct analysis sections for:

🚨 Critical Bugs Found

🔒 Security Risks (e.g., potential SQL Injection, buffer overflow risks)

✨ Refactoring & Optimization Suggestions

Visualized Quality Score: Calculates and displays a Readability Score (out of 10) for quick assessment.

Responsive Front-End: Built with HTML, JavaScript, and Tailwind CSS for a professional, adaptive user interface.

🛠️ Technologies Used
Front-End: HTML5, Vanilla JavaScript, Tailwind CSS (for styling)

AI Integration: Google Gemini API (gemini-2.5-flash-preview-05-20)

Core Concept: API Structured Output (JSON Schema Enforcement)

⚙️ Setup and Installation
To run this application outside of the development environment, you need your own Gemini API key.

1. Get Your API Key
  Navigate to Google AI Studio and generate a new API Key.

  Copy the key securely.

2. Configure the Application
  Open the ai_code_reviewer.html file.

  Locate the following line in the <script> block (around line 180):

  const apiKey = "YOUR_API_KEY_HERE"; 

  Replace "YOUR_API_KEY_HERE" with the key you copied in Step 1.

3. Run Locally
  Save the file.

  Open ai_code_reviewer.html in your web browser.

💻 Usage
Select the Code Language (e.g., Java or C).

Paste the code snippet you wish to review into the text area.

Click the Run AI Review button.

The output panel will display the structured review, score, and categorized suggestions.
