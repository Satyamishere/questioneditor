
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCorners, DragOverlay } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import DraggableItem from "./SortableItem";
import DroppableCategory from "./DroppableCategory";

export default function Play() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);
  // For drag-and-drop
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/forms/${id}`);
        const data = await res.json();
        setForm(data);
        // Initialize answers for each question
        const initialAnswers = {};
        data.questions.forEach(q => {
          if (q.type === "categorize") {
            // For categorize, map category to item ids
            const catMap = {};
            q.categories.forEach(cat => { catMap[cat] = []; });
            initialAnswers[q._id] = catMap;
          } else if (q.type === "cloze") {
            initialAnswers[q._id] = "";
          } else if (q.type === "comprehension") {
            initialAnswers[q._id] = q.items.map(() => "");
          }
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error("Error fetching form:", err);
      }
    };
    fetchForm();
  }, [id]);

  // ...existing code...

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) {
      setActiveId(null);
      return;
    }
    
    // Find which category the item is currently in (if any)
    let currentCategory = null;
    Object.entries(itemsInCategories).forEach(([cat, items]) => {
      if (items.some(item => item.id === activeId)) {
        currentCategory = cat;
      }
    });

    // If dropping into a category
    if (question.categories.includes(overId)) {
      setItemsInCategories(prev => {
        const newState = { ...prev };
        
        // Remove from current category if it's in one
        if (currentCategory) {
          newState[currentCategory] = newState[currentCategory].filter(item => item.id !== activeId);
        }
        
        // Add to the new category
        const activeItem = question.items.find(item => item.id === activeId);
        if (activeItem) {
          newState[overId] = [...newState[overId], activeItem];
        }
        
        return newState;
      });
    } 
    // If dropping back to items area (overId is not a category)
    else {
      setItemsInCategories(prev => {
        const newState = { ...prev };
        
        // Remove from current category if it's in one
        if (currentCategory) {
          newState[currentCategory] = newState[currentCategory].filter(item => item.id !== activeId);
        }
        
        return newState;
      });
    }
    
    setActiveId(null);
  };



  const handleReset = () => {
    setSubmitted(false);
    setResults(null);
    const resetCategories = {};
    question.categories.forEach(cat => {
      resetCategories[cat] = [];
    });
    setItemsInCategories(resetCategories);
  };

  if (!form) return <div className="text-center py-8">Loading form...</div>;

  const handleCategorizeChange = (qId, cat, itemId, checked) => {
    setAnswers(prev => {
      const newCatMap = { ...prev[qId] };
      if (checked) {
        // Add item to category
        newCatMap[cat] = [...newCatMap[cat], itemId];
      } else {
        // Remove item from category
        newCatMap[cat] = newCatMap[cat].filter(id => id !== itemId);
      }
      return { ...prev, [qId]: newCatMap };
    });
  };

  const handleClozeChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleComprehensionChange = (qId, idx, value) => {
    setAnswers(prev => {
      const arr = [...prev[qId]];
      arr[idx] = value;
      return { ...prev, [qId]: arr };
    });
  };

  const handleSubmit = async () => {
    try {
      const answerArr = Object.entries(answers).map(([questionId, response]) => ({ questionId, response }));
      const res = await fetch(`http://localhost:5000/api/forms/${form._id}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerArr }),
      });
      const data = await res.json();
      setResponse(data);
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit response");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">{form.title}</h1>
        {form.headerImage && <img src={form.headerImage} alt="Header" className="mx-auto mb-6 max-h-60" />}
        <form className="space-y-8">
          {form.questions.map((q, qIdx) => (
            <div key={q._id || q.id} className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="mb-2 flex items-center gap-4">
                <span className="font-semibold text-lg">Q{qIdx + 1} ({q.type})</span>
                {q.image && <img src={q.image} alt="Q" className="max-h-16" />}
              </div>
              <div className="mb-2 text-gray-800">{q.text}</div>
              {q.type === "categorize" ? (
                <DndContext
                  collisionDetection={closestCorners}
                  onDragStart={event => setActiveId(event.active.id)}
                  onDragEnd={event => {
                    const { active, over } = event;
                    if (!over) { setActiveId(null); return; }
                    const activeId = active.id;
                    const overId = over.id;
                    if (activeId === overId) { setActiveId(null); return; }
                    // Find which category the item is currently in (if any)
                    let currentCategory = null;
                    Object.entries(answers[q._id]).forEach(([cat, items]) => {
                      if (items.includes(activeId)) currentCategory = cat;
                    });
                    // Remove from current category
                    const newCatMap = { ...answers[q._id] };
                    if (currentCategory) {
                      newCatMap[currentCategory] = newCatMap[currentCategory].filter(id => id !== activeId);
                    }
                    // Add to new category
                    if (q.categories.includes(overId)) {
                      newCatMap[overId] = [...newCatMap[overId], activeId];
                    }
                    setAnswers(prev => ({ ...prev, [q._id]: newCatMap }));
                    setActiveId(null);
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Items Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-semibold mb-2 text-gray-700">Items</h2>
                      <SortableContext items={q.items.map(item => item.id)}>
                        {q.items.filter(item => {
                          // Not in any category
                          return !Object.values(answers[q._id]).flat().includes(item.id);
                        }).map(item => (
                          <DraggableItem key={item.id} id={item.id} item={item} disabled={submitted} />
                        ))}
                      </SortableContext>
                    </div>
                    {/* Categories Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-semibold mb-2 text-gray-700">Categories</h2>
                      <div className="space-y-4">
                        {q.categories.map(category => (
                          <DroppableCategory
                            key={category}
                            id={category}
                            items={q.items.filter(item => answers[q._id][category].includes(item.id))}
                            results={null}
                            submitted={submitted}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <DragOverlay>
                    {activeId ? (
                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg cursor-grabbing">
                        {q.items.find(item => item.id === activeId)?.text}
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              ) : null}
              {q.type === "cloze" && (
                <input
                  type="text"
                  className="border rounded-lg p-2 w-full"
                  value={answers[q._id] || ""}
                  onChange={e => handleClozeChange(q._id, e.target.value)}
                  placeholder="Type your answer..."
                />
              )}
              {q.type === "comprehension" && (
                <div>
                  {q.passage && <div className="mb-2 p-2 bg-gray-100 rounded">{q.passage}</div>}
                  {q.items.map((item, idx) => (
                    <div key={item.id} className="mb-2">
                      <div>{item.text}</div>
                      <input
                        type="text"
                        className="border rounded-lg p-2 w-full"
                        value={answers[q._id][idx] || ""}
                        onChange={e => handleComprehensionChange(q._id, idx, e.target.value)}
                        placeholder="Type your answer..."
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </form>
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
            disabled={submitted}
          >
            Submit
          </button>
        </div>
        {submitted && response && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">Thank you for submitting!</h2>
            <div className="text-xl mb-2">Score: {response.score} / {response.total}</div>
            <div className="text-lg">Percentage: {response.percentage}%</div>
          </div>
        )}
      </div>
    </div>
  );
// ...existing code...
}