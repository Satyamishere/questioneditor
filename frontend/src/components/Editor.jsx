
import React, { useState } from "react";
import ComprehensionEditor from "./ComprehensionEditor";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';


export default function Editor() {
  const [title, setTitle] = useState("My Quiz");
  const [headerImage, setHeaderImage] = useState("");
  const [questions, setQuestions] = useState([
    {
      id: uuidv4(),
      type: "categorize",
      text: "",
      image: "",
      categories: ["Category 1"],
      items: [{ id: uuidv4(), text: "", correctCategory: "Category 1" }],
    },
  ]);
  const navigate = useNavigate();

  const addCategory = () => {
    const newCategory = `Category ${categories.length + 1}`;
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (index, value) => {
    const newCats = [...categories];
    newCats[index] = value;
    setCategories(newCats);
    
    setItems(items.map(item => {
      if (item.correctCategory === categories[index]) {
        return {...item, correctCategory: value};
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { 
      id: uuidv4(), 
      text: "", 
      correctCategory: categories[0] 
    }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const removeCategory = (index) => {
    const catToRemove = categories[index];
    const newCats = categories.filter((_, i) => i !== index);
    setCategories(newCats);
    
    setItems(items.filter(item => item.correctCategory !== catToRemove));
  };

  const handleHeaderImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setHeaderImage(reader.result);
    reader.readAsDataURL(file);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        type: "categorize",
        text: "",
        image: "",
        categories: ["Category 1"],
        items: [{ id: uuidv4(), text: "", correctCategory: "Category 1" }],
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === "type" && value === "cloze") {
      newQuestions[index] = {
        ...newQuestions[index],
        type: "cloze",
        blanks: newQuestions[index].blanks || [],
        options: newQuestions[index].options || [],
      };
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionImage = (qIdx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newQuestions = [...questions];
      newQuestions[qIdx].image = reader.result;
      setQuestions(newQuestions);
    };
    reader.readAsDataURL(file);
  };

  const saveForm = async () => {
    for (const q of questions) {
      if (q.type === 'categorize' && q.items.some(item => !item.text.trim())) {
        alert('All item texts must be filled in for categorize questions.');
        return;
      }
    }
    try {
      const res = await fetch("http://localhost:5000/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, headerImage, questions }),
      });
      const data = await res.json();
      navigate(`/play/${data._id}`);
    } catch (err) {
      console.error("Error saving form:", err);
      alert("Failed to save form");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-pink-100 py-10">
      <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-10 tracking-tight drop-shadow">Custom Form Builder</h1>
  <form className="w-full" onSubmit={e => { e.preventDefault(); saveForm(); }}>
          <div className="mb-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <label className="block text-lg font-bold mb-2 text-gray-700">Form Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-indigo-200 rounded-xl p-3 text-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-indigo-50 shadow-sm"
                placeholder="Enter form title"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-lg font-bold mb-2 text-gray-700">Header Image</label>
              <input type="file" accept="image/*" onChange={handleHeaderImage} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              {headerImage && <img src={headerImage} alt="Header Preview" className="mt-2 max-h-32 rounded-lg border shadow" />}
            </div>
          </div>
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-700">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white px-7 py-2 rounded-xl shadow-lg font-semibold text-lg"
              >
                + Add Question
              </button>
            </div>
            <div className="space-y-10">
              {questions.map((q, qIdx) => (
                <div key={q.id} className="border-2 border-indigo-100 p-6 rounded-2xl bg-indigo-50 shadow-md relative transition-all hover:shadow-xl">
                  <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
                    <select
                      value={q.type}
                      onChange={e => updateQuestion(qIdx, "type", e.target.value)}
                      className="border border-indigo-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-300 font-semibold"
                    >
                      <option value="categorize">Categorize</option>
                      <option value="comprehension">Comprehension</option>
                    </select>
                    <input
                      type="text"
                      value={q.text}
                      onChange={e => updateQuestion(qIdx, "text", e.target.value)}
                      className="flex-1 border border-indigo-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-300"
                      placeholder="Question text"
                      required
                    />
                    <button type="button" onClick={() => removeQuestion(qIdx)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full shadow-lg text-xl">×</button>
                  </div>
                {q.type === "categorize" && (
                  <div className="mb-4">
                    <div className="mb-2 font-semibold">Categories:</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {q.categories.map((cat, catIdx) => (
                        <span key={catIdx} className="flex items-center gap-1">
                          <input
                            type="text"
                            value={cat}
                            onChange={e => {
                              const newCats = [...q.categories];
                              newCats[catIdx] = e.target.value;
                              updateQuestion(qIdx, "categories", newCats);
                            }}
                            className="border rounded p-1"
                          />
                          {q.categories.length > 1 && (
                            <button type="button" onClick={() => {
                              const newCats = q.categories.filter((_, i) => i !== catIdx);
                              updateQuestion(qIdx, "categories", newCats);
                              updateQuestion(qIdx, "items", q.items.filter(item => item.correctCategory !== cat));
                            }} className="text-red-500">×</button>
                          )}
                        </span>
                      ))}
                      <button type="button" onClick={() => {
                        updateQuestion(qIdx, "categories", [...q.categories, `Category ${q.categories.length + 1}`]);
                      }} className="bg-blue-100 text-blue-700 px-2 rounded">+ Add Category</button>
                    </div>
                    <div className="mb-2 font-semibold">Items:</div>
                    <div className="space-y-2 mb-2">
                      {q.items.map((item, itemIdx) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.text}
                            onChange={e => {
                              const newItems = [...q.items];
                              newItems[itemIdx] = { ...item, text: e.target.value };
                              updateQuestion(qIdx, "items", newItems);
                            }}
                            className="border rounded p-1 flex-1"
                            placeholder={`Item ${itemIdx + 1}`}
                          />
                          <select
                            value={item.correctCategory}
                            onChange={e => {
                              const newItems = [...q.items];
                              newItems[itemIdx] = { ...item, correctCategory: e.target.value };
                              updateQuestion(qIdx, "items", newItems);
                            }}
                            className="border rounded p-1"
                          >
                            {q.categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <button type="button" onClick={() => {
                            const newItems = q.items.filter((_, i) => i !== itemIdx);
                            updateQuestion(qIdx, "items", newItems);
                          }} className="text-red-500">×</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        updateQuestion(qIdx, "items", [...q.items, { id: uuidv4(), text: "", correctCategory: q.categories[0] }]);
                      }} className="bg-blue-100 text-blue-700 px-2 rounded">+ Add Item</button>
                    </div>
                  </div>
                )}
                {q.type === "comprehension" && (
                  <ComprehensionEditor q={q} qIdx={qIdx} updateQuestion={updateQuestion} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
            disabled={questions.length === 0}
          >
            Save & Play
          </button>
        </div>
      </form>
    </div>

    </div>
  );
}

