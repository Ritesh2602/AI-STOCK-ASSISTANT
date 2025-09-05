// src/test-ai.js
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CohereClient } from "cohere-ai";
import fetch from "node-fetch"; // not needed if Node 18+

dotenv.config({ path: ".env.local" });

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent("Hello from Gemini test!");
    console.log("✅ Gemini Response:", result.response.text());
  } catch (err) {
    console.error("❌ Gemini Error:", err.message);
  }
}

async function testCohere() {
  try {
    const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
    const response = await cohere.generate({
      model: "command-xlarge",
      prompt: "Hello from Cohere test!",
    });
    console.log("✅ Cohere Response:", response.generations[0].text);
  } catch (err) {
    console.error("❌ Cohere Error:", err.message);
  }
}

async function testHF() {
  try {
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "The stock market is looking very volatile today.",
        }),
      }
    );

    if (!hfRes.ok) {
      throw new Error(await hfRes.text());
    }

    const data = await hfRes.json();
    console.log("✅ Hugging Face Response:", data[0]?.summary_text || data);
  } catch (err) {
    console.error("❌ Hugging Face Error:", err.message);
  }
}

async function runAllTests() {
  await testGemini();
  await testCohere();
  await testHF();
}

runAllTests();
