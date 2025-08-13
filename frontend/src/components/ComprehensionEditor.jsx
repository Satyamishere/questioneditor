import React from "react";

export default function ComprehensionEditor({ q, qIdx, updateQuestion }) {
  // Ensure options and correctAnswers are always arrays
  const options = q.options || [];
  const correctAnswers = q.correctAnswers || [];

  const updateOption = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    updateQuestion(qIdx, "options", newOptions);
  };

  const addOption = () => {
    updateQuestion(qIdx, "options", [...options, ""]);
  };

  const removeOption = (idx) => {
    const newOptions = options.filter((_, i) => i !== idx);
    updateQuestion(qIdx, "options", newOptions);
    // Also remove from correctAnswers if present
    updateQuestion(qIdx, "correctAnswers", correctAnswers.filter(i => i !== idx));
  };

  const toggleCorrect = (idx) => {
    if (correctAnswers.includes(idx)) {
      updateQuestion(qIdx, "correctAnswers", correctAnswers.filter(i => i !== idx));
    } else {
      updateQuestion(qIdx, "correctAnswers", [...correctAnswers, idx]);
    }
  };

  return (
    <div className="mb-4">
      <div className="mb-2 font-semibold">Passage:</div>
      <textarea
        className="w-full border rounded p-2 mb-4"
        rows={3}
        value={q.passage || ""}
        onChange={e => updateQuestion(qIdx, "passage", e.target.value)}
        placeholder="Enter passage text..."
      />
      <div className="mb-2 font-semibold">Options:</div>
      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2 mb-2">
          <input
            type="text"
            className="border rounded p-2 flex-1"
            value={opt}
            onChange={e => updateOption(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
          />
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={correctAnswers.includes(idx)}
              onChange={() => toggleCorrect(idx)}
            />
            Correct
          </label>
          <button type="button" className="text-red-500" onClick={() => removeOption(idx)}>&times;</button>
        </div>
      ))}
      <button type="button" className="bg-blue-100 text-blue-700 px-2 rounded" onClick={addOption}>+ Add Option</button>
    </div>
  );
}
