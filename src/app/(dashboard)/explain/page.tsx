"use client";

import { useState } from "react";

export default function ExplainConcept() {
  const [concept, setConcept] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number | null;
  }>({});
  const [showResults, setShowResults] = useState(false);

  const financialConcepts = [
    "Diversification",
    "Compound Interest",
    "Risk Management",
    "Asset Allocation",
    "Inflation",
    "Liquidity",
    "Valuation",
    "Derivatives",
    "Leverage",
    "Time Value of Money",
  ];

  const fetchExplanation = async () => {
    setLoading(true);
    setShowResults(false);
    setSelectedAnswers({});
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept }),
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("❌ Error fetching concept:", err);
      setData(null);
    }
    setLoading(false);
  };

  const handleAnswer = (qIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📘 Learn Financial Concepts</h1>

      {/* Dropdown + Input */}
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <select
          className="p-2 rounded bg-gray-800 border border-gray-700 w-full md:w-auto"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
        >
          <option value="">-- Select a Concept --</option>
          {financialConcepts.map((c, idx) => (
            <option key={idx} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Or type your own concept..."
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700 flex-1"
        />
        <button
          onClick={fetchExplanation}
          disabled={loading || !concept}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded w-full md:w-auto"
        >
          {loading ? "Loading..." : "Explain"}
        </button>
      </div>

      {/* Explanation */}
      {data?.explanation && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">✨ Explanation</h2>
          <p className="text-gray-200 whitespace-pre-line">
            {data.explanation}
          </p>
        </div>
      )}

      {/* Quiz */}
      {data?.quiz && (
        <div className="p-4 bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📝 Quiz</h2>
          {data.quiz.map((q: any, qIndex: number) => (
            <div key={qIndex} className="mb-6">
              <p className="font-medium mb-2">{`Q${qIndex + 1}. ${
                q.question
              }`}</p>
              <div className="space-y-2">
                {q.options.map((opt: string, optIndex: number) => {
                  const isSelected = selectedAnswers[qIndex] === optIndex;
                  const isCorrect = q.correct_answer === optIndex;

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleAnswer(qIndex, optIndex)}
                      className={`w-full text-left p-2 rounded border 
                        ${
                          showResults
                            ? isCorrect
                              ? "bg-green-600 border-green-400"
                              : isSelected
                              ? "bg-red-600 border-red-400"
                              : "bg-gray-700 border-gray-600"
                            : isSelected
                            ? "bg-blue-600 border-blue-400"
                            : "bg-gray-700 border-gray-600"
                        }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!showResults && (
            <button
              onClick={handleSubmitQuiz}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Submit Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}
