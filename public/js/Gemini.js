import { toBase64 } from "./utils.js";

/**
 * Creates and injects the Gemini chat modal into the page, and sets up its event listeners.
 * This function is called once by main.js when the application starts.
 */
export function setupGeminiChat() {
    // Prevent creating the modal more than once
    if (document.getElementById('gemini-chat-modal')) return;

    const modalHTML = `
        <div class="modal-content flex flex-col h-[80vh] w-full p-0" style="max-width: 47vw;">
            <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-bold text-gray-800">🤖 Gemini AI Chat</h2>
                <button class="modal-close-btn text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div id="chat-messages" class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                <!-- Chat messages will be appended here -->
                <div class="bg-gray-200 text-gray-800 self-start rounded-lg px-4 py-2 max-w-xs">
                    שלום! איך אני יכול לעזור בתכנון הטיול שלכם היום?
                </div>
            </div>
            <div class="p-4 border-t border-gray-200 flex gap-2">
                <input id="chat-input" type="text" placeholder="שאלו אותי כל דבר..." 
                    class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <button id="chat-send-btn" class="bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg px-6 py-2 transition-colors">שלח</button>
            </div>
        </div>
    `;

    const modalContainer = document.getElementById('gemini-chat-modal');
    if (modalContainer) {
        modalContainer.innerHTML = modalHTML;

        // --- Event Listeners for the Chat ---
        const sendBtn = document.getElementById('chat-send-btn');
        const input = document.getElementById('chat-input');

        sendBtn.addEventListener('click', handleSendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }
}

/**
 * Handles the logic for sending a message from the chat UI.
 */
async function handleSendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    addChatMessage(text, "user");
    
    // Save user message to Firebase
    const userMessageData = {
        type: 'user',
        content: text,
        timestamp: Date.now(),
        chatType: 'gemini'
    };
    
    // Update local state
    if (!window.currentData) window.currentData = { geminiChatMessages: [] };
    if (!window.currentData.geminiChatMessages) window.currentData.geminiChatMessages = [];
    window.currentData.geminiChatMessages.push(userMessageData);
    
    // Save to Firebase for persistence
    try {
        const { doc, updateDoc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
        const publicDataRef = doc(window.db, `artifacts/${window.appId}/public/genevaGuide`);
        await updateDoc(publicDataRef, { 
            geminiChatMessages: arrayUnion(userMessageData)
        });
    } catch (error) {
        console.warn('Failed to save Gemini user message to Firebase:', error);
    }
    
    input.value = "";
    input.focus();

    // Show a thinking indicator
    const thinkingIndicator = addChatMessage('<div class="loader-small mx-auto"></div>', "bot");

    try {
        const botReply = await callGeminiWithParts([{ text: text }]);
        // Remove thinking indicator and add the real reply
        thinkingIndicator.remove();
        addChatMessage(botReply, "bot");
        
        // Save bot response to Firebase
        const botMessageData = {
            type: 'bot',
            content: botReply,
            timestamp: Date.now(),
            chatType: 'gemini'
        };
        
        // Update local state
        window.currentData.geminiChatMessages.push(botMessageData);
        
        // Save to Firebase for persistence
        try {
            const { doc, updateDoc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
            const publicDataRef = doc(window.db, `artifacts/${window.appId}/public/genevaGuide`);
            await updateDoc(publicDataRef, { 
                geminiChatMessages: arrayUnion(botMessageData)
            });
        } catch (error) {
            console.warn('Failed to save Gemini bot message to Firebase:', error);
        }
        
    } catch (err) {
        thinkingIndicator.remove();
        addChatMessage(`⚠️ שגיאה: ${err.message}`, "bot");
    }
}

/**
 * Helper function to add a new message bubble to the chat window.
 * @param {string} html The HTML content of the message.
 * @param {string} sender 'user' or 'bot'.
 * @returns {HTMLElement} The created message element.
 */
function addChatMessage(html, sender = "user") {
    const messagesContainer = document.getElementById('chat-messages');
    const bubble = document.createElement("div");
    bubble.className = sender === "user"
        ? "bg-teal-500 text-white self-end rounded-lg px-4 py-2 max-w-md ml-auto shadow-sm"
        : "bg-gray-200 text-gray-800 self-start rounded-lg px-4 py-2 max-w-md shadow-sm";
    
    bubble.innerHTML = html; // Use innerHTML to allow for things like loaders
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return bubble;
}

/**
 * The core function for calling the Gemini API via the secure serverless proxy.
 * @param {Array<Object>} parts An array of parts (text and/or inline image data).
 * @returns {Promise<string>} The raw text response from the API.
 */
export async function callGeminiWithParts(parts) {
    try {
        // Ensure parts is properly formatted for Gemini API
        const formattedParts = Array.isArray(parts) 
            ? parts.map(part => typeof part === 'string' ? { text: part } : part)
            : [{ text: parts }];
            
        console.log("🤖 Sending request to Gemini API:", { contents: [{ role: "user", parts: formattedParts }] });
        
        const response = await fetch("/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: formattedParts }] }),
            signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `שגיאה ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("🤖 Gemini API response:", data);
        
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!responseText) {
            console.warn("Empty response from Gemini API:", data);
            throw new Error("ה-AI לא החזיר תגובה תקינה.");
        }
        
        console.log("🤖 Extracted response text:", responseText);
        return responseText;
    } catch (err) {
        console.warn("Error in callGeminiWithParts:", err);
        
        // More specific error messages
        if (err.name === 'AbortError') {
            throw new Error("הבקשה לקחה יותר מדי זמן. נסו שוב.");
        } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
            throw new Error("בעיית חיבור לאינטרנט. בדקו את החיבור ונסו שוב.");
        }
        
        throw err;
    }
}

/**
 * A robust utility to extract a JSON object from a raw string response from an LLM.
 * It handles cases where the JSON is wrapped in markdown code fences or has extraneous text.
 * @param {string} text The raw text from the AI.
 * @returns {object} The parsed JSON object.
 * @throws {Error} If no valid JSON can be extracted.
 */
export function extractJsonFromText(text) {
    // Attempt to find JSON within markdown ```json ... ``` blocks
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = match ? match[1] : text;

    try {
        // Attempt to parse the extracted (or original) string
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn("Failed to parse JSON from AI response:", text);
        throw new Error("The AI response did not contain valid JSON.");
    }
}

/**
 * Creates a formatted prompt to find new activities for the trip.
 * @param {Array<string>} existingActivities An array of existing activity names to avoid duplication.
 * @returns {string} The formatted prompt.
 */
export function createActivityPrompt(existingActivities) {
    const existingList = existingActivities.join(', ');
    return `Generate a JSON array of 3-5 new family-friendly activities in Geneva, Switzerland, that are not on this list: ${existingList}. Each object must have keys: 'name' (string), 'description' (string), 'category' (string), and 'time' (number in minutes from city center). The category must be one of: 'משחקייה', 'תרבות', 'קפה', 'חוץ'. ONLY return the JSON array, with no other text.`;
}

/**
 * Creates a formatted prompt for generating smart packing list suggestions.
 * @param {Object} packingListData The user's current packing list data.
 * @returns {string} The formatted prompt.
 */
export function createPackingPrompt(packingListData) {
    const listJson = JSON.stringify(packingListData, null, 2);
    return `Analyze the following packing list for a family trip to Geneva with toddlers: ${listJson}. Suggest 3-5 new, essential items to add. Return a response in JSON format. The JSON must be an object where keys are categories and values are arrays of item names. Example: {"clothing": ["rain jacket", "extra socks"]}. ONLY return the JSON object, with no other text.`;
}

/**
 * Analyzes two images (a suitcase and items) and returns a packing suggestion.
 * @param {File} suitcaseFile Image of the suitcase.
 * @param {File} itemsFile Image of the items to be packed.
 * @returns {Promise<string>} The packing suggestion text from Gemini.
 */
export async function analyzePackingImages(suitcaseFile, itemsFile) {
    const [suitcaseBase64, itemsBase64] = await Promise.all([
        toBase64(suitcaseFile),
        toBase64(itemsFile)
    ]);

    const prompt = "Analyze the packing efficiency of the items in the suitcase. Are there any essential items missing for a family trip with toddlers to Geneva in August? Provide a summary and a bulleted list of suggestions. Respond in Hebrew.";

    const parts = [
        { text: prompt },
        { inlineData: { mimeType: suitcaseFile.type, data: suitcaseBase64 } },
        { inlineData: { mimeType: itemsFile.type, data: itemsBase64 } },
    ];

    return callGeminiWithParts(parts);
}

