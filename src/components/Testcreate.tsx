// src/components/TestCreate.tsx
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Question = {
  questionText: string;
  options: string[]; // length 4
  correctAnswer: number; // 0..3
  explanation?: string;
};

type Category = { _id: string; name: string };

export default function TestCreate() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number>(20); // minutes
  const [marksCorrect, setMarksCorrect] = useState<number>(1);
  const [marksWrong, setMarksWrong] = useState<number>(0); // teacher may put 1 or -1; server will normalize
  const [marksUnanswered, setMarksUnanswered] = useState<number>(0);

  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    }
  ]);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await axios.get("/api/categories");
        if (res.data?.success) {
          setCategories(res.data.data || []);
          if (res.data.data?.length) setCategory(res.data.data[0]._id);
        } else {
          setError("Failed to load categories");
        }
      } catch (err) {
        console.error(err);
        setError("Network error while loading categories");
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  function updateQuestion(index: number, newQ: Partial<Question>) {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...newQ };
      return copy;
    });
  }

  function updateOption(qIndex: number, optIndex: number, value: string) {
    setQuestions(prev => {
      const copy = [...prev];
      const opts = [...copy[qIndex].options];
      opts[optIndex] = value;
      copy[qIndex] = { ...copy[qIndex], options: opts };
      return copy;
    });
  }

  function addQuestion() {
    setQuestions(prev => [
      ...prev,
      { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
    ]);
  }

  function removeQuestion(index: number) {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  }

  function validateForm() {
    setError(null);

    if (!title.trim()) return "Title is required";
    if (!category) return "Category is required";
    if (!Number.isFinite(duration) || duration <= 0) return "Duration must be a positive number";
    if (!Array.isArray(questions) || questions.length < 1) return "Add at least 1 question";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || q.questionText.trim().length < 3) return `Question ${i + 1}: text too short`;
      if (!Array.isArray(q.options) || q.options.length !== 4) return `Question ${i + 1}: requires 4 options`;
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || q.options[j].trim() === "") return `Question ${i + 1}: option ${j + 1} is empty`;
      }
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) return `Question ${i + 1}: choose the correct option`;
    }

    // marks may be any number; warn but allow if wrong is positive
    if (!Number.isFinite(marksCorrect)) return "Marks for correct must be a number";
    if (!Number.isFinite(marksWrong)) return "Marks for wrong must be a number";
    if (!Number.isFinite(marksUnanswered)) return "Marks for unanswered must be a number";

    return null;
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const vErr = validateForm();
    if (vErr) {
      setError(vErr);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        duration: Number(duration),
        marks: {
          correct: Number(marksCorrect),
          wrong: Number(marksWrong),
          unanswered: Number(marksUnanswered)
        },
        questions: questions.map(q => ({
          questionText: q.questionText.trim(),
          options: q.options.map(o => o.trim()),
          correctAnswer: Number(q.correctAnswer),
          explanation: q.explanation?.trim() || ""
        }))
      };

      const res = await axios.post("/api/test", payload);
      if (res.data?.success) {
        setSuccessMsg("Test created successfully");
        // small delay then redirect to tests list
        setTimeout(() => router.push("/admin/tests"), 900);
      } else {
        setError(res.data?.error || res.data?.message || "Creation failed");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Network/server error";
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Test</h2>

      {error && <div className="mb-3 text-sm text-red-600 font-medium">{error}</div>}
      {successMsg && <div className="mb-3 text-sm text-green-600 font-medium">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 input w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium">Category</label>
            {loadingCategories ? (
              <div className="mt-1">Loading...</div>
            ) : (
              <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 input w-full">
                <option value="">-- select category --</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Duration (minutes)</label>
            <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="mt-1 input w-full" min={1} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Description (optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 textarea w-full" rows={3}></textarea>
        </div>

        <div className="p-3 border rounded">
          <h4 className="font-semibold mb-2">Marks configuration</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm">Correct (+)</label>
              <input type="number" value={marksCorrect} onChange={e => setMarksCorrect(Number(e.target.value))} className="mt-1 input w-full" />
              <p className="text-xs text-muted-foreground mt-1">Marks awarded for a correct answer.</p>
            </div>
            <div>
              <label className="text-sm">Wrong (penalty)</label>
              <input type="number" value={marksWrong} onChange={e => setMarksWrong(Number(e.target.value))} className="mt-1 input w-full" />
              <p className="text-xs text-muted-foreground mt-1">Enter positive or negative. Server will treat as negative penalty.</p>
            </div>
            <div>
              <label className="text-sm">Unanswered</label>
              <input type="number" value={marksUnanswered} onChange={e => setMarksUnanswered(Number(e.target.value))} className="mt-1 input w-full" />
              <p className="text-xs text-muted-foreground mt-1">Marks for unanswered question (usually 0).</p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Questions ({questions.length})</h4>
            <div className="flex gap-2">
              <button type="button" onClick={addQuestion} className="btn-sm btn">+ Add question</button>
              <button type="button" onClick={() => { if (confirm("Clear all questions?")) setQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }]); }} className="btn-ghost btn-sm">Clear</button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div className="font-medium">Q{qi + 1}</div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => removeQuestion(qi)} className="btn-ghost btn-sm">Remove</button>
                  </div>
                </div>

                <div className="mt-2">
                  <input value={q.questionText} onChange={e => updateQuestion(qi, { questionText: e.target.value })} placeholder="Question text" className="input w-full" />
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correctAnswer === oi}
                        onChange={() => updateQuestion(qi, { correctAnswer: oi })}
                      />
                      <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} className="input w-full" />
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  <input value={q.explanation} onChange={e => updateQuestion(qi, { explanation: e.target.value })} placeholder="Explanation (optional)" className="input w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" onClick={handleSubmit} disabled={submitting} className="btn">
            {submitting ? "Creating..." : "Create Test"}
          </button>
          <button type="button" onClick={() => router.push("/admin/tests")} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
 