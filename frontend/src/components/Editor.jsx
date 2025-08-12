
import { useState } from "react";
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

  // Helper to handle image upload as base64
  const handleHeaderImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setHeaderImage(reader.result);
    reader.readAsDataURL(file);
  };

  // Add, update, remove question logic (for multiple question types)
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
    newQuestions[index][field] = value;
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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-8">
          <label className="block text-lg font-semibold mb-2 text-gray-700">Form Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter form title"
          />
        </div>
        <div className="mb-8">
          <label className="block text-lg font-semibold mb-2 text-gray-700">Header Image</label>
          <input type="file" accept="image/*" onChange={handleHeaderImage} />
          {headerImage && <img src={headerImage} alt="Header Preview" className="mt-2 max-h-40" />}
        </div>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Questions</h2>
            <button
              onClick={addQuestion}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Add Question
            </button>
          </div>
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div key={q.id} className="border p-4 rounded-lg bg-gray-50">
                <div className="flex gap-3 mb-2">
                  <select
                    value={q.type}
                    onChange={e => updateQuestion(qIdx, "type", e.target.value)}
                    className="border rounded-lg p-2"
                  >
                    <option value="categorize">Categorize</option>
                    <option value="cloze">Cloze</option>
                    <option value="comprehension">Comprehension</option>
                  </select>
                  <input
                    type="text"
                    value={q.text}
                    onChange={e => updateQuestion(qIdx, "text", e.target.value)}
                    className="flex-1 border rounded-lg p-2"
                    placeholder="Question text"
                  />
                  <input type="file" accept="image/*" onChange={e => handleQuestionImage(qIdx, e)} />
                  {q.image && <img src={q.image} alt="Q" className="max-h-12" />}
                  <button onClick={() => removeQuestion(qIdx)} className="bg-red-600 text-white px-2 rounded-lg">Remove</button>
                </div>
                {/* Render question-type-specific fields here (for brevity, only categorize shown) */}
                {q.type === "categorize" && (
                  <div>
                    <div className="flex gap-2 mb-2">
                      {q.categories.map((cat, cIdx) => (
                        <input
                          key={cIdx}
                          type="text"
                          value={cat}
                          onChange={e => {
                            const newCats = [...q.categories];
                            newCats[cIdx] = e.target.value;
                            updateQuestion(qIdx, "categories", newCats);
                          }}
                          className="border rounded-lg p-1"
                          placeholder={`Category ${cIdx + 1}`}
                        />
                      ))}
                      <button onClick={() => {
                        const newCats = [...q.categories, `Category ${q.categories.length + 1}`];
                        updateQuestion(qIdx, "categories", newCats);
                      }} className="bg-green-600 text-white px-2 rounded-lg">Add Category</button>
                    </div>
                    <div className="space-y-2">
                      {q.items.map((item, iIdx) => (
                        <div key={item.id} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={item.text}
                            onChange={e => {
                              const newItems = [...q.items];
                              newItems[iIdx].text = e.target.value;
                              updateQuestion(qIdx, "items", newItems);
                            }}
                            className="flex-1 border rounded-lg p-1"
                            placeholder="Item text"
                          />
                          <select
                            value={item.correctCategory}
                            onChange={e => {
                              const newItems = [...q.items];
                              newItems[iIdx].correctCategory = e.target.value;
                              updateQuestion(qIdx, "items", newItems);
                            }}
                            className="border rounded-lg p-1"
                          >
                            {q.categories.map((cat, idx) => (
                              <option key={idx} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <button onClick={() => {
                            const newItems = q.items.filter((_, idx) => idx !== iIdx);
                            updateQuestion(qIdx, "items", newItems);
                          }} className="bg-red-600 text-white px-2 rounded-lg">×</button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const newItems = [...q.items, { id: uuidv4(), text: "", correctCategory: q.categories[0] }];
                        updateQuestion(qIdx, "items", newItems);
                      }} className="bg-blue-600 text-white px-2 rounded-lg">Add Item</button>
                    </div>
                  </div>
                )}
                {/* TODO: Add UI for cloze and comprehension types */}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={saveForm}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
            disabled={questions.length === 0}
          >
            Save & Play
          </button>
        </div>
      </div>
    </div>
  );
}