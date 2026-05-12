import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function askGemini(prompt) {
  if (!apiKey) {
    throw new Error(
      "VITE_GEMINI_API_KEY not found in Vercel Environment Variables."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Stable and widely available model
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}
