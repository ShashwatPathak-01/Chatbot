import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

const app = express();
app.use(express.json());

// Serve static files (index.html, chat.js, style.css) from this folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Health check (optional)
app.get("/health", (_req, res) => res.send("ok"));

// Chat endpoint
app.post("/gemini", async (req, res) => {
  try {
    const prompt = (req.body?.prompt ?? "").toString().trim();
    if (!prompt) {
      return res.status(400).send("Empty prompt.");
    }

    const result = await model.generateContent(prompt);
    const text = result.response?.text?.() ?? "";

    if (!text) {
      return res.status(502).send("No response from model.");
    }

    res.send(text);
  } catch (err) {
    console.error("Gemini error:", err?.message || err);
    res.status(500).send("Server error talking to Gemini.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
