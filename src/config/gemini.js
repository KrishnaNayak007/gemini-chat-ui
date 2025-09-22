// src/config/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Create API client with your key (keep it in .env for security!)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

async function runChat(prompt) {
  try {
    // Use Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Ask the model for content
    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();

    // If it's text
    if (text) {
      return text;
    }

    // If it's image (inlineData)
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && parts[0]?.inlineData) {
      const inlineData = parts[0].inlineData;

      // Convert base64 → Blob → URL for <img src="">
      const binary = atob(inlineData.data);
      const array = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const blob = new Blob([array], { type: inlineData.mimeType });
      const url = URL.createObjectURL(blob);

      return { type: "image", content: url };
    }

    return { type: "unknown", content: null };
  } catch (err) {
    console.error("Gemini error:", err);
    return { type: "error", content: "Something went wrong!" };
  }
}

export default runChat;
