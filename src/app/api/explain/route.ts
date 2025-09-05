import { NextResponse } from "next/server";
import { askAI } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { concept } = await req.json();

    if (!concept) {
      return NextResponse.json(
        { success: false, error: "Concept is required" },
        { status: 400 }
      );
    }

    const prompt = `
      You are an API that always responds ONLY in pure JSON.
      No markdown, no code blocks, no explanations.

      Task:
      - Explain the financial concept "${concept}" in an interactive, fun way with examples or analogies.
      - Then create 3 multiple-choice quiz questions.
      
      JSON schema you MUST follow:
      {
        "explanation": "string",
        "quiz": [
          {
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "correct_answer": 0
          }
        ]
      }
    `;

    let aiResponse = await askAI(prompt);

    // 🛠 Sanitize response: remove ```json or ``` wrappers if present
    aiResponse = aiResponse.trim();
    if (aiResponse.startsWith("```")) {
      aiResponse = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    // 🛠 Parse safely
    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      console.error("❌ JSON parse error. Raw AI response:", aiResponse);
      return NextResponse.json(
        {
          success: false,
          error: "AI response was not valid JSON",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      concept,
      explanation: parsed.explanation || "No explanation available.",
      quiz: parsed.quiz || [],
    });
  } catch (err: any) {
    console.error("⚠️ Explain API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
