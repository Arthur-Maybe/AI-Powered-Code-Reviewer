document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('review-form');
    const codeInput = document.getElementById('code-input');
    const langSelect = document.getElementById('language-select');
    const submitButton = document.getElementById('submit-button');
    const outputDiv = document.getElementById('review-output');
    const loadingIndicator = document.getElementById('loading-indicator');

    // --- Gemini API Configuration ---
    const MODEL_NAME = 'gemini-2.5-flash-preview-05-20';
    const apiKey = "AIzaSyDitpw8Rlt1n_SApbq48HXAyXwOJPVSFAk";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    // --- 1. Define the Structured JSON Schema (Core requirement for the project) ---
    const RESPONSE_SCHEMA = {
        type: "OBJECT",
        properties: {
            "OverallSummary": { "type": "STRING", "description": "A professional, concise summary of the code quality and overall function." },
            "ReadabilityScore": { "type": "NUMBER", "description": "A score from 1 to 10 (10 being best) assessing code clarity, comments, and style." },
            "BugsFound": { "type": "ARRAY", "items": { "type": "STRING", "description": "Specific, actionable bugs or logic errors found. Use code snippets if necessary." } },
            "RefactoringSuggestions": { "type": "ARRAY", "items": { "type": "STRING", "description": "Suggestions for optimization, performance improvement, or design pattern adherence." } },
            "SecurityRisks": { "type": "ARRAY", "items": { "type": "STRING", "description": "List of potential security vulnerabilities (e.g., SQL injection, buffer overflow, weak input validation)." } }
        },
        required: ["OverallSummary", "ReadabilityScore", "BugsFound", "SecurityRisks", "RefactoringSuggestions"]
    };

    // --- 2. Define the System Instruction ---
    const SYSTEM_INSTRUCTION = `
        You are an expert Senior Software Engineer. Your task is to perform a rigorous, objective code review and return the findings exclusively in the specified JSON format.
        Analyze the code thoroughly for logic errors, adherence to best practices, performance bottlenecks, and security vulnerabilities.
        Do not include any text outside of the JSON object.
    `;
    
    // --- 3. Utility Functions ---

    function setUIState(isLoading) {
        submitButton.disabled = isLoading;
        codeInput.disabled = isLoading;
        loadingIndicator.classList.toggle('hidden', !isLoading);
        submitButton.textContent = isLoading ? 'Analyzing...' : 'Run AI Review';
    }

    // Simple renderer for the JSON output
    function renderReview(reviewData) {
        outputDiv.innerHTML = ''; // Clear previous results

        const scoreColor = reviewData.ReadabilityScore >= 8 ? 'text-green-400' : 
                            reviewData.ReadabilityScore >= 5 ? 'text-yellow-400' : 'text-red-400';
        
        const scoreCard = `
            <div class="bg-gray-800 p-4 rounded-lg shadow-inner">
                <h3 class="text-lg font-semibold text-primary mb-2">Overall Summary</h3>
                <p class="text-base">${reviewData.OverallSummary}</p>
                <div class="mt-3 text-lg font-bold">
                    Readability Score: <span class="${scoreColor}">${reviewData.ReadabilityScore} / 10</span>
                </div>
            </div>
        `;
        outputDiv.insertAdjacentHTML('beforeend', scoreCard);

        const renderList = (title, items, color) => {
            if (items.length === 0) return '';
            return `
                <div class="bg-card-bg p-4 rounded-lg border-l-4 border-${color}-500 shadow-lg">
                    <h3 class="text-lg font-semibold text-${color}-400 mb-2">${title} (${items.length} Found)</h3>
                    <ul class="list-disc list-inside space-y-2 text-gray-300">
                        ${items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        };

        outputDiv.insertAdjacentHTML('beforeend', renderList('🚨 Critical Bugs Found', reviewData.BugsFound, 'red'));
        outputDiv.insertAdjacentHTML('beforeend', renderList('🔒 Security Risks', reviewData.SecurityRisks, 'yellow'));
        outputDiv.insertAdjacentHTML('beforeend', renderList('✨ Refactoring Suggestions', reviewData.RefactoringSuggestions, 'blue'));
        
        // FIX: Changed chatContainer to outputDiv for correct scrolling
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    /**
     * Retries the fetch request with exponential backoff.
     */
    async function retryFetch(apiCall, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await apiCall();
                if (response.ok) {
                    return response;
                } else if (response.status === 429) { // Rate limit
                    await new Promise(resolve => setTimeout(resolve, delay * (2 ** i)));
                } else {
                    throw new Error(`API error: ${response.statusText}`);
                }
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay * (2 ** i)));
            }
        }
    }


    // --- 4. Main Submission Handler ---

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const code = codeInput.value.trim();
        const language = langSelect.value;
        if (!code) return;

        setUIState(true);
        outputDiv.innerHTML = `<div class="p-4 text-center text-gray-500">Starting analysis for ${language}...</div>`;
        
        const userQuery = `Review the following code snippet written in ${language}. Provide a strict, technical analysis based on the required JSON schema:\n\n\`\`\`${language}\n${code}\n\`\`\``;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            },
            systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
            }
        };

        try {
            const apiCall = () => fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const response = await retryFetch(apiCall);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();
            
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!jsonText) {
                    outputDiv.innerHTML = `<div class="bg-red-900/50 p-4 rounded-lg text-red-300">Error: AI returned an empty response. Try simplifying the code.</div>`;
                    return;
            }

            const reviewData = JSON.parse(jsonText);
            renderReview(reviewData);

        } catch (error) {
            console.error("Review Error:", error);
            outputDiv.innerHTML = `<div class="bg-red-900/50 p-4 rounded-lg text-red-300">
                <strong>Review Failed:</strong> Could not process API request or parse JSON.<br>Error: ${error.message}
            </div>`;
        } finally {
            setUIState(false);
        }
    });
    
    // Example Code for quick testing
    codeInput.value = `
public class UserService {
// Finds a user by ID and prints their details. Unsafe.
public void getUserData(String userId) {
String query = "SELECT * FROM users WHERE id = '" + userId + "'";
System.out.println("Executing query: " + query);
// Code to execute query without proper sanitization (simulated SQL injection risk)
if (userId.length() < 5) {
    System.out.println("User ID too short, ignoring.");
}
// Missing error handling and resource cleanup
}
}
    `;
});