// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// ================= Serve default index.html =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ================= OpenAI client =================
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ================= Rewrite hazard description =================
app.post("/rewrite-description", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: "Description is required" });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an assistant that rewrites hazard reports to make them clearer and professional.",
        },
        {
          role: "user",
          content: `Rewrite this hazard report description: ${description}`,
        },
      ],
      max_tokens: 150,
    });

    const aiSuggestion = response.choices[0].message.content.trim();
    res.json({ suggestion: aiSuggestion });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate suggestion" });
  }
});

// ================= Translate hazard description using OpenAI =================
app.post("/translate", async (req, res) => {
  try {
    const { text, target } = req.body;
    if (!text || !target) return res.status(400).json({ error: "Text and target language required" });

    // Map language codes to full names for OpenAI
    const languageMap = {
      af: "Afrikaans",
      en: "English",
      xh: "isiXhosa",
      zu: "isiZulu",
      st: "Sesotho",
      tn: "Setswana",
      ve: "Tshivenda",
      ts: "Xitsonga",
      ss: "siSwati",
      nr: "isiNdebele",
    };

    const targetLanguage = languageMap[target] || "English";

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that translates text accurately into the requested language.",
        },
        {
          role: "user",
          content: `Translate the following text into ${targetLanguage}:\n\n${text}`,
        },
      ],
      max_tokens: 300,
    });

    const translatedText = response.choices[0].message.content.trim();
    res.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

// ================= Start server =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
