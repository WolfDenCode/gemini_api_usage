// Import and setup for Google Generative AI API
import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = ""; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Event listener for Prompt to Text
document.getElementById("text-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const prompt = document.getElementById("text-prompt").value;
  const response = await generateSimpleText(prompt);
  document.getElementById("text-response").innerText = response;
});

// Event listener for Prompt + Image to Text
document.getElementById("image-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const prompt = document.getElementById("image-prompt").value;
  const imageFile = document.getElementById("image-file").files[0];
  const response = await generateTextWithImage(prompt, imageFile);
  document.getElementById("image-response").innerText = response;
});

// Display image preview
document.getElementById("image-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    const imageUrl = await fileToBase64URL(file);
    const imagePreview = document.getElementById("image-preview");
    imagePreview.src = imageUrl;
    imagePreview.style.display = "block";
  }
});

// Handle chat message submission
document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = document.getElementById("chat-input").value;

  // Display user's message
  displayChatMessage("user", userMessage);
  document.getElementById("chat-input").value = "";

  // Send message to model and display response
  const result = await chat.sendMessage(userMessage);
  displayChatMessage("model", result.response.text());
});

// Generate text from text prompt
async function generateSimpleText(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating text:", error);
    return "Failed to generate text.";
  }
}

// Generate text from prompt + image
async function generateTextWithImage(prompt, imageFile) {
  try {
    const imageBase64 = await fileToBase64(imageFile);
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: imageFile.type,
      },
    };
    const result = await model.generateContent([prompt, imagePart]);
    return result.response.text();
  } catch (error) {
    console.error("Error generating text with image:", error);
    return "Failed to generate text with image.";
  }
}

// Chat session initialization
const chat = model.startChat({
  history: [
    { role: "user", parts: [{ text: "Hello" }] },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});
const chatHistoryDiv = document.getElementById("chat-history");

// Function to display chat messages
function displayChatMessage(role, text) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    role === "user" ? "user-message" : "model-message"
  );
  messageElement.innerText = text;
  chatHistoryDiv.appendChild(messageElement);
}

// Display initial chat messages
displayChatMessage("user", "Hello");
displayChatMessage("model", "Great to meet you. What would you like to know?");

// Helper to convert image file to Base64 for the API
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Helper to convert image file to Base64 URL for display
function fileToBase64URL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
