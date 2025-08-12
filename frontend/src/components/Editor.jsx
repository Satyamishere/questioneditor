import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

export default function Editor() {
  const [title, setTitle] = useState("My Quiz");
  const [categories, setCategories] = useState(["Category 1"]);
  const [items, setItems] = useState([{ 
    id: uuidv4(), 
    text: "", 
    correctCategory: "Category 1" 
  }]);
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

  const saveQuestion = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, categories, items }),
      });
      const data = await res.json();
      navigate(`/play/${data._id}`);
    } catch (err) {
      console.error("Error saving question:", err);
      alert("Failed to save question");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-8">
          <label className="block text-lg font-semibold mb-2 text-gray-700">
            Quiz Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter quiz title"
          />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Categories</h2>
            <button
              onClick={addCategory}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Add Category
            </button>
          </div>
          
          <div className="space-y-3">
            {categories.map((cat, i) => (
              <div key={i} className="flex gap-3">
                <input
                  type="text"
                  value={cat}
                  onChange={(e) => updateCategory(i, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`Category ${i + 1}`}
                />
                <button
                  onClick={() => removeCategory(i)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg disabled:bg-gray-400"
                  disabled={categories.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Items</h2>
            <button
              onClick={addItem}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Add Item
            </button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={item.id} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateItem(i, "text", e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter item text"
                />
                <select
                  value={item.correctCategory}
                  onChange={(e) => updateItem(i, "correctCategory", e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeItem(i)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={saveQuestion}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
            disabled={items.length === 0 || categories.length === 0}
          >
            Save & Play
          </button>
        </div>
      </div>
    </div>
  );
}